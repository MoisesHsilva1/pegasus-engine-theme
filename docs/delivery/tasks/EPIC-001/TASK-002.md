# TASK-002 — Remover funções de leitura de tema ativo do IPC e Preload (Clean-up)

## Parent Epic

EPIC-001 — Interface de Temas Stateless (Sem Estado)

## Objective

Remover do processo Main e do Preload as APIs e handlers IPC que forneciam a informação do "tema atualmente ativo", já que o Renderer não precisará mais dessas informações.

## Scope

### In Scope

- Remover métodos como `getActiveTheme` (ou equivalentes) do arquivo de Preload.
- Remover os handlers IPC correspondentes no processo Main.
- Remover do `ThemeService` no Engine as funções de consulta do estado atual se elas não forem mais usadas internamente.

### Out of Scope

- Remoção da funcionalidade de *aplicar* o tema (`applyTheme`).
- Modificações na camada de Renderer (tratado na TASK-001).

## Implementation Context

Com a interface *stateless*, não precisamos mais consultar o GNOME/Fedora (ou armazenar em cache) para saber qual é o tema ativo no momento em que o aplicativo é aberto. Remover essa API reduz a superfície de ataque no Preload e simplifica o `ThemeService`.

## Expected Result

A bridge do Preload (`window.pegasus.theme`) não terá mais a capacidade de consultar o tema ativo, expondo apenas a capacidade de listar temas disponíveis e aplicar um tema escolhido.

## Acceptance Criteria

- [ ] Handler IPC de consulta de tema atual removido do Main.
- [ ] Função de consulta removida do Preload (`contextBridge`).
- [ ] Serviço de Engine limpo de funções não utilizadas referentes a consultar o tema atual do sistema.

## Verification

- `pnpm typecheck` e `pnpm lint` devem passar, confirmando que a remoção não quebrou nada que ainda dependia dessa API.
- Testes unitários devem passar (e testes relacionados à busca de tema ativo devem ser removidos).

## Dependencies

### Depends On

- TASK-001

### Blocks

- None

## Traceability

Parent Epic:
EPIC-001

PRD traceability:
Inherited through EPIC-001.

## Status

Pending
