//! App-local settings commands. Client preference state (last vault path)
//! lives in the app config dir — never inside a vault (see src/ARCHITECTURE.md).

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Default, Serialize, Deserialize)]
struct AppSettings {
    last_vault_path: Option<String>,
}

fn settings_file(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("settings.json"))
}

fn read_settings(app: &tauri::AppHandle) -> AppSettings {
    settings_file(app)
        .ok()
        .and_then(|path| fs::read_to_string(path).ok())
        .and_then(|raw| serde_json::from_str(&raw).ok())
        .unwrap_or_default()
}

/// Read the last successfully opened vault path, if any.
#[tauri::command]
pub fn get_last_vault_path(app: tauri::AppHandle) -> Result<Option<String>, String> {
    Ok(read_settings(&app).last_vault_path)
}

/// Persist (or clear, with `None`) the last successfully opened vault path.
#[tauri::command]
pub fn set_last_vault_path(
    app: tauri::AppHandle,
    path: Option<String>,
) -> Result<(), String> {
    let file = settings_file(&app)?;
    if let Some(dir) = file.parent() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let mut settings = read_settings(&app);
    settings.last_vault_path = path;
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&file, json).map_err(|e| e.to_string())?;
    Ok(())
}
