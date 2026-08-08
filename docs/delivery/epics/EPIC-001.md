# EPIC-001 — Interface de Temas Stateless (Sem Estado)

## Goal

Tornar a interface de seleção de temas do Pegasus Engine Theme *stateless*, removendo indicadores de qual tema está "ativo". O objetivo é garantir consistência visual e evitar que a UI mostre informações incorretas caso o tema do sistema seja alterado externamente, melhorando a confiabilidade da experiência de customização.

## Scope

### Included

- Remoção de indicadores visuais de estado "ativo" ou "selecionado" da lista de temas.
- Manutenção da funcionalidade de aplicar um tema imediatamente ao clicar.

### Excluded

- Sincronização ou detecção em tempo real das configurações de tema do GNOME/Fedora para refletir na interface do aplicativo.
- Adição de sistema de notificações persistentes de histórico de temas.
- Outras alterações na UI não relacionadas à seleção e exibição de temas.

## Included Behavior

- Ao abrir a listagem de temas, nenhum tema deve estar marcado como ativo.
- Ao clicar em um tema, a alteração é aplicada no sistema, mas o tema clicado não recebe nenhum estilo de "ativo" na lista.
- A experiência deve parecer sempre uma nova seleção.

## Epic-Level Acceptance Criteria

- [ ] A interface da aplicação não armazena nem exibe estado de qual tema está selecionado/ativo.
- [ ] Usuários podem clicar nos temas e ver o resultado imediato da aplicação no sistema sem que a interface os marque como "ativos".
- [ ] A consistência visual e clareza da interface se mantém intacta.

## Dependencies

### Depends On

- None

### Blocks

- None

## Traceability

### PRD Requirements

- REQ-001
- REQ-002

### Unmapped Requirements

- None

## Non-Functional Requirements

- Consistência estética: A UI não deve parecer "quebrada" pela ausência do indicador de ativo; deve parecer um comportamento intencional e limpo.
- Limitação técnica respeitada: A remoção do estado atende à restrição de não ser possível observar perfeitamente o estado do GNOME de forma simples.

## Status

Proposed
