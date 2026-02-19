use sea_orm::{DatabaseConnection, PaginatorTrait};
use tauri::{Manager, State};

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
async fn seed_db(db: State<'_, DatabaseConnection>) -> Result<String, String> {
    use sea_orm::{ActiveModelTrait, Set, EntityTrait};
    use chrono::Utc;

    let count = db::entities::client::Entity::find().count(db.inner()).await.map_err(|e: sea_orm::DbErr| e.to_string())?;
    
    if count == 0 {
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
        create_sale
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
