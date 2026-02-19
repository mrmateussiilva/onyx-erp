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
    let _ = db.execute(builder.build(schema.create_table_from_entity(entities::shipping_method::Entity).if_not_exists())).await;
    let _ = db.execute(builder.build(schema.create_table_from_entity(entities::payment_method::Entity).if_not_exists())).await;

    // Garantir usuário admin inicial
    use sea_orm::{EntityTrait, PaginatorTrait, ActiveModelTrait, Set};
    use bcrypt::{hash, DEFAULT_COST};
    
    let user_count = entities::user::Entity::find().count(db).await.unwrap_or(0);
    if user_count == 0 {
        let admin_password = hash("admin123", DEFAULT_COST).unwrap();
        let admin = entities::user::ActiveModel {
            username: Set("admin".into()),
            password_hash: Set(admin_password),
            name: Set("Administrador".into()),
            role: Set("admin".into()),
            ..Default::default()
        };
        let _ = admin.insert(db).await;
    }

    // Sementes de Formas de Envio
    let shipping_count = entities::shipping_method::Entity::find().count(db).await.unwrap_or(0);
    if shipping_count == 0 {
        let methods = vec![
            ("Retirada no Local", 0.0),
            ("Entrega Padrão", 5.0),
            ("Entrega Expressa", 10.0),
        ];
        for (name, fee) in methods {
            let m = entities::shipping_method::ActiveModel {
                name: Set(name.into()),
                fee: Set(fee),
                ..Default::default()
            };
            let _ = m.insert(db).await;
        }
    }

    // Sementes de Formas de Pagamento
    let payment_count = entities::payment_method::Entity::find().count(db).await.unwrap_or(0);
    if payment_count == 0 {
        let methods = vec!["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Fiado"];
        for name in methods {
            let m = entities::payment_method::ActiveModel {
                name: Set(name.into()),
                ..Default::default()
            };
            let _ = m.insert(db).await;
        }
    }
    
    Ok(())
}
