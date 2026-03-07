mod composition;
mod vault_commands;

use std::sync::Mutex;

use composition::VaultSession;

/// App-held vault session. Commands take this state and invoke our composition.
pub struct VaultState(pub Mutex<Option<VaultSession>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(VaultState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            vault_commands::open_vault,
            vault_commands::init_vault,
            vault_commands::add_block,
            vault_commands::list_blocks,
            vault_commands::rename_block,
            vault_commands::mutate_content,
            vault_commands::delete_block,
            vault_commands::add_edge,
            vault_commands::remove_edge,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
