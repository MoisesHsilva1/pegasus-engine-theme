import type { PackageStatus } from '@shared/types'

export class PackageService {
  async listPackages(): Promise<PackageStatus[]> {
    return [
      { name: 'gnome-tweaks', installed: true, source: 'dnf', version: '46.0' },
      { name: 'alacritty', installed: true, source: 'dnf', version: '0.13.2' },
      {
        name: 'com.mattjakeman.ExtensionManager',
        installed: true,
        source: 'flatpak',
        version: '0.5.1',
      },
    ]
  }
}
