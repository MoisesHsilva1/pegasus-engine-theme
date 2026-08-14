# Pegasus Engine Theme — Installation & Uninstallation Guide

This document provides step-by-step instructions for installing, running, and uninstalling **Pegasus Engine Theme** on Fedora Linux and other compatible Linux distributions.

---

## System Requirements

- **Operating System**: Fedora Linux 38+ (Workstation edition recommended)
- **Desktop Environment**: GNOME 40+
- **Architecture**: x86_64
- **Runtime Dependencies**:
  - `gtk3`
  - `libnotify`
  - `nss`
  - `xdg-utils`
  - `at-spi2-core`

---

## Installation Options

### 1. tar.gz Package (Linux Binary Archive)

The application is distributed as a pre-compiled Linux binary packaged in a `.tar.gz` archive.

> [!IMPORTANT]
> **Source Code vs. Compiled Binary Warning**
>
> On the GitHub Releases page, make sure to download the compiled release package (e.g., **`pegasus-engine-theme-0.1.1.tar.gz`** under the "Assets" section) and **NOT** the automatic **Source code (tar.gz)** or **Source code (zip)** archives.
>
> - **How to tell if you downloaded the WRONG archive**: If you extract the file and see folders like `src`, `tests`, `docs` and files like `package.json`, `pnpm-lock.yaml`, you downloaded the raw development source code. It **does not** contain the pre-compiled executable binary and cannot be run directly via `./pegasus-engine-theme`.
> - **Correct Release Structure**: The correct compiled release archive contains the executable binary **`pegasus-engine-theme`** directly in the root of the extracted folder, along with its Electron support files, and no developer configuration files (like `eslint.config.js` or `tsconfig.json`).

#### Installation & Execution

1. Download the compiled `pegasus-engine-theme-0.1.1.tar.gz` package from the Releases page.
2. Extract the archive in your preferred directory:
   ```bash
   tar -xzf pegasus-engine-theme-0.1.1.tar.gz
   ```
3. Navigate to the extracted directory:
   ```bash
   cd pegasus-engine-theme
   ```
4. Run the application:
   ```bash
   ./pegasus-engine-theme
   ```

---

## Launching the Application

After installing via RPM or running via AppImage:

### From GNOME Desktop Launcher

1. Press `Super` (Windows Key) to open GNOME Overview.
2. Type **Pegasus Engine Theme**.
3. Click the application icon to launch.

### From Terminal

If installed via RPM:

```bash
pegasus-engine-theme
```

## Uninstallation Guide

To uninstall, simply delete the extracted `pegasus-engine-theme` folder from your system.

## User Data & Configuration Files

When you run Pegasus Engine Theme, user preferences, theme overrides, and application states are stored locally in your home directory:

- **Theme Configuration**: `~/.config/pegasus/`
- **Application Local Data**: `~/.local/share/pegasus/`
- **Electron Cache & Storage**: `~/.config/Pegasus Engine Theme/`

If you wish to perform a total purge of the application and all personal configuration files, delete the extracted directory along with the folders mentioned above:

```bash
rm -rf ~/.config/pegasus ~/.local/share/pegasus "~/.config/Pegasus Engine Theme"
```

---

## Troubleshooting Issues

### Missing runtime dependencies

If you receive errors when running the application, make sure the required runtime dependencies are installed on your Fedora Linux system:

```bash
sudo dnf install -y gtk3 libnotify nss xdg-utils at-spi2-core
```
