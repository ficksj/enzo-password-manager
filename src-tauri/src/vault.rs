use aes_gcm::{aead::{Aead, KeyInit}, Aes256Gcm, Nonce};
use argon2::{Algorithm, Argon2, Params, Version};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf, sync::Mutex};
use tauri::{AppHandle, Manager, State};
use zeroize::Zeroizing;
#[cfg(target_os = "windows")]
use crate::windows_hello;

#[derive(Clone, Serialize, Deserialize)]
pub struct VaultEntry {
    pub id: String,
    pub name: String,
    pub domain: String,
    pub login: String,
    pub password: String,
    pub category: String,
    pub note: String,
}

#[derive(Clone, Default, Serialize, Deserialize)]
pub(crate) struct VaultData { pub(crate) entries: Vec<VaultEntry> }

#[derive(Serialize, Deserialize)]
struct Envelope { version: u8, salt: Vec<u8>, nonce: Vec<u8>, ciphertext: Vec<u8> }

#[derive(Default)]
pub struct VaultSession { pub(crate) key: Option<Zeroizing<Vec<u8>>>, pub(crate) salt: Option<Vec<u8>>, pub(crate) data: Option<VaultData> }

fn vault_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("vault.enzo"))
}

fn derive_key(pin: &str, salt: &[u8]) -> Result<Zeroizing<Vec<u8>>, String> {
    let params = Params::new(19 * 1024, 2, 1, Some(32)).map_err(|e| e.to_string())?;
    let argon = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut key = Zeroizing::new(vec![0u8; 32]);
    argon.hash_password_into(pin.as_bytes(), salt, &mut key).map_err(|e| e.to_string())?;
    Ok(key)
}

fn encrypt(data: &VaultData, key: &[u8], salt: Vec<u8>) -> Result<Envelope, String> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| e.to_string())?;
    let mut nonce = [0u8; 12]; OsRng.fill_bytes(&mut nonce);
    let plaintext = serde_json::to_vec(data).map_err(|e| e.to_string())?;
    let ciphertext = cipher.encrypt(Nonce::from_slice(&nonce), plaintext.as_ref()).map_err(|_| "Шифрование не удалось".to_string())?;
    Ok(Envelope { version: 1, salt, nonce: nonce.to_vec(), ciphertext })
}

fn decrypt(envelope: &Envelope, key: &[u8]) -> Result<VaultData, String> {
    if envelope.version != 1 || envelope.salt.len() != 16 || envelope.nonce.len() != 12 { return Err("Неподдерживаемый формат хранилища".into()); }
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| e.to_string())?;
    let plaintext = cipher.decrypt(Nonce::from_slice(&envelope.nonce), envelope.ciphertext.as_ref()).map_err(|_| "Неверный PIN-код".to_string())?;
    serde_json::from_slice(&plaintext).map_err(|_| "Хранилище повреждено".to_string())
}

fn persist(app: &AppHandle, data: &VaultData, key: &[u8], salt: Vec<u8>) -> Result<(), String> {
    let envelope = encrypt(data, key, salt)?;
    let bytes = serde_json::to_vec(&envelope).map_err(|e| e.to_string())?;
    let path = vault_path(app)?;
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, bytes).map_err(|e| e.to_string())?;
    fs::rename(tmp, path).map_err(|e| e.to_string())
}

pub(crate) fn persist_from_bridge(app: &AppHandle, data: &VaultData, key: &[u8], salt: Vec<u8>) -> Result<(), String> { persist(app, data, key, salt) }

#[tauri::command]
pub fn vault_exists(app: AppHandle) -> Result<bool, String> { Ok(vault_path(&app)?.exists()) }

#[tauri::command]
pub fn create_vault(app: AppHandle, pin: String, state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    if pin.len() < 4 || pin.len() > 64 { return Err("PIN должен содержать от 4 до 64 символов".into()); }
    if vault_exists(app.clone())? { return Err("Хранилище уже создано".into()); }
    let mut salt = [0u8; 16]; OsRng.fill_bytes(&mut salt);
    let key = derive_key(&pin, &salt)?;
    let data = VaultData::default();
    persist(&app, &data, &key, salt.to_vec())?;
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    session.key = Some(key); session.salt = Some(salt.to_vec()); session.data = Some(data); Ok(())
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub async fn enable_windows_hello(state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    if !crate::windows_hello::verify_windows_hello().await? { return Err("Windows Hello не подтвердил доступ".into()); }
    let session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    let key = session.key.as_ref().ok_or_else(|| "Сначала разблокируйте хранилище".to_string())?;
    crate::windows_hello::store_vault_key(key)
}

#[tauri::command]
pub fn unlock_vault(app: AppHandle, pin: String, state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    let bytes = fs::read(vault_path(&app)?).map_err(|_| "Хранилище не найдено".to_string())?;
    let envelope: Envelope = serde_json::from_slice(&bytes).map_err(|_| "Неверный файл хранилища".to_string())?;
    let key = derive_key(&pin, &envelope.salt)?;
    let data = decrypt(&envelope, &key)?;
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    session.key = Some(key); session.salt = Some(envelope.salt); session.data = Some(data); Ok(())
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub async fn unlock_with_windows_hello(app: AppHandle, state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    let verified = crate::windows_hello::verify_windows_hello().await?;
    if !verified { return Err("Windows Hello не подтвердил доступ".into()); }
    let key = windows_hello::load_vault_key()?;
    let bytes = fs::read(vault_path(&app)?).map_err(|_| "Хранилище не найдено".to_string())?;
    let envelope: Envelope = serde_json::from_slice(&bytes).map_err(|_| "Неверный файл хранилища".to_string())?;
    let data = decrypt(&envelope, &key)?;
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    session.key = Some(Zeroizing::new(key)); session.salt = Some(envelope.salt); session.data = Some(data); Ok(())
}

#[tauri::command]
pub fn lock_vault(state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    session.key = None; session.salt = None; session.data = None; Ok(())
}

#[tauri::command]
pub fn list_entries(state: State<'_, Mutex<VaultSession>>) -> Result<Vec<VaultEntry>, String> {
    let session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    session.data.as_ref().map(|data| data.entries.clone()).ok_or_else(|| "Хранилище заблокировано".into())
}

#[tauri::command]
pub fn create_entry(app: AppHandle, entry: VaultEntry, state: State<'_, Mutex<VaultSession>>) -> Result<VaultEntry, String> {
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    let key = session.key.as_ref().ok_or_else(|| "Хранилище заблокировано".to_string())?.clone();
    let salt = session.salt.clone().ok_or_else(|| "Хранилище заблокировано".to_string())?;
    let data = session.data.as_mut().ok_or_else(|| "Хранилище заблокировано".to_string())?;
    data.entries.push(entry.clone());
    persist(&app, data, &key, salt)?;
    Ok(entry)
}

#[tauri::command]
pub fn update_entry(app: AppHandle, entry: VaultEntry, state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    let key = session.key.as_ref().ok_or_else(|| "Хранилище заблокировано".to_string())?.clone();
    let salt = session.salt.clone().ok_or_else(|| "Хранилище заблокировано".to_string())?;
    let data = session.data.as_mut().ok_or_else(|| "Хранилище заблокировано".to_string())?;
    let item = data.entries.iter_mut().find(|item| item.id == entry.id).ok_or_else(|| "Запись не найдена".to_string())?;
    *item = entry;
    persist(&app, data, &key, salt)
}

#[tauri::command]
pub fn delete_entry(app: AppHandle, id: String, state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    let key = session.key.as_ref().ok_or_else(|| "Хранилище заблокировано".to_string())?.clone();
    let salt = session.salt.clone().ok_or_else(|| "Хранилище заблокировано".to_string())?;
    let data = session.data.as_mut().ok_or_else(|| "Хранилище заблокировано".to_string())?;
    data.entries.retain(|item| item.id != id);
    persist(&app, data, &key, salt)
}

#[tauri::command]
pub fn change_pin(app: AppHandle, pin: String, state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    if pin.len() < 4 || pin.len() > 64 { return Err("PIN должен содержать от 4 до 64 символов".into()); }
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    let data = session.data.as_ref().ok_or_else(|| "Хранилище заблокировано".to_string())?.clone();
    let mut salt = [0u8; 16]; OsRng.fill_bytes(&mut salt);
    let key = derive_key(&pin, &salt)?;
    persist(&app, &data, &key, salt.to_vec())?;
    session.key = Some(key); session.salt = Some(salt.to_vec()); Ok(())
}

#[tauri::command]
pub fn export_vault(app: AppHandle, destination: String) -> Result<(), String> { fs::copy(vault_path(&app)?, destination).map(|_| ()).map_err(|e| e.to_string()) }

#[tauri::command]
pub fn import_vault(app: AppHandle, source: String, state: State<'_, Mutex<VaultSession>>) -> Result<(), String> {
    let bytes = fs::read(source).map_err(|e| e.to_string())?;
    let _: Envelope = serde_json::from_slice(&bytes).map_err(|_| "Неверная резервная копия".to_string())?;
    fs::write(vault_path(&app)?, bytes).map_err(|e| e.to_string())?;
    let mut session = state.lock().map_err(|_| "Сессия заблокирована".to_string())?;
    session.key = None; session.salt = None; session.data = None; Ok(())
}
