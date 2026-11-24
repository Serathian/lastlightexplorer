# AGENTS.md — lastlightexplorer

Operational guidelines and contracts for AI agents working in `lastlightexplorer`.

---

## Technical Stack & Constraints

| Item                 | Details                                      |
| :------------------- | :------------------------------------------- |
| Framework            | Vite + Vanilla TypeScript                    |
| UI Framework         | DaisyUI + Tailwind CSS                       |
| Local Port           | `http://localhost:3004`                      |
| Production Container | `ghcr.io/Serathian/lastlightexplorer:latest` |
| Web Server           | Nginx Alpine (port 80)                       |

---

## Agent Rules

1. **Self-Contained Logic**: Keep this app client-side and offline-capable. It does not depend on a backend database or CMS.
2. **Deterministic Rules & Tokens**: Exploration token pools in `data/` and `src/codex.ts` reflect official game rules for _Last Light_. Do not alter token probabilities or game text without intent.
3. **Responsive Mobile-First UI**: The app is designed for smartphone use at the game table; maintain touch targets, clear fonts, and high-contrast DaisyUI themes.

---

## Agent skills

### Issue tracker

Issues are tracked centrally in GitHub Issues (`Serathian/website-stack` via `gh --repo Serathian/website-stack`). See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default five-role triage label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/` at the repo root). See `docs/agents/domain.md`.
