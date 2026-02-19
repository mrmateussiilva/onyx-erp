use sea_orm::{Database, DatabaseConnection, Schema};
use sea_orm::ConnectionTrait;
use std::fs;
use tauri::AppHandle;
use tauri::Manager;

pub mod entities;

pub async fn init_db(app_handle: &AppHandle) -> anyhow::Result<DatabaseConnection> {
    let app_dir = app_handle.path().app_data_dir()?;
    
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }
    
    let db_path = app_dir.join("aquagas.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());
    
    let db = Database::connect(&db_url).await?;
    
    // Inicialização simples de tabelas caso não existam
    setup_schema(&db).await?;
    
    Ok(db)
}

async fn setup_schema(db: &DatabaseConnection) -> anyhow::Result<()> {
    let builder = db.get_database_backend();
    let schema = Schema::new(builder);
    
    // Criar tabelas se elas não existirem
    let _ = db.execute(builder.build(schema.create_table_from_entity(entities::client::Entity).if_not_exists())).await;
    let _ = db.execute(builder.build(schema.create_table_from_entity(entities::sale::Entity).if_not_exists())).await;
    let _ = db.execute(builder.build(schema.create_table_from_entity(entities::user::Entity).if_not_exists())).await;
    let _ = db.execute(builder.build(schema.create_table_from_entity(entities::product::Entity).if_not_exists())).await;
    
    Ok(())
}
