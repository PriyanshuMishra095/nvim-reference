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
- **UX & Interaction Polish**: Scaled help and command panels; renamed headers to nvim://help and nvim://command; polished close buttons with ESC badges; synchronized Normal badge reticle inversion; added static sparkles ✨ SVG morph with color inheritance; reticle borders blur after 3s idle; custom sandbox terminals in code blocks; jk home-row escapes in inputs; visual mode selection text yanking; contribute overlays pushstate popstate history closing; smooth scroll fade out for background aurora orbs; synced scroll-to-top show triggers; Escape hides auto-revealed statusline; arrow key suggestion text population, help lsp layout repairs, and cursor backdrop selection overrides.
- **Theme Transition Overhaul**: Replaced broken clip-path overlay (`z-[-5]` with instant theme toggle) with native View Transitions API (`document.startViewTransition`). CSS `::view-transition-new(root)` circular clip-path reveal from click coordinates via `--vt-x`/`--vt-y` custom properties. Graceful fallback for unsupported browsers.
- **Canvas Polish**: Aurora orbs now breathe (sine-wave alpha ~8-12s cycle); mouse-based parallax nudge on orbs; smoother theme color lerping (0.03). Progress bar glow pulse animation.
- **Learner UX**: Per-chapter reading progress bars (scaleX on scroll); reading time estimates (~200 WPM) badges per chapter.
- **Gemini API Fix**: `api/explain.js` now always uses array format for `contents` (was raw string which broke Vercel); added CORS headers, detailed error messages, `vercel.json` with serverless routing + SPA fallback.
- **Premium UX Polish**: Matrix-style typewriter effect for Gemini chat responses; 4.5s auto-dismissal for HUD command notifications; significantly slowed down canvas aurora orbs for a relaxing feel; redesigned registers tray to a premium glassmorphic modal (`backdrop-blur-xl`); added `j`/`k`, `gg`, `G` and `/` Vim keyboard shortcuts for smooth scrolling and searching; replaced manual chapter scroll tracking with Framer Motion physics (`useScroll`, `useSpring`); eliminated floating theme-toggle button flicker by disabling its dedicated view-transition layer.
- **Premium UX Performance & Bug Fixes**: Excluded celestial theme toggle button and its children from global transitions to preserve internal rotation transitions; resolved custom cursor lag by caching `window.getComputedStyle` coordinates inside `updateHoverState` rather than calling it on every frame inside the 60fps loop; fixed runaway speed of canvas aurora orbs by using static mouse offsets in `draw()` instead of cumulative velocity integration; removed redundant second `BackgroundCanvas` inside the Contribute modal; removed `cursor-pointer` from Contribute backdrop to fix full-screen reticle snapping; restored registers modal detailed explanation; added fallbacks for environment variables (`VITE_GEMINI_API_KEY`, `GOOGLE_API_KEY`, etc.) in `api/explain.js` and `server.js`.
- **Sidebar 3D Stagger & Registers Morph**: Added a premium 3D perspective spring slide-in animation to the desktop sidebar (scaling from 0.94 and rotating Y by -15deg); added staggered 3D spring entry animations for chapter navigation links when sidebar opens; restored placeholder texts for empty register slots; added `data-register-card` hover cursor snaps and `cursor-pointer` to registers cells to support custom cursor morphing.
- **Visual & Cursor Interaction Polish**: Hidden Windows default mouse pointer during View Transitions sweep in CSS; converted static ESC text labels to interactive clickable close buttons in Registers, Help, and Command popups; throttled mouse event updates in custom cursor to 1 requestAnimationFrame frame to resolve high-polling-rate mouse lag; set capture-phase global scroll event listener in custom cursor to update snaps when local divs scroll; added staggered 3D slide-in animations for chapter navigation links using Framer Motion; integrated Matrix green typewriter text typing for model explanations.
- **Global Typography Scale & Cohesive Colors**: Native Tailwind v4 theme mapping (`@theme` in `index.css`) was integrated to control all typography variables (`--text-size-xs` to `--text-size-5xl`) at +2px offset from their original base sizes, preventing specificity conflicts and layout breakage; JIT classes (`.text-[9px]` to `.text-[13px]`) are overrode with matching +2px increments; aggressive CSS overrides on neutral colors are removed to restore original heading layouts and landing page designs.
- **Scroll Parallax Orbs & Velocity Optimization**: Aurora background orbs velocity has been set to a gentle, organic float (`vx/vy` random between -0.1 and 0.1, or 6-12px/s); added depth-aware vertical scroll parallax; removed heavy canvas shadow blurs and restricted global constellations web drawing exclusively to the landing page, solving playground rendering lags and restoring a solid 60fps experience.
- **Custom Cursor Unmount Guard**: Added check in custom cursor physics loop to verify if the snapped element is still attached to the document body; when modals or overlays unmount, it instantly unlocks back to the mouse coordinate, preventing the cursor from flying away to the top-left (0,0).
- **Ask Neovim LLM Chat & Typewriter Acceleration**: Changed LLM branding references to "Ask Neovim LLM"; restricted API system instructions in `server.js` and `api/explain.js` to return highly concise, short answers (under 3-4 sentences total); implemented context-aware chat input placeholders; upgraded `MatrixTypewriter` typing effect to output at standard speed initially and dynamically accelerate towards the end of the text stream; fixed typed input text color in dark theme by mapping it to `dark:text-white`.
- **Smooth Sidebar Layout Flow**: Converted main content container to `motion.div` in `App.tsx` animating `paddingLeft` with matching spring physics (`stiffness: 220, damping: 25`) on desktop viewports, causing main text layout to slide sideways in perfect synchronization with sidebar toggle.
- **Uniform Micro-Typography & Layout Unification**: Standardized typography size classes inside checklist cards (titles and descriptions), table elements, sandbox terminal inputs, lexical AST footer elements, code blocks, and the interior contents of both Help and Registers modals to a uniform `text-sm`, creating a highly balanced, clean, and cohesive look.
- **View Transition Overlay Exclusions**: Created `.vt-overlay-exclude` class mapped to modals and system command overlays; this isolates them in their own live layout layers during view transition circular sweeps, preventing the GPU screenshot rasterization from wiping out backdrop-filter blurs.




