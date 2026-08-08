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

### 1. Fedora RPM Package (Recommended Native Installation)

The RPM package provides complete system integration with GNOME Application Launcher, system binary path symlink (`/usr/bin/pegasus-engine-theme`), desktop entries, and high-resolution icons.

#### Installation Command

Navigate to the directory containing the generated `.rpm` package and run:

```bash
sudo dnf install ./Pegasus-Engine-Theme-0.1.0.x86_64.rpm
```

Alternatively, if using RPM directly:

```bash
sudo rpm -i ./Pegasus-Engine-Theme-0.1.0.x86_64.rpm
```

#### Installed Files Location

- **Application Directory**: `/opt/pegasus-engine-theme/`
- **Binary Symlink**: `/usr/bin/pegasus-engine-theme`
- **Desktop Launcher**: `/usr/share/applications/pegasus-engine-theme.desktop`
- **Application Icon**: `/usr/share/icons/hicolor/512x512/apps/pegasus-engine-theme.png`

---

### 2. AppImage Portable Package

The AppImage is a single self-contained executable package that runs without requiring system privileges or package manager installation.

#### Usage Instructions

1. Make the AppImage executable:

```bash
chmod +x ./Pegasus-Engine-Theme-0.1.0.AppImage
```

2. Run the application:

```bash
./Pegasus-Engine-Theme-0.1.0.AppImage
```

> **Note for systems without FUSE**: If your Linux distribution does not have `fuse2` installed, you can launch the AppImage with `--appimage-extract-and-run`:
> ```bash
> ./Pegasus-Engine-Theme-0.1.0.AppImage --appimage-extract-and-run
> ```

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

---

## Uninstallation Guide

### Removing the RPM Package

To remove the application binary and system launcher entries:

```bash
sudo dnf remove pegasus-engine-theme
```

---

## User Data & Configuration Files

When you run Pegasus Engine Theme, user preferences, theme overrides, and application states are stored locally in your home directory:

- **Theme Configuration**: `~/.config/pegasus/`
- **Application Local Data**: `~/.local/share/pegasus/`
- **Electron Cache & Storage**: `~/.config/Pegasus Engine Theme/`

> **Data Preservation Policy**: Uninstalling the RPM package (`sudo dnf remove pegasus-engine-theme`) will remove application binaries and system launchers, but **will NOT delete your personal configuration files** in your home directory.
>
> If you wish to perform a total purge of all personal configuration files, delete the following directories manually:
>
> ```bash
> rm -rf ~/.config/pegasus ~/.local/share/pegasus "~/.config/Pegasus Engine Theme"
> ```

---

## Troubleshooting Installation Issues

### Application icon does not appear in GNOME launcher immediately

Update GNOME desktop database and icon cache:

```bash
sudo update-desktop-database
sudo gtk-update-icon-cache /usr/share/icons/hicolor
```

### Dependency error during RPM installation

If `dnf` reports missing runtime dependencies:

```bash
sudo dnf install -y gtk3 libnotify nss xdg-utils at-spi2-core
```
