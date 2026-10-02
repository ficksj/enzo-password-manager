<div align="center">

# Enzo

### Local-first password manager for Windows

Secure vault, fast password generation, Windows Hello, and a compact tray flyout in one focused desktop app.

[![Build](https://github.com/ficksj/enzo-password-manager/actions/workflows/release.yml/badge.svg)](https://github.com/ficksj/enzo-password-manager/actions/workflows/release.yml)
[![Latest Release](https://img.shields.io/github/v/release/ficksj/enzo-password-manager?display_name=tag&color=ff0033&label=release)](https://github.com/ficksj/enzo-password-manager/releases)
[![License](https://img.shields.io/badge/license-MIT-ff0033.svg)](LICENSE)

<br />

**Enzo stays close.** Open it from the system tray, keep it above your windows, copy what you need, and send it back to the tray.

</div>

## Highlights

| | | |
|:---:|:---:|:---:|
| **Encrypted vault**<br />Argon2id + AES-256-GCM | **Windows Hello**<br />Biometric unlock via Credential Manager | **Tray flyout**<br />Always-on-top compact workspace |
| **Password generator**<br />8-64 characters with entropy feedback | **Clipboard control**<br />Automatic cleanup with configurable timer | **Zero cloud dependency**<br />Your vault stays on your device |

## Download

Get the latest Windows installer from the [Releases page](https://github.com/ficksj/enzo-password-manager/releases).

- `Enzo_*_x64-setup.exe` for the standard Windows setup experience.
- `Enzo_*_x64_en-US.msi` for MSI-based deployment.

## Development

### Requirements

- Windows 10 or Windows 11
- Node.js 20+
- Rust stable with the `stable-x86_64-pc-windows-msvc` toolchain
- Visual Studio Build Tools with **Desktop development with C++** and Windows SDK
- WebView2 Runtime

### Run locally

```powershell
npm install
npm run tauri dev
```

### Build Windows installers

```powershell
npm run tauri build
```

Output is written to `src-tauri/target/release/bundle/`.

## Security model

Enzo derives a 256-bit key from the local master PIN with Argon2id and encrypts the vault using AES-256-GCM. The active key is held only for the unlocked session and cleared when the vault is locked. Windows Hello can protect a device-bound copy of the vault key using Windows Credential Manager.

The project is local-first. No account or cloud sync is required.

## Project status

Enzo is an early Windows desktop release. The core vault, tray workflow, PIN unlock, Windows Hello, generator, clipboard cleanup, and installer pipeline are implemented. Browser bridge and automatic form filling are planned next.

## License

Enzo is released under the [MIT License](LICENSE).
