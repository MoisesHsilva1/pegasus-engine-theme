# Pegasus Engine Theme

<p align="center">
  <a href="#english">English</a> |
  <a href="#português-pt-br">Português (PT-BR)</a>
</p>

---

<a name="english"></a>
# English

[![Platform: Fedora](https://img.shields.io/badge/Platform-Fedora%20Linux-blue?logo=fedora)](https://getfedora.org)
[![Electron](https://img.shields.io/badge/Electron-39.8-47848F?logo=electron)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Pegasus Engine Theme** is a native Fedora-focused Linux desktop application that provides a modern, graphical management interface for configuring desktop themes, terminal profiles, wallpapers, system configurations, and native packages.

---

## Installation Guide

### System Requirements
- **Operating System**: Fedora Linux 38+ (Workstation recommended)
- **Desktop Environment**: GNOME 40+
- **Architecture**: x86_64

### Installation via tar.gz Package (Recommended)

The application is distributed as a pre-compiled Linux binary package in a `.tar.gz` archive.

> [!IMPORTANT]
> Make sure to download the compiled release package (e.g. **`pegasus-engine-theme-0.1.1.tar.gz`** under the **Assets** section) and **NOT** the automatic **Source code (tar.gz)** or **Source code (zip)** archives. The source code archives only contain raw development files and cannot be run directly without building the project.

1. Download the compiled `pegasus-engine-theme-0.1.1.tar.gz` archive from the [Releases](https://github.com/MoisesHsilva1/pegasus-engine-theme/releases) page.
2. Extract the archive in your preferred folder:
   ```bash
   tar -xzf pegasus-engine-theme-0.1.1.tar.gz
   ```
3. Ensure runtime dependencies are installed on your system:
   ```bash
   sudo dnf install -y gtk3 libnotify nss xdg-utils at-spi2-core
   ```
4. Navigate into the directory and run the application:
   ```bash
   cd pegasus-engine-theme
   ./pegasus-engine-theme
   ```

---

## Uninstallation Guide

To completely uninstall the application and purge its local configurations:

1. Delete the extracted `pegasus-engine-theme` folder from your system.
2. (Optional) Remove the local user configuration and state folders:
   ```bash
   rm -rf ~/.config/pegasus ~/.local/share/pegasus "~/.config/Pegasus Engine Theme"
   ```

---


## Developer & Architecture Information

<details>
<summary>Click to expand developer documentation</summary>

### Architecture Overview
Pegasus Engine Theme strictly enforces process separation and security boundaries between the graphical interface and privileged system operations.

```text
┌─────────────────────────────────────────────────────────┐
│                    React Renderer                       │
│        (src/renderer: UI, React 19, Tailwind v4)        │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ window.pegasus (Typed API Bridge)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Electron Preload                     │
│         (src/preload: contextBridge mapping)            │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Electron IPC Channels (@shared)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     Electron Main                       │
│        (src/main: Window Management & IPC Routing)      │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Direct Service Invocations
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Pegasus Engine                       │
│   (src/main/engine: Theme, System, Terminal Services)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ SafeCommandRunner (execFile argument arrays)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Fedora Subsystem                     │
│         (gsettings, dnf, flatpak, systemctl)            │
└─────────────────────────────────────────────────────────┘
```

### Development Setup

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/MoisesHsilva1/pegasus-engine-theme.git
   cd pegasus-engine-theme
   pnpm install
   ```

2. **Start Development Server**
   ```bash
   pnpm dev
   ```

### Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `pnpm dev` | `vite` | Start dev server and hot-reloading Electron app |
| `pnpm build` | `tsc && vite build` | Compile TypeScript and bundle production assets |
| `pnpm package` | `pnpm build && ...` | Generate both AppImage and Fedora RPM release packages |
| `pnpm package:rpm` | `pnpm build && ...` | Generate native Fedora RPM package (`release/*.rpm`) |
| `pnpm package:appimage` | `pnpm build && ...` | Generate portable AppImage (`release/*.AppImage`) |
| `pnpm typecheck` | `tsc --noEmit` | Validate strict TypeScript compilation without output |
| `pnpm lint` | `eslint .` | Run ESLint checks across project |
| `pnpm test` | `vitest run` | Execute unit and integration test suite |

### Project Structure
```text
pegasus-engine-theme/
├── docs/                     # Comprehensive documentation guides
├── resources/                # Application branding & icons
├── scripts/                  # Automated build and packaging scripts
├── src/
│   ├── main/                 # Privileged Electron main process
│   ├── preload/              # Secure contextBridge API bridge
│   ├── renderer/             # React UI (Vite, Tailwind v4, shadcn/ui)
│   ├── shared/               # Shared IPC channel constants & DTO types
│   └── themes/               # Native theme definitions & script templates
├── tests/                    # Vitest unit & integration test suites
├── package.json              # Project metadata, scripts & dependencies
└── GEMINI.md                 # Core engineering principles & guidelines
```

### Contributing
1. Fork the repository & create your feature branch (`git checkout -b feature/my-feature`).
2. Run mandatory static checks before submitting a PR:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
3. Commit your changes following repository guidelines.
</details>

---

<a name="português-pt-br"></a>
# Português (PT-BR)

[![Plataforma: Fedora](https://img.shields.io/badge/Plataforma-Fedora%20Linux-blue?logo=fedora)](https://getfedora.org)
[![Electron](https://img.shields.io/badge/Electron-39.8-47848F?logo=electron)](https://electronjs.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-green.svg)](LICENSE)

**Pegasus Engine Theme** é um aplicativo desktop nativo para Fedora Linux que fornece uma interface gráfica moderna para gerenciar temas, perfis de terminal, papéis de parede, configurações do sistema e pacotes nativos.

---

## Guia de Instalação

### Requisitos do Sistema
- **Sistema Operacional**: Fedora Linux 38+ (Workstation recomendado)
- **Interface Gráfica**: GNOME 40+
- **Arquitetura**: x86_64

### Instalação via Pacote tar.gz (Recomendado)

O aplicativo é distribuído como um binário pré-compilado para Linux empacotado em um arquivo `.tar.gz`.

> [!IMPORTANT]
> Certifique-se de baixar o pacote de release compilado (ex: **`pegasus-engine-theme-0.1.1.tar.gz`** na seção **Assets**) e **NÃO** os arquivos automáticos do GitHub **Source code (tar.gz)** ou **Source code (zip)**. Os arquivos de código-fonte contêm apenas os arquivos brutos de desenvolvimento do repositório e não podem ser executados diretamente sem compilar o projeto.

1. Baixe o arquivo compilado `pegasus-engine-theme-0.1.1.tar.gz` na página de [Releases](https://github.com/MoisesHsilva1/pegasus-engine-theme/releases).
2. Extraia o arquivo na pasta de sua preferência:
   ```bash
   tar -xzf pegasus-engine-theme-0.1.1.tar.gz
   ```
3. Certifique-se de que as dependências de execução estão instaladas no seu sistema:
   ```bash
   sudo dnf install -y gtk3 libnotify nss xdg-utils at-spi2-core
   ```
4. Acesse o diretório e execute o aplicativo:
   ```bash
   cd pegasus-engine-theme
   ./pegasus-engine-theme
   ```

---

## Guia de Desinstalação

Para desinstalar completamente o aplicativo e limpar as configurações locais:

1. Exclua a pasta extraída `pegasus-engine-theme` do seu sistema.
2. (Opcional) Remova as pastas de configuração e estado locais do usuário:
   ```bash
   rm -rf ~/.config/pegasus ~/.local/share/pegasus "~/.config/Pegasus Engine Theme"
   ```

---

## Informações de Desenvolvimento e Arquitetura

<details>
<summary>Clique para expandir a documentação de desenvolvedor</summary>

### Visão Geral da Arquitetura
O Pegasus Engine Theme impõe barreiras rígidas de segurança e separação de processos entre a interface visual e as operações de sistema.

```text
┌─────────────────────────────────────────────────────────┐
│                    React Renderer                       │
│        (src/renderer: UI, React 19, Tailwind v4)        │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ window.pegasus (Ponte de API Tipada)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Electron Preload                     │
│         (src/preload: mapeamento contextBridge)         │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Canais IPC do Electron (@shared)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     Electron Main                       │
│        (src/main: Controle de Janela & Roteamento IPC)  │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ Chamadas Diretas de Serviços
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Pegasus Engine                       │
│   (src/main/engine: Serviços de Temas, Sistema, Term)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ SafeCommandRunner (arrays de argumentos)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Fedora Subsystem                     │
│         (gsettings, dnf, flatpak, systemctl)            │
└─────────────────────────────────────────────────────────┘
```

### Configuração de Ambiente

1. **Clonar e Instalar Dependências**
   ```bash
   git clone https://github.com/MoisesHsilva1/pegasus-engine-theme.git
   cd pegasus-engine-theme
   pnpm install
   ```

2. **Iniciar Servidor de Desenvolvimento**
   ```bash
   pnpm dev
   ```

### Scripts Disponíveis

| Script | Comando | Finalidade |
| :--- | :--- | :--- |
| `pnpm dev` | `vite` | Inicia o servidor de desenvolvimento do app Electron |
| `pnpm build` | `tsc && vite build` | Compila o TypeScript e empacota os arquivos de produção |
| `pnpm package` | `pnpm build && ...` | Gera pacotes de distribuição Fedora RPM e AppImage |
| `pnpm package:rpm` | `pnpm build && ...` | Gera o pacote nativo Fedora RPM (`release/*.rpm`) |
| `pnpm package:appimage` | `pnpm build && ...` | Gera o executável portátil AppImage (`release/*.AppImage`) |
| `pnpm typecheck` | `tsc --noEmit` | Executa a validação estática de tipos do TypeScript |
| `pnpm lint` | `eslint .` | Roda a verificação de regras de formatação com ESLint |
| `pnpm test` | `vitest run` | Executa a suíte de testes unitários e de integração |

### Estrutura do Projeto
```text
pegasus-engine-theme/
├── docs/                     # Guias de documentação detalhados
├── resources/                # Identidade visual e ícones do app
├── scripts/                  # Scripts automatizados de empacotamento
├── src/
│   ├── main/                 # Processo principal privilegiado do Electron
│   ├── preload/              # Ponte de segurança via contextBridge
│   ├── renderer/             # Interface em React (Vite, Tailwind v4, shadcn/ui)
│   ├── shared/               # Constantes IPC e tipos de dados comuns (DTOs)
│   └── themes/               # Arquivos e templates de temas nativos do GNOME
├── tests/                    # Suítes de testes automatizados com Vitest
├── package.json              # Metadados do projeto, scripts e dependências
└── GEMINI.md                 # Princípios e guias arquiteturais de engenharia
```

### Como Contribuir
1. Faça um Fork do repositório e crie sua branch de recurso (`git checkout -b feature/minha-feature`).
2. Executar as validações obrigatórias antes de submeter seu PR:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
3. Realize o commit das suas alterações seguindo o padrão convencional do projeto.
</details>
