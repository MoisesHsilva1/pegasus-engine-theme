# TASK-001 — Remover indicadores de estado "ativo" da interface de usuário (Renderer)

## Parent Epic

EPIC-001 — Interface de Temas Stateless (Sem Estado)

## Objective

Remover a exibição e o gerenciamento de estado do tema ativo na camada de Renderer (React), garantindo que a listagem de temas seja completamente *stateless* e não mostre indicadores visuais do tema atual.

## Scope

### In Scope

- Modificar `ThemesView.tsx`, `CurrentTheme.tsx` (se aplicável) e quaisquer outros componentes React para remover a lógica que determina se um tema é o "ativo".
- Remover estilos visuais (bordas, badges, textos "Ativo") vinculados ao estado ativo.
- Manter o evento de clique que aplica o tema escolhido pelo usuário.

### Out of Scope

- Modificações no `Preload` ou no processo `Main/Engine` (isso será tratado em outra tarefa).
- Alterações no layout geral da listagem de temas que não envolvam o estado "ativo".

## Implementation Context

Atualmente, componentes como `ThemesView.tsx` buscam e mantêm no estado a informação do tema ativo (`activeTheme`). Essa lógica deve ser removida do React. Apenas a lista de temas disponíveis deve ser renderizada, e clicar em um deles deve apenas despachar o comando de aplicação.

## Expected Result

A interface de usuário listará os temas normalmente, permitindo que o usuário clique e aplique qualquer tema. Nenhum tema terá um indicador de estar selecionado, nem no início nem após o clique.

## Acceptance Criteria

- [ ] A tela de temas não exibe mais a borda ou badge de "ativo".
- [ ] O componente `CurrentTheme` (se utilizado apenas para exibir o tema atual na home) for ajustado ou removido conforme a nova abordagem *stateless*.
- [ ] A aplicação do tema continua funcionando ao clicar no card de um tema.

## Verification

- Abrir o app e navegar até a listagem de temas; nenhum tema deve parecer selecionado.
- Clicar em um tema; o sistema operacional deve mudar o tema, mas a interface não deve adicionar estado visual de seleção ao card.

## Dependencies

### Depends On

- None

### Blocks

- TASK-002

## Traceability

Parent Epic:
EPIC-001

PRD traceability:
Inherited through EPIC-001.

## Status

Pending
