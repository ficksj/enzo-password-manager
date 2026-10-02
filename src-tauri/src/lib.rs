mod vault;
mod bridge;

#[cfg(target_os = "windows")]
mod windows_hello;

use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, PhysicalPosition, Position, WebviewWindow,
};

fn position_flyout(window: &WebviewWindow) {
    if let Ok(Some(monitor)) = window.current_monitor() {
        let screen = monitor.size();
        let scale = monitor.scale_factor();
        let width = (440.0 * scale) as i32;
        let height = (640.0 * scale) as i32;
        let x = screen.width as i32 - width - (18.0 * scale) as i32;
        let y = screen.height as i32 - height - (48.0 * scale) as i32;
        let _ = window.set_position(Position::Physical(PhysicalPosition::new(x.max(0), y.max(0))));
    }
}

pub fn toggle_flyout(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            position_flyout(&window);
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

#[tauri::command]
fn toggle_window(app: AppHandle) { toggle_flyout(&app); }

#[tauri::command]
fn hide_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("main") { let _ = window.hide(); }
}

#[tauri::command]
fn show_window(app: AppHandle) { show_window_inner(&app); }

fn show_window_inner(app: &AppHandle) { if let Some(window) = app.get_webview_window("main") { position_flyout(&window); let _ = window.show(); let _ = window.set_focus(); } }

fn hide_window_inner(app: &AppHandle) { if let Some(window) = app.get_webview_window("main") { let _ = window.hide(); } }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(vault::VaultSession::default()))
        .invoke_handler(tauri::generate_handler![
            toggle_window, hide_window, show_window,
            vault::vault_exists, vault::create_vault, vault::unlock_vault,
            vault::lock_vault, vault::list_entries, vault::create_entry,
            vault::update_entry, vault::delete_entry, vault::change_pin,
            vault::export_vault, vault::import_vault,
            windows_hello::verify_windows_hello,
            windows_hello::windows_hello_enabled,
            vault::unlock_with_windows_hello,
            vault::enable_windows_hello,
            bridge::bridge_token,
        ])
        .setup(|app| {
            let bridge_token = bridge::start(&app.handle())?;
            app.manage(std::sync::Arc::new(bridge::BridgeState { token: bridge_token }));
            let show = MenuItem::with_id(app, "show", "Открыть Enzo", true, None::<&str>)?;
            let lock = MenuItem::with_id(app, "lock", "Заблокировать", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Выйти", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &lock, &quit])?;
            let icon = tauri::image::Image::from_app_icon_resource(32)?;
            TrayIconBuilder::new()
                .icon(icon)
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => { show_window_inner(app); }
                    "lock" => { let _ = app.emit("vault-lock", ()); hide_window_inner(app); }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event { toggle_flyout(&tray.app_handle()); }
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Enzo");
}
