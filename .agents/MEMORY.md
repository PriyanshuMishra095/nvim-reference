# nvim://reference — Project Memory

Concise working summary. Detailed history lives in ACTIVITY_LOG.md and CHANGELOG.md.
Rules of engagement live in AGENTS.md (single source for rules — not duplicated here).

## 1. Identity & Goal
- **Name**: `nvim://reference` — "One reference to rule them all".
- **What it is**: An interactive, premium web handbook teaching Neovim's modal
  paradigm to developers coming from GUI editors.
- **North star**: Awwwards-level design. Best-possible macro/micro interactions,
  punchy-but-smooth surprising animations, high-end-terminal feel, APCA-friendly
  contrast, 60fps+ everywhere.

## 2. Verified Tech Facts (checked 2026-07-09)
- React **19.0.1** · Vite **6.4.3** · **Tailwind CSS v4** (`@tailwindcss/vite`,
  no config file, `data-theme` dark variant) · Framer Motion via `motion/react` v12
  · lucide-react · `@google/genai` (gemini-2.5-flash).
- Backend: Express `server.js` on :3001 locally; Vercel serverless `api/explain.js`
  in production. Vite dev server :3000 proxies `/api/*`.
- Fonts: Inter (body), Plus Jakarta Sans (display), JetBrains Mono (code).

## 3. Git
- Active branch: **`private-backup`**, tracking private remote `backup`
  (`nvim-reference-backup`). All work happens here.
- Public repo: `github.com/PriyanshuMishra095/nvim-reference`, `main` branch,
  deployed on Vercel. Public pushes need one explicit confirmation.
- `.gitignore`: `node_modules/`, `dist/`, `.env*` (except example), `.agents/`,
  `.vscode/`, `.antigravity/`, LLM summary report.

## 4. Current State (what's built)
- Custom fluid cursor: framerate-independent overdamped spring physics, morphing
  dot (text carets, Gemini sparkle, close-X, checklist tick), glassmorphic reticle.
- Interactive Vim buffers in every code block (j/k/i/y/G/gg, `:w` `:q` `:%s///`),
  terminal sandboxes, Lua keymap + settings simulators (c17-s1, c18-s1).
- Global Vim keyboard layer: j/k scroll, gg/G, `/` search, `v` visual yank,
  `:` command bar with autocomplete; registers modal; help modals; Gemini AI chat
  with Matrix typewriter.
- View Transitions API circular theme reveal; aurora-orb canvas with parallax;
  3D staggered sidebar; magnetic buttons; keystroke HUD; scroll progress bars.

## 5. Important Events (one line each)
- Branding unified to nvim://reference; typography locked to `hope` commit scale.
- Cursor physics re-engineered: delta-time normalized, decoupled springs, friction
  0.40 zero-bounce; className writes banned from rAF loop.
- Theme toggle rebuilt on native View Transitions API (`--vt-x/--vt-y` reveal).
- Canvas perf pass: no shadowBlur, constellations landing-only, gentle orb float.
- Static code blocks replaced by InteractiveCodeBlock Vim simulator.
- Gemini API hardened (array `contents`, CORS, env fallbacks, vercel.json routing).
- Modals converted to motion.div exit wrappers; `.vt-overlay-exclude` protects blurs.
- Handover docs created (continuation doc, summary report, CHANGELOG.md).
- 2026-07-09: fixed 47 invalid Tailwind shade classes (zinc-650 etc.) + `flex-flow`
  typo; entered **design-upgrade phase** targeting Awwwards-level polish.

- 2026-07-09: Awwwards overhaul on unified-overhaul branch — boot landing, mode atmosphere, Ctrl+K palette, syntax highlighting, :Tutor game, reduced-motion, self-hosted fonts; all branches merged into unified-overhaul and pushed to backup.

- 2026-07-09: Bug-fix pass on unified-overhaul — cursor click-refresh, theme toggle rewrite (no lag/back-to-back), palette window-key handling + autoscroll, help back button, held j/k continuous scroll, ghost numeral + code-block clipping fixes, removed idle ghost caret, origin repointed to nvim-reference.git. Pushed to backup only.

- 2026-07-09: Curated public release pushed to origin/main (strips .agents/.claude/docs); Vercel auto-deploys from there. unified-overhaul stays the private dev branch.

## 6. Open Work
- Design-upgrade review in progress (macro/micro interaction overhaul proposals).
- Backlog: localStorage persistence for buffers, visual block mode, dd/o/u/undo,
  macro recording, syntax highlighting, mobile touch pass, full-text search,
  progress tracking.