use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use std::{io::{Read, Write}, net::{TcpListener, TcpStream}, sync::{Arc, Mutex}, thread};
use tauri::{AppHandle, Manager, State};

use crate::vault::{VaultEntry, VaultSession};

#[derive(Clone)]
pub struct BridgeState { pub token: String }

#[derive(Deserialize)] struct SaveRequest { name: String, domain: String, login: String, password: String, category: Option<String>, note: Option<String> }
#[derive(Deserialize)] struct GenerateRequest { length: Option<usize>, upper: Option<bool>, lower: Option<bool>, numbers: Option<bool>, symbols: Option<bool> }
#[derive(Serialize)] struct CredentialResponse { id: String, name: String, domain: String, login: String, password: String }

pub fn start(app: &AppHandle) -> Result<String, String> {
    let mut bytes = [0u8; 24]; OsRng.fill_bytes(&mut bytes);
    let token = bytes.iter().map(|byte| format!("{byte:02x}")).collect::<String>();
    let state = Arc::new(BridgeState { token: token.clone() });
    let listener = TcpListener::bind("127.0.0.1:48152").map_err(|e| format!("Bridge не запустился: {e}"))?;
    let app_handle = app.clone();
    let bridge_state = state.clone();
    thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            let app = app_handle.clone();
            let bridge = bridge_state.clone();
            thread::spawn(move || handle(stream, &app, &bridge));
        }
    });
    Ok(token)
}

fn handle(mut stream: TcpStream, app: &AppHandle, bridge: &BridgeState) {
    let mut buffer = [0u8; 65536];
    let size = match stream.read(&mut buffer) { Ok(size) => size, Err(_) => return };
    let request = String::from_utf8_lossy(&buffer[..size]);
    let mut sections = request.split("\r\n\r\n");
    let head = sections.next().unwrap_or("");
    let body = sections.next().unwrap_or("");
    let mut lines = head.lines();
    let first = lines.next().unwrap_or("");
    let mut parts = first.split_whitespace();
    let method = parts.next().unwrap_or("");
    let path = parts.next().unwrap_or("");
    if method == "OPTIONS" { respond(&mut stream, 204, "{}"); return; }
    let auth = lines.find_map(|line| line.strip_prefix("Authorization: Bearer ").map(str::trim)).unwrap_or("");
    if auth != bridge.token { respond(&mut stream, 401, r#"{"error":"Unauthorized"}"#); return; }
    let result = match (method, path) {
        ("GET", "/health") => Ok(r#"{"ok":true,"app":"enzo"}"#.to_string()),
        ("POST", "/get-credentials") => get_credentials(app, body),
        ("POST", "/save-credential") => save_credential(app, body),
        ("POST", "/generate") => generate(body),
        _ => Err((404, "Not found".to_string())),
    };
    match result { Ok(payload) => respond(&mut stream, 200, &payload), Err((code, message)) => respond(&mut stream, code, &format!(r#"{{"error":"{}"}}"#, message.replace('"', "'"))) }
}

fn get_credentials(app: &AppHandle, body: &str) -> Result<String, (u16, String)> {
    let domain = serde_json::from_str::<serde_json::Value>(body).ok().and_then(|value| value.get("domain").and_then(|item| item.as_str()).map(str::to_lowercase)).unwrap_or_default();
    let state = app.state::<Mutex<VaultSession>>();
    let session = state.lock().map_err(|_| (500, "Session unavailable".into()))?;
    let data = session.data.as_ref().ok_or((423, "Vault is locked".into()))?;
    let result: Vec<CredentialResponse> = data.entries.iter().filter(|entry| domain.is_empty() || entry.domain.to_lowercase().contains(&domain) || domain.contains(&entry.domain.to_lowercase())).map(|entry| CredentialResponse { id: entry.id.clone(), name: entry.name.clone(), domain: entry.domain.clone(), login: entry.login.clone(), password: entry.password.clone() }).collect();
    serde_json::to_string(&result).map_err(|e| (500, e.to_string()))
}

fn save_credential(app: &AppHandle, body: &str) -> Result<String, (u16, String)> {
    let request: SaveRequest = serde_json::from_str(body).map_err(|e| (400, e.to_string()))?;
    let state = app.state::<Mutex<VaultSession>>();
    let mut session = state.lock().map_err(|_| (500, "Session unavailable".into()))?;
    let key = session.key.as_ref().ok_or((423, "Vault is locked".into()))?.clone();
    let salt = session.salt.clone().ok_or((500, "Vault salt unavailable".into()))?;
    let entry = VaultEntry { id: format!("bridge-{}", chrono_id()), name: request.name, domain: request.domain, login: request.login, password: request.password, category: request.category.unwrap_or_else(|| "web".into()), note: request.note.unwrap_or_default() };
    let data = session.data.as_mut().ok_or((423, "Vault is locked".into()))?;
    data.entries.push(entry.clone());
    crate::vault::persist_from_bridge(app, data, &key, salt).map_err(|e| (500, e))?;
    serde_json::to_string(&entry).map_err(|e| (500, e.to_string()))
}

fn generate(body: &str) -> Result<String, (u16, String)> {
    let request: GenerateRequest = serde_json::from_str(body).unwrap_or(GenerateRequest { length: None, upper: None, lower: None, numbers: None, symbols: None });
    let length = request.length.unwrap_or(20).clamp(8, 64);
    let mut pool = String::new(); if request.upper.unwrap_or(true) { pool.push_str("ABCDEFGHJKLMNPQRSTUVWXYZ") } if request.lower.unwrap_or(true) { pool.push_str("abcdefghijkmnopqrstuvwxyz") } if request.numbers.unwrap_or(true) { pool.push_str("23456789") } if request.symbols.unwrap_or(true) { pool.push_str("!@#$%^&*") } if pool.is_empty() { pool.push_str("abcdefghijklmnopqrstuvwxyz") }
    let mut random = vec![0u8; length]; OsRng.fill_bytes(&mut random); let chars: Vec<char> = pool.chars().collect(); let password: String = random.into_iter().map(|byte| chars[byte as usize % chars.len()]).collect(); Ok(format!(r#"{{"password":"{password}"}}"#))
}

fn chrono_id() -> u128 { std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|duration| duration.as_millis()).unwrap_or_default() }
fn respond(stream: &mut TcpStream, status: u16, body: &str) { let text = format!("HTTP/1.1 {status} OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Authorization, Content-Type\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}", body.len(), body); let _ = stream.write_all(text.as_bytes()); }

#[tauri::command]
pub fn bridge_token(state: State<'_, Arc<BridgeState>>) -> String { state.token.clone() }
