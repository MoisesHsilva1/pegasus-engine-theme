import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const pkgPath = path.join(projectRoot, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

const name = pkg.name || 'pegasus-engine-theme'
const version = pkg.version || '0.1.0'
const description = pkg.description || 'Pegasus Engine Theme desktop application'
const author = pkg.author || 'Pegasus Engine Theme Team <dev@pegasus-engine.local>'
const homepage = pkg.homepage || 'https://github.com/MoisesHsilva1/pegasus-theme'

const releaseDir = path.join(projectRoot, 'release')
const unpackedDir = path.join(releaseDir, 'linux-unpacked')
const iconPath = path.join(projectRoot, 'resources/icons/icon.png')

if (!fs.existsSync(unpackedDir)) {
  console.error(`Error: Unpacked application directory not found at ${unpackedDir}`)
  console.error('Please run electron-builder --linux unpacked first.')
  process.exit(1)
}

if (!fs.existsSync(iconPath)) {
  console.error(`Error: Application icon not found at ${iconPath}`)
  process.exit(1)
}

const topdir = path.join('/tmp', `pegasus-rpm-build-${Date.now()}`)
if (fs.existsSync(topdir)) {
  fs.rmSync(topdir, { recursive: true, force: true })
}

fs.mkdirSync(path.join(topdir, 'BUILD'), { recursive: true })
fs.mkdirSync(path.join(topdir, 'RPMS'), { recursive: true })
fs.mkdirSync(path.join(topdir, 'SOURCES'), { recursive: true })
fs.mkdirSync(path.join(topdir, 'SPECS'), { recursive: true })
fs.mkdirSync(path.join(topdir, 'SRPMS'), { recursive: true })

const specContent = `%define __os_install_post %{nil}
%define _build_id_links none
%define _unpackaged_files_terminate_build 0
%define __check_files %{nil}

Name:           ${name}
Version:        ${version}
Release:        1%{?dist}
Summary:        ${pkg.productName || 'Pegasus Engine Theme'}

License:        ${pkg.license || 'MIT'}
URL:            ${homepage}

AutoReqProv:    no
Requires:       gtk3, libnotify, nss, xdg-utils, at-spi2-core

%description
${description}

%prep

%build

%install
rm -rf %{buildroot}
mkdir -p %{buildroot}/opt/${name}
mkdir -p %{buildroot}/usr/share/applications
mkdir -p %{buildroot}/usr/share/icons/hicolor/512x512/apps
mkdir -p %{buildroot}/usr/bin

cp -r "${unpackedDir}"/* %{buildroot}/opt/${name}/
cp "${iconPath}" %{buildroot}/usr/share/icons/hicolor/512x512/apps/${name}.png
ln -sf /opt/${name}/${name} %{buildroot}/usr/bin/${name}

cat <<EOF > %{buildroot}/usr/share/applications/${name}.desktop
[Desktop Entry]
Name=${pkg.productName || 'Pegasus Engine Theme'}
Comment=${description}
Exec=/opt/${name}/${name} %U
Icon=${name}
Terminal=false
Type=Application
Categories=System;Settings;Utility;
EOF

%files
/opt/${name}
/usr/share/applications/${name}.desktop
/usr/share/icons/hicolor/512x512/apps/${name}.png
/usr/bin/${name}

%changelog
* Fri Aug 07 2026 ${author} - ${version}-1
- Automatic build package for version ${version}
`

const specPath = path.join(topdir, 'SPECS', `${name}.spec`)
fs.writeFileSync(specPath, specContent, 'utf8')

console.log(`Building Fedora RPM package v${version} via rpmbuild...`)

const env = { ...process.env }
const localCompatBin = path.join(projectRoot, '.lib-compat/usr/bin')
const localCompatLib = path.join(projectRoot, '.lib-compat/usr/lib64')

if (fs.existsSync(localCompatBin)) {
  env.PATH = `${localCompatBin}:${env.PATH || ''}`
}
if (fs.existsSync(localCompatLib)) {
  env.LD_LIBRARY_PATH = `${localCompatLib}:${env.LD_LIBRARY_PATH || ''}`
}

try {
  execSync(`rpmbuild -bb --define "_topdir ${topdir}" "${specPath}"`, {
    stdio: 'inherit',
    env,
  })

  const rpmsDir = path.join(topdir, 'RPMS')
  let generatedRpm = null

  function findRpm(dir) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const fullPath = path.join(dir, file)
      if (fs.statSync(fullPath).isDirectory()) {
        findRpm(fullPath)
      } else if (file.endsWith('.rpm')) {
        generatedRpm = fullPath
      }
    }
  }

  findRpm(rpmsDir)

  if (generatedRpm) {
    const targetName = `Pegasus-Engine-Theme-${version}.x86_64.rpm`
    const destPath = path.join(releaseDir, targetName)
    fs.copyFileSync(generatedRpm, destPath)
    console.log(`✓ RPM Package successfully created at: ${destPath}`)
  } else {
    console.error('Error: RPM package build completed but no .rpm file was found.')
    process.exit(1)
  }
} catch (err) {
  console.error('Failed to build RPM package:', err.message)
  process.exit(1)
} finally {
  if (fs.existsSync(topdir)) {
    fs.rmSync(topdir, { recursive: true, force: true })
  }
}
