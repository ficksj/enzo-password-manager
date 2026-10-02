use windows::{core::{HSTRING, PWSTR}, Security::Credentials::UI::{UserConsentVerifier, UserConsentVerifierAvailability, UserConsentVerificationResult}, Win32::Security::Credentials::{CredFree, CredReadW, CredWriteW, CREDENTIALW, CRED_PERSIST_LOCAL_MACHINE, CRED_TYPE_GENERIC}};

const TARGET: &str = "Enzo/VaultKey";

pub fn store_vault_key(key: &[u8]) -> Result<(), String> {
    let mut target: Vec<u16> = TARGET.encode_utf16().chain(std::iter::once(0)).collect();
    let mut credential = CREDENTIALW::default();
    credential.Type = CRED_TYPE_GENERIC;
    credential.TargetName = PWSTR(target.as_mut_ptr());
    credential.CredentialBlobSize = key.len() as u32;
    credential.CredentialBlob = key.as_ptr() as *mut u8;
    credential.Persist = CRED_PERSIST_LOCAL_MACHINE;
    unsafe { CredWriteW(&credential, 0).map_err(|e| format!("Не удалось сохранить ключ Windows: {e}")) }
}

pub fn load_vault_key() -> Result<Vec<u8>, String> {
    let mut target: Vec<u16> = TARGET.encode_utf16().chain(std::iter::once(0)).collect();
    let mut raw: *mut CREDENTIALW = std::ptr::null_mut();
    unsafe {
        CredReadW(PWSTR(target.as_mut_ptr()), CRED_TYPE_GENERIC, None, &mut raw).map_err(|e| format!("Ключ Windows Hello не настроен: {e}"))?;
        let value = std::slice::from_raw_parts((*raw).CredentialBlob, (*raw).CredentialBlobSize as usize).to_vec();
        CredFree(raw.cast());
        Ok(value)
    }
}

pub fn has_vault_key() -> bool {
    load_vault_key().is_ok()
}

#[tauri::command]
pub fn windows_hello_enabled() -> bool { has_vault_key() }

#[tauri::command]
pub async fn verify_windows_hello() -> Result<bool, String> {
    let availability = UserConsentVerifier::CheckAvailabilityAsync()
        .map_err(|e| format!("Windows Hello недоступен: {e}"))?
        .await
        .map_err(|e| format!("Не удалось проверить Windows Hello: {e}"))?;

    if availability != UserConsentVerifierAvailability::Available {
        return Err(format!("Windows Hello недоступен: {availability:?}"));
    }

    let message = HSTRING::from("Подтвердите доступ к Enzo");
    let result = UserConsentVerifier::RequestVerificationAsync(&message)
        .map_err(|e| format!("Не удалось запустить Windows Hello: {e}"))?
        .await
        .map_err(|e| format!("Windows Hello завершился с ошибкой: {e}"))?;

    if result == UserConsentVerificationResult::Verified {
        Ok(true)
    } else {
        Err(format!("Windows Hello не подтвердил доступ: {result:?}"))
    }
}
