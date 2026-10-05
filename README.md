<div align="center">

# Enzo

### Local-first password manager for Windows

Secure vault, fast password generation, Windows Hello, and a compact tray flyout in one focused desktop app.

[Product website](https://ficksj.github.io/enzo-password-manager/) · [Download latest release](https://github.com/ficksj/enzo-password-manager/releases/latest) · [View source](https://github.com/ficksj/enzo-password-manager)

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

Enzo is an early Windows desktop release. The core vault, tray workflow, PIN unlock, Windows Hello, generator, clipboard cleanup, browser bridge, autofill, save prompt, and installer pipeline are implemented.

## Release history

- **v0.2.2**: styled desktop scrollbar, fixed password strength states, added RU/EN switching inside the app, and aligned flyout navigation and entry controls.
- **v0.2.1**: added login-form detection, save-to-Enzo prompt, improved autofill field matching, and the MV3 background bridge worker.
- **v0.2.0**: added the Chrome/Edge companion extension, local bridge API, domain matching, autofill, and browser password generation.
- **v0.1.0**: first release with encrypted vault, Windows Hello, tray flyout, generator, clipboard cleanup, and Windows installers.

## Browser extension preview

The `extension/` directory contains a Chrome/Edge Manifest V3 companion. It connects to Enzo over the local bridge at `127.0.0.1:48152` and supports matching credentials, autofill, saving credentials through the bridge API, and password generation.

### Load locally

1. Start and unlock Enzo.
2. Open **Settings → Local bridge** and copy the extension token.
3. Open `chrome://extensions` or `edge://extensions`.
4. Enable **Developer mode** and select **Load unpacked**.
5. Choose the repository `extension/` directory and paste the token into the Enzo extension popup.

The browser extension is an early companion preview. It only receives credentials while the Enzo vault is unlocked. When a login form is submitted, it can offer to save the new credential back into Enzo.

## License

Enzo is released under the [MIT License](LICENSE).
