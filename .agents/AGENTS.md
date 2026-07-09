# Workspace Rules for nvim://reference

## Git & Security (hard rules)
- **Private-first workflow**: Stay on the `private-backup` branch; all commits and
  pushes default to the private `backup` remote (`nvim-reference-backup`). Never
  switch to or push the public `main` branch unless explicitly instructed.
- **Single confirmation for public pushes**: Ask the user once and get an explicit
  yes before any `git push` targeting the public repository
  (`github.com/PriyanshuMishra095/nvim-reference`).
- **Public repo is curated, not mirrored**: The public repo receives only
  the files needed to build and run the project. `.agents/`, `.vscode/`,
  `.antigravity/`, docs meant for LLM handover, and anything sensitive
  (API keys, `.env`, emails, phone numbers, personal info — including data
  that becomes identifying when combined) never go public. Every public
  push requires explicit user confirmation first.

## Memory & Logging (lightweight process)
- Read `.agents/MEMORY.md` before starting work; update it after tasks that change
  project state, and tell the user what changed in it.
- Append a brief entry to `.agents/ACTIVITY_LOG.md` after completing a task. Don't
  read it on startup; consult it only when historical detail is needed.
- MEMORY.md is a **summary**, not a changelog. One line per milestone in
  "Important Events"; detailed history belongs in ACTIVITY_LOG.md / CHANGELOG.md.
- If asked to "clear your context/memory", do not write to any files for that command.

## Design North Star
- Target: **Awwwards-level** — best-possible macro and micro interactions, punchy
  but smooth and surprising animations. The interface should feel like a high-end
  terminal application, not a documentation site.
- Every interaction must hold 60fps+; motion that stutters is worse than no motion.
- Big creative overhauls are welcome when proposed first; small polish and bug
  fixes can be applied directly.

## Tailwind v4 Rules (no tailwind.config.js in this project)
- Dark mode is `@custom-variant dark` on `[data-theme=dark]` in `index.css`; theme
  switching sets `data-theme` on `<html>`.
- **Only use real shade steps** (50, 100, 200 … 900, 950). Classes like `zinc-650`,
  `indigo-550`, `zinc-850` do not exist — they compile to *nothing* and silently
  break colors. (A sweep on 2026-07-09 fixed 47 of these; don't reintroduce them.)
- Use native Tailwind text-size classes; don't override the type scale with custom
  CSS variables (conflicts with the v4 engine).

## Liquid UX / Performance Rules
- **Zero-bounce cursor physics**: keep decoupled springs — position `posSpring=0.16`,
  dimensions `dimSpring=0.28`, radius `rSpring=0.32`, all with overdamped
  `friction=0.40` (values >0.48 visibly rubber-band). The physics loop is
  delta-time normalized to 60fps; keep it that way.
- **No layout reads in rAF loops**: never call `getComputedStyle()` or
  `elementFromPoint()` inside `requestAnimationFrame`; update hover state on
  `mousemove`/`scroll` events only.
- **No `element.className` writes in animation loops**: base classes stay static in
  JSX; use `classList.add/remove` only for binary toggles (e.g. caret blink).
- **Magnetic/drag elements**: set `style.transition='none'` during mousemove-driven
  transforms; restore the transition on mouseleave.
- **AnimatePresence**: the immediate child must be a `motion.*` element with a
  unique `key`, or exit animations are dropped.
- **Text caret morphing**: detect via `getComputedStyle(target).cursor === 'text' |
  'vertical-text'`, not hardcoded selectors.
- **No `backdrop-blur` on cards that also scale-animate** — use high-opacity solid
  backgrounds. No canvas `shadowBlur`. Constellation web renders on the landing
  page only.