# Last Light Explorer — Agent Instructions

`lastlightexplorer` is a companion web application for the board game _Last Light_, built with **Vite, TypeScript, Tailwind CSS, and DaisyUI**.

---

## 1. Purpose & Architecture

- **Role**: Lightweight, mobile-friendly planet exploration token generator. Replaces physical cardboard tokens with a button press during gameplay.
- **Hosting**: Hosted in production at `https://explorer.jake-reddy.com`.
- **Runtime**: Multi-stage Docker build: Vite compiles to `/app/dist`, served statically via `nginx:alpine` on port 80.
- **CI/CD**: Pushes to `main` trigger `.github/workflows/docker-publish.yml`, building `ghcr.io/Serathian/lastlightexplorer:latest` and firing the Watchtower webhook.

---

## 2. Key Files

- `index.html`: Entry HTML with DaisyUI theme toggles and app container.
- `src/main.ts`: Application logic for planet exploration token randomization, common/rare token pools, and state management.
- `src/codex.ts`: Game rules reference and terminology definitions.
- `data/`: Raw token distribution data based on retail game rules.

---

## 3. Development Commands

```bash
# Start Vite local dev server (port 3004)
npm run dev -- --port 3004

# Typecheck and build static output
npm run build

# Format check with prettier
npm run format:check
```
