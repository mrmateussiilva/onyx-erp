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
    .invoke_handler(tauri::generate_handler![get_clients, create_client, seed_db])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
