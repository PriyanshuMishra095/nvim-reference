# nvim://reference — Project Memory File

This file serves as the single source of truth for the project's development history, specifications, active guidelines, and code configuration.

---

## 1. Project Overview & Identity
- **Name**: `nvim://reference` (unified branding name, replacing all instances of `handbook`).
- **Description (Layman)**: A friendly, easy-to-use guide for learning Neovim. It helps beginners understand how to navigate using only their keyboard, built with a clean layout and easy-to-read colors that prevent eye strain.
- **Goal**: To onboard newcomers to the modal keyboard paradigm in a clean, astigmatism-friendly, and modern web interface.
- **Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Custom JS Canvas mouse repulsion loops, Express.js (backend server.js), and Vercel Analytics (`@vercel/analytics/react`).
- **Deployment**: Deployed on Vercel from the `main` branch.

---

## 2. Git & Version Control Specifications
- **Public Repository**: `https://github.com/PriyanshuMishra095/nvim-reference.git` (or remote `origin`).
- **Private Backup Repository**: `https://github.com/PriyanshuMishra095/nvim-reference-backup.git` (remote `backup`).
- **Active Workflow Branch**: We are now permanently operating on the `private-dev` branch. This branch actively tracks all private files (`.agents/`, `.vscode/`, `.antigravity/`) and all git operations default to the `backup` remote. 
- **Ignore list (.gitignore)**: Standardized to ignore `node_modules/`, `dist/`, `.env*`.

---

## 3. Strict Rules & Guardrails
- **Rule 1 (Single-Confirmation for Public Pushes)**: Must explicitly ask and confirm with the user ONCE before executing any `git push` command targeting the public GitHub repository (`origin`).
- **Rule 2 (Private Backup Target)**: Default all version control operations and push commands to the private `backup` repository unless explicitly instructed otherwise.
- **Rule 3 (Memory Maintenance)**: Always revisit this memory file (`.agents/MEMORY.md`) before working on any prompt, and update it after completing a task to ensure no historical details are lost. Always let the user know what was updated or removed.
- **Rule 4 (Context/Memory Clearance Exception)**: When explicitly asked to 'Clear your contexts' or 'Clear your memory', do not update the memory file or modify any files for that command.
- **Rule 5 (Activity Log Maintenance)**: Always log every detailed activity performed in `.agents/ACTIVITY_LOG.md` after completing a prompt. You do not need to read this file every time on startup, but refer to it when historical implementation details are required.
- **Rule 6 (Important Events)**: After completing an activity, determine if it constitutes a major milestone/design change. If so, add it to Section 4 of `MEMORY.md` under "Important Events" in a highly concise, information-rich format (least words possible).

---

## 4. Important Events
- **Branding**: Unified to `nvim://reference` (tagline: "One reference to rule them all", removed sidebar icon, removed layout metadata).
- **Aesthetics**: APCA astigmatism-friendly high contrast (light/dark); responsive layout; scroll-to-top bottom-left; desktop sidebar popout with droplet-pop animation; custom cursor star canvas background.
- **Cursor Physics**: Morphing reticle (custom carets on inputs, inverted normal mode badge dot, 4-corner morphing around statusline buttons, green check/red X options cards, no hand cursor morph).
- **Vim Keys & UI**: Mode badge & file path center; interactive tutor badge; scrollable registers modal; `:` pre-typed console overlay; `i`/`I` opens sidebar + focuses search, `Esc` blurs.
- **Backend & Deploy**: Unified Express.js server (port 3001) for build + Gemini API; Vercel Serverless Function `api/explain.js` for Gemini API calls; redesigned help box ("Neovim LLM Help" with "Ask another question" prefilling `:explain `).
- **Git Security**: Pushes default to private `backup` branch (`private-dev`). Deleted `.agents/`, `.vscode/`, `.antigravity/` from `main` history; added to `.gitignore`. Public pushes require single confirmation.
- **Workflow Restructuring**: Created write-only `ACTIVITY_LOG.md` for detailed action logs. Replaced detailed history in `MEMORY.md` with concise "Important Events".
- **AI Chat & Command UX**: Modal chat interface for continuous LLM dialogue; custom follow-up input in "Neovim LLM Help" with error handling; Tab autocomplete for closest matching commands; backdrop click-to-dismiss overlay with blocked bg pointer events; renamed to 'Run Command'; autocomplete suggestions cycling via Arrow keys.
- **UX & Interaction Polish**: Scaled help and command panels; renamed headers to nvim://help and nvim://command; polished close buttons with ESC badges; synchronized Normal badge reticle inversion; added static sparkles ✨ SVG morph with color inheritance; reticle borders blur after 3s idle; custom sandbox terminals in code blocks; jk home-row escapes in inputs; visual mode selection text yanking; contribute overlays pushstate popstate history closing; smooth scroll fade out for background aurora orbs; synced scroll-to-top show triggers; Escape hides auto-revealed statusline; circular theme transition clip-path waves originating from clicked controls (hardware-accelerated `will-change: clip-path` transparent radial gradient on z-[-5] layer, instant toggle button rotation, arrow key suggestion text population, help lsp layout repairs, and cursor backdrop selection overrides).


