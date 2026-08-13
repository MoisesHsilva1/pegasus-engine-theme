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

## Application Principles

- **Local Execution First**: No remote server or backend is required. Everything runs locally on your Fedora Linux machine, keeping your data secure.
- **Native Integration**: Integrates directly with Fedora system utilities (`gsettings`, `dnf`, `flatpak`, `systemctl`) to provide a unified experience without manual terminal commands.
- **Security by Design**: Enforces strict process separation and typed IPC channels between the React UI renderer and system operations.
- **Zero Telemetry**: Operates directly on native Linux configuration files and system APIs without any tracking.

---

## Features

- **Desktop Theme Management**: Browse, preview, apply, and persist GTK and GNOME desktop themes with a single click.
- **System Environment Dashboard**: Real-time overview of Fedora distribution version, GNOME version, uptime, kernel details, and hardware resource utilization.
- **Terminal Profile Synchronization**: Generate and apply cohesive color schemes for Alacritty and GNOME Terminal.
- **Multi-language Support**: Full support for English (`en`) and Brazilian Portuguese (`pt-BR`).

### Included Themes
Pegasus comes pre-configured with 10 beautiful dark themes:
1. Catppuccin Mocha | 2. Tokyo Night | 3. Nord | 4. Gruvbox Dark | 5. Everforest
6. Kanagawa | 7. Rosé Pine | 8. Matte Black | 9. Osaka Jade | 10. Ristretto

---

## Installation Guide

### System Requirements
- **Operating System**: Fedora Linux 38+ (Workstation recommended)
- **Desktop Environment**: GNOME 40+
- **Architecture**: x86_64

### Option A: Fedora RPM Package (Recommended)
Installing via the RPM package automatically configures GNOME Application Launcher integration.

1. Download the generated `.rpm` package from the [Releases](https://github.com/MoisesHsilva1/pegasus-engine-theme/releases) page.
2. Install via `dnf`:
   ```bash
   sudo dnf install ./Pegasus-Engine-Theme-0.1.0.x86_64.rpm
   ```

### Option B: AppImage (Portable)
If you prefer a portable solution without system-wide installation:
1. Download the AppImage file.
2. Make it executable and launch:
   ```bash
   chmod +x ./Pegasus-Engine-Theme-0.1.0.AppImage
   ./Pegasus-Engine-Theme-0.1.0.AppImage
   ```

---

## Configuration & Storage

Your preferences are stored securely in your home directory:
- **Active Theme Settings**: `~/.config/pegasus/active-theme.json`
- **Application State**: `~/.config/Pegasus Engine Theme/`

To completely **Uninstall**, run:
```bash
sudo dnf remove pegasus-engine-theme
```

---

## Releasing and Versioning

To ensure release packages and download files are correctly generated, the project follows strict Semantic Versioning.

### Tag Name Standard
Always prefix your tags with `v` followed by the version numbers (e.g. **`v0.1.0`**).
> **Warning**: Never put the `v` at the end of the version (e.g., `0.1.0v`). Pushing tags with trailing `v` suffixes causes malformed source code archives (e.g., `0.1.0v.zip`) and breaks automated dependency resolution.

### How to Release
1. Update the version inside `package.json` (e.g., `"version": "0.1.0"`).
2. Commit the package file:
   ```bash
   git add package.json
   git commit -m "chore: release v0.1.0"
   ```
3. Create the git tag with the **correct prefix format**:
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   ```
4. Push the branch and tag to the repository:
   ```bash
   git push origin main
   git push origin v0.1.0
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

## Princípios do Aplicativo

- **Execução Local Primeiro**: Sem necessidade de servidores externos. Tudo roda localmente em sua máquina Fedora Linux, protegendo seus dados.
- **Integração Nativa**: Integra-se diretamente com utilitários do sistema Fedora (`gsettings`, `dnf`, `flatpak`, `systemctl`), evitando a necessidade de comandos manuais no terminal.
- **Segurança Arquitetural**: Impõe separação rígida de processos e comunicação tipada via IPC entre a interface React e as operações privilegiadas do sistema.
- **Zero Telemetria**: Opera diretamente nos arquivos de configuração do sistema Linux sem nenhum tipo de rastreamento.

---

## Recursos Principais

- **Gerenciador de Temas de Desktop**: Navegue, visualize, aplique e persista temas de desktop GTK e GNOME com um único clique.
- **Painel do Sistema**: Resumo em tempo real da versão do Fedora, versão do GNOME, uptime, detalhes do kernel e utilização de recursos de hardware.
- **Sincronização de Perfis de Terminal**: Gere e aplique paletas de cores integradas e coerentes para o Alacritty e GNOME Terminal.
- **Suporte Multilíngue**: Suporte completo para Inglês (`en`) e Português do Brasil (`pt-BR`).

### Temas Inclusos
O Pegasus vem pré-configurado com 10 belos temas escuros:
1. Catppuccin Mocha | 2. Tokyo Night | 3. Nord | 4. Gruvbox Dark | 5. Everforest
6. Kanagawa | 7. Rosé Pine | 8. Matte Black | 9. Osaka Jade | 10. Ristretto

---

## Guia de Instalação

### Requisitos do Sistema
- **Sistema Operacional**: Fedora Linux 38+ (Workstation recomendado)
- **Interface Gráfica**: GNOME 40+
- **Arquitetura**: x86_64

### Opção A: Pacote Fedora RPM (Recomendado)
A instalação via pacote RPM cria e configura automaticamente o atalho no inicializador de aplicativos do GNOME.

1. Baixe o pacote `.rpm` gerado na página de [Releases](https://github.com/MoisesHsilva1/pegasus-engine-theme/releases).
2. Instale usando o `dnf`:
   ```bash
   sudo dnf install ./Pegasus-Engine-Theme-0.1.0.x86_64.rpm
   ```

### Opção B: AppImage (Portátil)
Se preferir uma solução portátil sem instalação global no sistema:
1. Baixe o arquivo AppImage.
2. Dê permissão de execução e inicie o app:
   ```bash
   chmod +x ./Pegasus-Engine-Theme-0.1.0.AppImage
   ./Pegasus-Engine-Theme-0.1.0.AppImage
   ```

---

## Configuração e Armazenamento

Suas preferências de tema são armazenadas de forma segura no seu diretório home:
- **Configurações do Tema Ativo**: `~/.config/pegasus/active-theme.json`
- **Estado do Aplicativo**: `~/.config/Pegasus Engine Theme/`

Para **Desinstalar** completamente o aplicativo, execute:
```bash
sudo dnf remove pegasus-engine-theme
```

---

## Processo de Publicação e Versionamento

Para garantir que os pacotes de lançamento e os arquivos de código-fonte no GitHub sejam gerados corretamente, o projeto segue o padrão do Versionamento Semântico.

### Padrão de Nome da Tag Git
Sempre utilize o prefixo `v` seguido dos números da versão (exemplo: **`v0.1.0`**).
> **Atenção**: Nunca coloque a letra `v` ao final da versão (exemplo: `0.1.0v`). Criar tags com o sufixo `v` causa erros na nomenclatura dos pacotes gerados pelo GitHub (exemplo: `0.1.0v.zip`) e impede a resolução automática de dependências.

### Como Publicar uma Nova Versão
1. Atualize a versão no arquivo `package.json` (exemplo: `"version": "0.1.0"`).
2. Faça o commit do arquivo de configuração:
   ```bash
   git add package.json
   git commit -m "chore: release v0.1.0"
   ```
3. Crie a tag git com o **formato de prefixo correto**:
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   ```
4. Envie a branch e a tag para o repositório remoto:
   ```bash
   git push origin main
   git push origin v0.1.0
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
2. Execute as validações obrigatórias antes de submeter seu PR:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
3. Realize o commit das suas alterações seguindo o padrão convencional do projeto.
</details>
