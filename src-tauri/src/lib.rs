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
    address: Option<String>,
) -> Result<db::entities::client::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    use chrono::Utc;

    let client = db::entities::client::ActiveModel {
        name: Set(name),
        phone: Set(phone),
        address: Set(address),
        created_at: Set(Utc::now().into()),
        ..Default::default()
    };

    client.insert(db.inner()).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_dashboard_stats(db: State<'_, DatabaseConnection>) -> Result<serde_json::Value, String> {
    use sea_orm::{EntityTrait, PaginatorTrait, QuerySelect};
    use chrono::Utc;

    let today = Utc::now().date_naive();
    let start_of_day = today.and_hms_opt(0, 0, 0).unwrap().and_utc();

    // Total de vendas hoje (exemplo simplificado)
    let sales_today = db::entities::sale::Entity::find()
        // .filter(db::entities::sale::Column::CreatedAt.gte(start_of_day)) // Precisaria configurar o filtro
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())?;

    let total_revenue: f64 = sales_today.iter().map(|s| s.total).sum();
    let sales_count = sales_today.len();
    
    let client_count = db::entities::client::Entity::find()
        .count(db.inner())
        .await
        .map_err(|e: sea_orm::DbErr| e.to_string())?;

    Ok(serde_json::json!({
        "revenue": format!("R$ {:.2}", total_revenue),
        "sales_count": sales_count,
        "client_count": client_count,
        "alerts": 0 // Placeholder por enquanto
    }))
}

#[tauri::command]
async fn get_recent_sales(db: State<'_, DatabaseConnection>) -> Result<Vec<db::entities::sale::Model>, String> {
    use sea_orm::{EntityTrait, QueryOrder, QuerySelect};
    db::entities::sale::Entity::find()
        .order_by_desc(db::entities::sale::Column::Id)
        .limit(5)
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_sales_report(
    db: State<'_, DatabaseConnection>,
    from_date: String,
    to_date: String,
    payment_method: String,
) -> Result<Vec<db::entities::sale::Model>, String> {
    use sea_orm::{EntityTrait, QueryFilter, ColumnTrait};
    
    // Simplificado por enquanto (sem filtros reais de data/pagamento no DB ainda)
    db::entities::sale::Entity::find()
        .all(db.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_sale(
    db: State<'_, DatabaseConnection>,
    client_id: i32,
    items: String,
    total: f64,
) -> Result<db::entities::sale::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    use chrono::Utc;

    let sale = db::entities::sale::ActiveModel {
        client_id: Set(client_id),
        items: Set(items),
        total: Set(total),
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
) -> Result<db::entities::product::Model, String> {
    use sea_orm::{ActiveModelTrait, Set};
    let product = db::entities::product::ActiveModel {
        name: Set(name),
        price: Set(price),
        stock_quantity: Set(stock_quantity),
        category: Set(category),
        ..Default::default()
    };
    product.insert(db.inner()).await.map_err(|e| e.to_string())
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
        seed_db, 
        get_dashboard_stats, 
        get_recent_sales,
        get_sales_report,
        create_sale,
        login,
        get_products,
        create_product,
        create_user,
        get_shipping_methods,
        create_shipping_method,
        get_payment_methods,
        create_payment_method
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
