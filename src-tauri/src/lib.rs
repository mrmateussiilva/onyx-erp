use sea_orm::{DatabaseConnection, PaginatorTrait, EntityTrait, QueryFilter, ColumnTrait, ActiveModelTrait, Set};
use tauri::{Manager, State};
use bcrypt::{hash, verify, DEFAULT_COST};

#[tauri::command]
async fn login(
    db: State<'_, DatabaseConnection>,
    username: String,
    password: String,
) -> Result<db::entities::user::Model, String> {
    let user = db::entities::user::Entity::find()
        .filter(db::entities::user::Column::Username.eq(username))
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Usuário não encontrado")?;

    if verify(password, &user.password_hash).map_err(|e| e.to_string())? {
        Ok(user)
    } else {
        Err("Senha incorreta".into())
    }
}

pub mod db;

#[tauri::command]
async fn get_clients(db: State<'_, DatabaseConnection>) -> Result<Vec<db::entities::client::Model>, String> {
    use sea_orm::EntityTrait;
    db::entities::client::Entity::find()
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_client(
    db: State<'_, DatabaseConnection>,
    name: String,
    phone: Option<String>,
    document: Option<String>,
    cep: Option<String>,
    city: Option<String>,
    state: Option<String>,
    address: Option<String>,
    observations: Option<String>,
) -> Result<db::entities::client::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    use chrono::Utc;

    let client = db::entities::client::ActiveModel {
        name: Set(name),
        phone: Set(phone),
        document: Set(document),
        cep: Set(cep),
        city: Set(city),
        state: Set(state),
        address: Set(address),
        observations: Set(observations),
        created_at: Set(Utc::now().into()),
        ..Default::default()
    };

    client.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_client(
    db: State<'_, DatabaseConnection>,
    id: i32,
    name: String,
    phone: Option<String>,
    document: Option<String>,
    cep: Option<String>,
    city: Option<String>,
    state: Option<String>,
    address: Option<String>,
    observations: Option<String>,
) -> Result<db::entities::client::Model, String> {
    use sea_orm::{ActiveModelTrait, Set, EntityTrait};
    
    let mut client: db::entities::client::ActiveModel = db::entities::client::Entity::find_by_id(id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Cliente não encontrado")?
        .into();

    client.name = Set(name);
    client.phone = Set(phone);
    client.document = Set(document);
    client.cep = Set(cep);
    client.city = Set(city);
    client.state = Set(state);
    client.address = Set(address);
    client.observations = Set(observations);

    client.update(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_dashboard_stats(db: State<'_, DatabaseConnection>) -> Result<serde_json::Value, String> {
    use sea_orm::{EntityTrait, PaginatorTrait, QueryFilter, ColumnTrait};
    use chrono::{Utc, Duration};

    let now = Utc::now();
    let today_start = now.date_naive().and_hms_opt(0, 0, 0).unwrap().and_local_timezone(Utc).unwrap();
    let yesterday_start = today_start - Duration::days(1);

    // Vendas hoje
    let sales_today = db::entities::sale::Entity::find()
        .filter(db::entities::sale::Column::CreatedAt.gte(today_start))
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    let revenue_today: f64 = sales_today.iter().map(|s| s.total).sum();
    let count_today = sales_today.len();

    // Vendas ontem
    let sales_yesterday = db::entities::sale::Entity::find()
        .filter(db::entities::sale::Column::CreatedAt.between(yesterday_start, today_start))
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    let revenue_yesterday: f64 = sales_yesterday.iter().map(|s| s.total).sum();
    let count_yesterday = sales_yesterday.len();

    let client_count = db::entities::client::Entity::find()
        .count(db.inner())
        .await
        .map_err(|e: sea_orm::DbErr| e.to_string())?;

    // Alertas (Estoque baixo < 10 + Galões vencendo em 30 dias)
    let low_stock_count = db::entities::product::Entity::find()
        .filter(db::entities::product::Column::StockQuantity.lt(10))
        .count(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    let expiring_gallons_count = db::entities::client_gallon::Entity::find()
        .filter(db::entities::client_gallon::Column::ExpirationDate.between(now, now + Duration::days(30)))
        .count(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    let total_alerts = low_stock_count + expiring_gallons_count;

    let calc_change_pct = |curr: f64, prev: f64| -> String {
        if prev == 0.0 { return if curr > 0.0 { "+100%".into() } else { "0%".into() }; }
        let change = ((curr - prev) / prev) * 100.0;
        format!("{}{:.0}%", if change >= 0.0 { "+" } else { "" }, change)
    };

    let calc_change_abs = |curr: usize, prev: usize| -> String {
        let diff = (curr as i32) - (prev as i32);
        format!("{}{}", if diff >= 0 { "+" } else { "" }, diff)
    };

    Ok(serde_json::json!({
        "revenue": format!("R$ {:.2}", revenue_today),
        "revenue_change": calc_change_pct(revenue_today, revenue_yesterday),
        "sales_count": count_today,
        "sales_change": calc_change_abs(count_today, count_yesterday),
        "client_count": client_count,
        "client_change": format!("+{}", client_count),
        "alerts": total_alerts
    }))
}

#[tauri::command]
async fn get_popular_products(db: State<'_, DatabaseConnection>) -> Result<Vec<db::entities::product::Model>, String> {
    use sea_orm::{EntityTrait, QueryOrder, QuerySelect};
    db::entities::product::Entity::find()
        .order_by_desc(db::entities::product::Column::StockQuantity)
        .limit(4)
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_expiring_gallons(db: State<'_, DatabaseConnection>) -> Result<serde_json::Value, String> {
    use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, QueryOrder};
    use chrono::Utc;

    let now = Utc::now();
    let month_away = now + chrono::Duration::days(30);

    let gallons = db::entities::client_gallon::Entity::find()
        .filter(db::entities::client_gallon::Column::ExpirationDate.between(now, month_away))
        .order_by_asc(db::entities::client_gallon::Column::ExpirationDate)
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for g in gallons {
        let client_name = db::entities::client::Entity::find_by_id(g.client_id)
            .one(db.inner())
            .await
            .unwrap_or(None)
            .map(|c| c.name)
            .unwrap_or_else(|| "Cliente desconhecido".to_string());
        
        result.push(serde_json::json!({
            "id": g.id,
            "client_name": client_name,
            "brand": g.brand,
            "expiration_date": g.expiration_date
        }));
    }

    Ok(serde_json::json!(result))
}

#[tauri::command]
async fn get_recent_sales(db: State<'_, DatabaseConnection>) -> Result<serde_json::Value, String> {
    use sea_orm::{EntityTrait, QueryOrder, QuerySelect};
    
    let sales = db::entities::sale::Entity::find()
        .order_by_desc(db::entities::sale::Column::Id)
        .limit(5)
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    let mut sales_with_names = Vec::new();
    for sale in sales {
        let client_name = db::entities::client::Entity::find_by_id(sale.client_id)
            .one(db.inner())
            .await
            .unwrap_or(None)
            .map(|c| c.name)
            .unwrap_or_else(|| "Cliente removido".to_string());

        sales_with_names.push(serde_json::json!({
            "id": sale.id,
            "client_name": client_name,
            "items": sale.items,
            "total": sale.total,
            "created_at": sale.created_at
        }));
    }

    Ok(serde_json::json!(sales_with_names))
}

#[tauri::command]
async fn get_client_details(
    db: State<'_, DatabaseConnection>,
    client_id: i32,
) -> Result<serde_json::Value, String> {
    use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, QueryOrder};
    
    let client = db::entities::client::Entity::find_by_id(client_id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Cliente não encontrado")?;

    let sales = db::entities::sale::Entity::find()
        .filter(db::entities::sale::Column::ClientId.eq(client_id))
        .order_by_desc(db::entities::sale::Column::Id)
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    let gallons = db::entities::client_gallon::Entity::find()
        .filter(db::entities::client_gallon::Column::ClientId.eq(client_id))
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "client": client,
        "historico": sales,
        "galoes": gallons,
        "totalPedidos": sales.len()
    }))
}

#[tauri::command]
async fn add_client_gallon(
    db: State<'_, DatabaseConnection>,
    client_id: i32,
    brand: String,
    expiration_date: String,
) -> Result<db::entities::client_gallon::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    use chrono::DateTime;

    let expiration = DateTime::parse_from_rfc3339(&expiration_date)
        .map_err(|e| format!("Data inválida: {}", e))?
        .with_timezone(&chrono::Utc);

    let gallon = db::entities::client_gallon::ActiveModel {
        client_id: Set(client_id),
        brand: Set(brand),
        expiration_date: Set(expiration.into()),
        ..Default::default()
    };

    gallon.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_sales_report(
    db: State<'_, DatabaseConnection>,
    start_iso: String,
    end_iso: String,
    payment_method: String,
) -> Result<serde_json::Value, String> {
    use sea_orm::{EntityTrait, QueryFilter, ColumnTrait, QueryOrder};
    use chrono::{DateTime, Utc, Duration};
    use std::collections::HashMap;

    let start_date = DateTime::parse_from_rfc3339(&start_iso)
        .map_err(|e| format!("Data de início inválida: {}", e))?
        .with_timezone(&Utc);
    
    let end_date = DateTime::parse_from_rfc3339(&end_iso)
        .map_err(|e| format!("Data final inválida: {}", e))?
        .with_timezone(&Utc);

    let duration = end_date.signed_duration_since(start_date);
    let prev_start = start_date - duration - Duration::seconds(1);
    let prev_end = start_date - Duration::seconds(1);

    // 1. Buscar vendas do período atual
    let mut query = db::entities::sale::Entity::find()
        .filter(db::entities::sale::Column::CreatedAt.between(start_date, end_date));
    
    if payment_method != "todos" {
        query = query.filter(db::entities::sale::Column::PaymentMethod.eq(payment_method.clone()));
    }

    let sales = query
        .order_by_desc(db::entities::sale::Column::CreatedAt)
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    // 2. Buscar vendas do período anterior (para comparação)
    let mut prev_query = db::entities::sale::Entity::find()
        .filter(db::entities::sale::Column::CreatedAt.between(prev_start, prev_end));
    
    if payment_method != "todos" {
        prev_query = prev_query.filter(db::entities::sale::Column::PaymentMethod.eq(payment_method));
    }

    let prev_sales = prev_query
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    // Cálculos Atuais
    let total_revenue: f64 = sales.iter().map(|s| s.total).sum();
    let sales_count = sales.len() as f64;
    let avg_ticket = if sales_count > 0.0 { total_revenue / sales_count } else { 0.0 };
    let unique_clients = sales.iter().map(|s| s.client_id).collect::<std::collections::HashSet<_>>().len();

    // Cálculos Anteriores
    let prev_revenue: f64 = prev_sales.iter().map(|s| s.total).sum();
    let prev_sales_count = prev_sales.len() as f64;
    let prev_avg_ticket = if prev_sales_count > 0.0 { prev_revenue / prev_sales_count } else { 0.0 };

    // Função para calcular %
    let calc_change = |curr: f64, prev: f64| -> String {
        if prev == 0.0 { return if curr > 0.0 { "+100%".into() } else { "0%".into() }; }
        let change = ((curr - prev) / prev) * 100.0;
        format!("{}{:.1}%", if change >= 0.0 { "+" } else { "" }, change)
    };

    // Dados para o Gráfico (agrupado por dia)
    let mut chart_map: HashMap<String, f64> = HashMap::new();
    for sale in &sales {
        let day = sale.created_at.date_naive().to_string();
        *chart_map.entry(day).or_insert(0.0) += sale.total;
    }
    let mut chart_data: Vec<_> = chart_map.into_iter().map(|(date, revenue)| {
        serde_json::json!({ "date": date, "revenue": revenue })
    }).collect();
    chart_data.sort_by_key(|v| v["date"].as_str().unwrap().to_string());

    // Nomes dos clientes
    let mut sales_with_names = Vec::new();
    for sale in sales {
        let client_name = db::entities::client::Entity::find_by_id(sale.client_id)
            .one(db.inner())
            .await
            .unwrap_or(None)
            .map(|c| c.name)
            .unwrap_or_else(|| "Cliente removido".to_string());

        sales_with_names.push(serde_json::json!({
            "id": sale.id,
            "client_name": client_name,
            "items": sale.items,
            "total": sale.total,
            "payment_method": sale.payment_method,
            "created_at": sale.created_at
        }));
    }

    Ok(serde_json::json!({
        "summary": {
            "revenue": { "value": format!("R$ {:.2}", total_revenue), "change": calc_change(total_revenue, prev_revenue) },
            "sales_count": { "value": sales_count.to_string(), "change": calc_change(sales_count, prev_sales_count) },
            "average_ticket": { "value": format!("R$ {:.2}", avg_ticket), "change": calc_change(avg_ticket, prev_avg_ticket) },
            "unique_clients": { "value": unique_clients.to_string(), "change": format!("+{}", unique_clients) }
        },
        "chart_data": chart_data,
        "sales_list": sales_with_names
    }))
}

#[tauri::command]
async fn create_sale(
    db: State<'_, DatabaseConnection>,
    client_id: i32,
    items: String,
    total: f64,
    payment_method: String,
) -> Result<db::entities::sale::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    use chrono::Utc;

    let sale = db::entities::sale::ActiveModel {
        client_id: Set(client_id),
        items: Set(items),
        total: Set(total),
        payment_method: Set(payment_method),
        created_at: Set(Utc::now().into()),
        ..Default::default()
    };

    sale.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_products(db: State<'_, DatabaseConnection>) -> Result<Vec<db::entities::product::Model>, String> {
    use sea_orm::EntityTrait;
    db::entities::product::Entity::find()
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_product(
    db: State<'_, DatabaseConnection>,
    name: String,
    price: f64,
    stock_quantity: i32,
    category: String,
    category_id: Option<i32>,
) -> Result<db::entities::product::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    let product = db::entities::product::ActiveModel {
        name: Set(name),
        price: Set(price),
        stock_quantity: Set(stock_quantity),
        category: Set(category),
        category_id: Set(category_id),
        ..Default::default()
    };
    product.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_product(
    db: State<'_, DatabaseConnection>,
    id: i32,
    name: String,
    price: f64,
    stock_quantity: i32,
    category: String,
    category_id: Option<i32>,
) -> Result<db::entities::product::Model, String> {
    use sea_orm::{ActiveModelTrait, Set, EntityTrait};
    let mut product: db::entities::product::ActiveModel = db::entities::product::Entity::find_by_id(id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Produto não encontrado")?
        .into();

    product.name = Set(name);
    product.price = Set(price);
    product.stock_quantity = Set(stock_quantity);
    product.category = Set(category);
    product.category_id = Set(category_id);
    product.update(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_product(db: State<'_, DatabaseConnection>, id: i32) -> Result<(), String> {
    use sea_orm::EntityTrait;
    db::entities::product::Entity::delete_by_id(id)
        .exec(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_categories(db: State<'_, DatabaseConnection>) -> Result<Vec<db::entities::category::Model>, String> {
    use sea_orm::EntityTrait;
    db::entities::category::Entity::find()
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_category(
    db: State<'_, DatabaseConnection>,
    name: String,
    description: Option<String>,
) -> Result<db::entities::category::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    let category = db::entities::category::ActiveModel {
        name: Set(name),
        description: Set(description),
        ..Default::default()
    };
    category.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_category(
    db: State<'_, DatabaseConnection>,
    id: i32,
    name: String,
    description: Option<String>,
) -> Result<db::entities::category::Model, String> {
    use sea_orm::{ActiveModelTrait, Set, EntityTrait};
    let mut category: db::entities::category::ActiveModel = db::entities::category::Entity::find_by_id(id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Categoria não encontrada")?
        .into();

    category.name = Set(name);
    category.description = Set(description);
    category.update(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_category(db: State<'_, DatabaseConnection>, id: i32) -> Result<(), String> {
    use sea_orm::EntityTrait;
    db::entities::category::Entity::delete_by_id(id)
        .exec(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn create_user(
    db: State<'_, DatabaseConnection>,
    username: String,
    password_plain: String,
    name: String,
    role: String,
) -> Result<db::entities::user::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    let password_hash = hash(password_plain, DEFAULT_COST).map_err(|e| e.to_string())?;
    let user = db::entities::user::ActiveModel {
        username: Set(username),
        password_hash: Set(password_hash),
        name: Set(name),
        role: Set(role),
        ..Default::default()
    };
    user.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_user(
    db: State<'_, DatabaseConnection>,
    id: i32,
    username: String,
    password_plain: Option<String>,
    name: String,
    role: String,
) -> Result<db::entities::user::Model, String> {
    use sea_orm::{ActiveModelTrait, Set, EntityTrait};
    let mut user: db::entities::user::ActiveModel = db::entities::user::Entity::find_by_id(id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Usuário não encontrado")?
        .into();

    user.username = Set(username);
    user.name = Set(name);
    user.role = Set(role);

    if let Some(plain) = password_plain {
        if !plain.is_empty() {
            let password_hash = hash(plain, DEFAULT_COST).map_err(|e| e.to_string())?;
            user.password_hash = Set(password_hash);
        }
    }

    user.update(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_users(db: State<'_, DatabaseConnection>) -> Result<Vec<db::entities::user::Model>, String> {
    db::entities::user::Entity::find()
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_user(db: State<'_, DatabaseConnection>, id: i32) -> Result<(), String> {
    db::entities::user::Entity::delete_by_id(id)
        .exec(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_shipping_methods(db: State<'_, DatabaseConnection>) -> Result<Vec<db::entities::shipping_method::Model>, String> {
    db::entities::shipping_method::Entity::find()
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_shipping_method(
    db: State<'_, DatabaseConnection>,
    name: String,
    fee: f64,
) -> Result<db::entities::shipping_method::Model, String> {
    let method = db::entities::shipping_method::ActiveModel {
        name: Set(name),
        fee: Set(fee),
        ..Default::default()
    };
    method.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_shipping_method(
    db: State<'_, DatabaseConnection>,
    id: i32,
    name: String,
    fee: f64,
) -> Result<db::entities::shipping_method::Model, String> {
    use sea_orm::{ActiveModelTrait, Set, EntityTrait};
    let mut method: db::entities::shipping_method::ActiveModel = db::entities::shipping_method::Entity::find_by_id(id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Método de envio não encontrado")?
        .into();

    method.name = Set(name);
    method.fee = Set(fee);
    method.update(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_shipping_method(db: State<'_, DatabaseConnection>, id: i32) -> Result<(), String> {
    use sea_orm::EntityTrait;
    db::entities::shipping_method::Entity::delete_by_id(id)
        .exec(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_payment_methods(db: State<'_, DatabaseConnection>) -> Result<Vec<db::entities::payment_method::Model>, String> {
    db::entities::payment_method::Entity::find()
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_payment_method(
    db: State<'_, DatabaseConnection>,
    name: String,
) -> Result<db::entities::payment_method::Model, String> {
    let method = db::entities::payment_method::ActiveModel {
        name: Set(name),
        ..Default::default()
    };
    method.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_payment_method(
    db: State<'_, DatabaseConnection>,
    id: i32,
    name: String,
) -> Result<db::entities::payment_method::Model, String> {
    use sea_orm::{ActiveModelTrait, Set, EntityTrait};
    let mut method: db::entities::payment_method::ActiveModel = db::entities::payment_method::Entity::find_by_id(id)
        .one(db.inner())
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Método de pagamento não encontrado")?
        .into();

    method.name = Set(name);
    method.update(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_payment_method(db: State<'_, DatabaseConnection>, id: i32) -> Result<(), String> {
    use sea_orm::EntityTrait;
    db::entities::payment_method::Entity::delete_by_id(id)
        .exec(db.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn seed_db(db: State<'_, DatabaseConnection>) -> Result<String, String> {
    use sea_orm::{ActiveModelTrait, Set, EntityTrait};
    use chrono::Utc;

    let count = db::entities::client::Entity::find().count(db.inner()).await.map_err(|e: sea_orm::DbErr| e.to_string())?;
    
    if count == 0 {
        // Criar usuário admin inicial
        let admin_password = hash("admin123", DEFAULT_COST).unwrap();
        let admin = db::entities::user::ActiveModel {
            username: Set("admin".into()),
            password_hash: Set(admin_password),
            name: Set("Administrador".into()),
            role: Set("admin".into()),
            ..Default::default()
        };
        admin.insert(db.inner()).await.map_err(|e| e.to_string())?;

        let clients = vec![
            ("Maria Silva", Some("(11) 98765-4321".into()), Some("Rua A, 123 - Centro".into())),
            ("João Santos", Some("(11) 91234-5678".into()), Some("Av. B, 456 - Jardins".into())),
            ("Ana Costa", Some("(11) 99876-5432".into()), Some("Rua C, 789 - Vila Nova".into())),
        ];

        for (name, phone, address) in clients {
            let client = db::entities::client::ActiveModel {
                name: Set(name.to_string()),
                phone: Set(phone),
                address: Set(address),
                created_at: Set(Utc::now().into()),
                ..Default::default()
            };
            let _ = client.insert(db.inner()).await.map_err(|e: sea_orm::DbErr| e.to_string())?;
        }
        Ok("Dados iniciais criados com sucesso!".into())
    } else {
        Ok("Banco de dados já contém dados.".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_log::Builder::default().build())
    .setup(|app| {
        let handle = app.handle().clone();
        tauri::async_runtime::block_on(async move {
            match db::init_db(&handle).await {
                Ok(connection) => {
                    handle.manage(connection);
                    log::info!("Database initialized and managed.");
                }
                Err(e) => {
                    log::error!("Failed to initialize database: {}", e);
                }
            }
        });
        Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        get_clients, 
        create_client, 
        update_client,
        seed_db, 
        get_dashboard_stats, 
        get_recent_sales,
        get_sales_report,
        create_sale,
        login,
        get_products,
        create_product,
        update_product,
        delete_product,
        create_user,
        update_user,
        get_users,
        delete_user,
        get_shipping_methods,
        create_shipping_method,
        update_shipping_method,
        delete_shipping_method,
        get_payment_methods,
        create_payment_method,
        update_payment_method,
        delete_payment_method,
        get_client_details,
        add_client_gallon,
        get_categories,
        create_category,
        update_category,
        delete_category,
        get_popular_products,
        get_expiring_gallons
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
