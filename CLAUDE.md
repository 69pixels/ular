@AGENTS.md

## Специфика Claude Code

- Роли агентов, когда они появятся, оформляем в `.claude/agents/*.md`, повторяющиеся процедуры — в `.claude/skills/`. Текст ролей дублирует описание из `AGENTS.md`, чтобы коллеги в Codex работали по тем же правилам.
- Для Figma используем Figma MCP; перед `get_design_context` загружать skill `figma-design-to-code`.
- Параллельную работу над секциями вести в отдельных git worktree.
- Начало новой сессии: прочитать `docs/HANDOFF.md` и `backlog/BACKLOG.md`, взять первую незакрытую задачу.
