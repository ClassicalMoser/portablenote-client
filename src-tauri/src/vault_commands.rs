//! Tauri commands that invoke the in-app vault composition (core + infra).

use std::path::PathBuf;

use portablenote_core::domain::types::Block;
use tauri::State;
use uuid::Uuid;

use crate::composition::VaultSession;
use crate::VaultState;

fn parse_uuid(s: &str) -> Result<Uuid, String> {
    Uuid::parse_str(s).map_err(|e| e.to_string())
}

fn with_session<F, T>(state: &State<VaultState>, f: F) -> Result<T, String>
where
    F: FnOnce(&mut VaultSession) -> Result<T, String>,
{
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    let session = guard
        .as_mut()
        .ok_or("No vault open. Call open_vault or init_vault first.")?;
    f(session)
}

/// Open an existing vault at the given path.
#[tauri::command]
pub fn open_vault(state: State<VaultState>, path: String) -> Result<(), String> {
    let path = PathBuf::from(path);
    let session = VaultSession::open(&path).map_err(|e| e.to_string())?;
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    *guard = Some(session);
    Ok(())
}

/// Initialize a new empty vault at the given path.
#[tauri::command]
pub fn init_vault(state: State<VaultState>, path: String) -> Result<(), String> {
    let path = PathBuf::from(path);
    VaultSession::init(&path).map_err(|e| e.to_string())?;
    let session = VaultSession::open(&path).map_err(|e| e.to_string())?;
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;
    *guard = Some(session);
    Ok(())
}

/// Add a new block.
#[tauri::command]
pub fn add_block(
    state: State<VaultState>,
    name: String,
    content: String,
) -> Result<(), String> {
    with_session(&state, |s| {
        s.add_block(&name, &content).map_err(|e| e.to_string())
    })
}

/// List all blocks, sorted by name.
#[tauri::command]
pub fn list_blocks(state: State<VaultState>) -> Result<Vec<Block>, String> {
    with_session(&state, |s| Ok(s.list_blocks()))
}

/// Rename a block.
#[tauri::command]
pub fn rename_block(
    state: State<VaultState>,
    block_id: String,
    new_name: String,
) -> Result<(), String> {
    let id = parse_uuid(&block_id)?;
    with_session(&state, |s| s.rename_block(id, &new_name).map_err(|e| e.to_string()))
}

/// Update a block's content.
#[tauri::command]
pub fn mutate_content(
    state: State<VaultState>,
    block_id: String,
    content: String,
) -> Result<(), String> {
    let id = parse_uuid(&block_id)?;
    with_session(&state, |s| s.mutate_content(id, &content).map_err(|e| e.to_string()))
}

/// Delete a block (safe or cascade).
#[tauri::command]
pub fn delete_block(
    state: State<VaultState>,
    block_id: String,
    cascade: bool,
) -> Result<(), String> {
    let id = parse_uuid(&block_id)?;
    with_session(&state, |s| s.delete_block(id, cascade).map_err(|e| e.to_string()))
}

/// Add a reference edge between two blocks.
#[tauri::command]
pub fn add_edge(
    state: State<VaultState>,
    source: String,
    target: String,
) -> Result<(), String> {
    let source_id = parse_uuid(&source)?;
    let target_id = parse_uuid(&target)?;
    with_session(&state, |s| s.add_edge(source_id, target_id).map_err(|e| e.to_string()))
}

/// Remove a reference edge.
#[tauri::command]
pub fn remove_edge(state: State<VaultState>, edge_id: String) -> Result<(), String> {
    let id = parse_uuid(&edge_id)?;
    with_session(&state, |s| s.remove_edge(id).map_err(|e| e.to_string()))
}
