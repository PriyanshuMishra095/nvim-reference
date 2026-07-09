# Neovim Handbook Studio — Complete Project Continuation Document

> **Purpose**: This document captures every detail required to continue development of this project in a completely new environment, without any prior chat history. It is designed to be fed directly into an LLM or read by a developer to resume work immediately.

---

## Table of Contents
1. [Project Identity & Goals](#1-project-identity--goals)
2. [Environment & System Setup](#2-environment--system-setup)
3. [Repository & Git Configuration](#3-repository--git-configuration)
4. [Technology Stack & Dependencies](#4-technology-stack--dependencies)
5. [Directory Structure & File Map](#5-directory-structure--file-map)
6. [Configuration Files](#6-configuration-files)
7. [Type System & Data Architecture](#7-type-system--data-architecture)
8. [Component Architecture](#8-component-architecture)
9. [Backend & API Architecture](#9-backend--api-architecture)
10. [Custom Cursor Physics Engine](#10-custom-cursor-physics-engine)
11. [Interactive Vim Buffer Simulator](#11-interactive-vim-buffer-simulator)
12. [Keyboard Navigation System](#12-keyboard-navigation-system)
13. [Theme System & View Transitions](#13-theme-system--view-transitions)
14. [Canvas Background System](#14-canvas-background-system)
15. [Design Tokens & CSS Architecture](#15-design-tokens--css-architecture)
16. [Deployment Architecture](#16-deployment-architecture)
17. [Agent Configuration & Rules](#17-agent-configuration--rules)
18. [Mistakes Made & What Not To Do](#18-mistakes-made--what-not-to-do)
19. [What Works Well](#19-what-works-well)
20. [Current State & What's Done](#20-current-state--whats-done)
21. [Future Plans & What's Left](#21-future-plans--whats-left)

---

## 1. Project Identity & Goals

- **Branding Name**: `nvim://reference` (tagline: "One reference to rule them all")
- **Description**: A premium, interactive web-based handbook for learning Neovim. It teaches the modal keyboard paradigm to newcomers through a clean, astigmatism-friendly, dark/light themed interface with interactive code blocks, simulated Vim buffers, a live Gemini AI chat assistant, and a custom fluid cursor.
- **Target Audience**: Developers transitioning from GUI editors (VS Code, WebStorm) to Neovim.
- **Design Philosophy**: Premium, state-of-the-art aesthetics. APCA-compliant contrast ratios. Glassmorphic elements. Micro-animations everywhere. The interface should feel like a high-end terminal application, not a typical documentation site.

---

## 2. Environment & System Setup

| Parameter | Value |
|-----------|-------|
| **OS** | Windows |
| **Workspace Path** | `C:\Users\Priya\antigravity\Neovim-Handbook-Studio` |
| **Node.js** | Required (LTS recommended) |
| **Package Manager** | npm (lockfile: `package-lock.json`) |
| **Dev Server Port** | `3000` (Vite frontend) |
| **Backend Server Port** | `3001` (Express.js) |
| **Build Tool** | Vite v6.4.3 |

### Environment Variables
File: `.env` (gitignored, template at `.env.example`)

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Primary key for Google Gemini API calls |
| `VITE_GEMINI_API_KEY` | Fallback (Vite-prefixed) |
| `GOOGLE_API_KEY` | Fallback |
| `GOOGLE_GENAI_API_KEY` | Fallback |
| `APP_URL` | Hosting URL (auto-injected by Vercel) |

The server checks all four key variables in priority order. If none are set, AI explanations will fail gracefully with an error message.

### Running Locally
```powershell
# 1. Install dependencies
npm install

# 2. Start Express backend (port 3001)
node server.js

# 3. In another terminal, start Vite dev server (port 3000)
npm run dev

# 4. Build for production
npm run build
```

The Vite dev server proxies `/api/*` requests to the Express backend at `localhost:3001` (configured in `vite.config.ts`).

---

## 3. Repository & Git Configuration

| Remote | URL | Branch | Purpose |
|--------|-----|--------|---------|
| `origin` | `https://github.com/PriyanshuMishra095/Neovim-Handbook-Studio.git` | `main` | Public deployment target |
| `backup` | `https://github.com/PriyanshuMishra095/nvim-reference-backup.git` | `private-backup` | Private backup (includes `.agents/`, `.vscode/`) |

### Git Rules (CRITICAL)
- **Default branch**: Always work on `private-backup` branch locally.
- **Default push target**: Always `git push backup private-backup`.
- **Public pushes**: Require explicit user confirmation. Use `git push -f origin private-backup:main`.
- **`.gitignore`**: Ignores `node_modules/`, `dist/`, `.env*` (except `.env.example`), `.antigravity/`, `.vscode/`, and `project_summary_report for llms.md`.
- **Security**: Never upload API keys, personal info, emails, passwords, or phone numbers.

---

## 4. Technology Stack & Dependencies

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.0.1 | UI framework |
| `react-dom` | ^19.0.1 | DOM renderer |
| `motion` | ^12.23.24 | Framer Motion (animation library, imported as `motion/react`) |
| `lucide-react` | ^0.546.0 | Icon library |
| `@tailwindcss/vite` | ^4.1.14 | Tailwind CSS v4 Vite plugin |
| `@vercel/analytics` | ^2.0.1 | Vercel analytics tracking |
| `@google/genai` | ^2.4.0 | Google Gemini AI SDK |
| `express` | ^4.21.2 | Backend HTTP server |
| `dotenv` | ^17.2.3 | Environment variable loading |
| `vite` | ^6.2.3 | Build tool |
| `@vitejs/plugin-react` | ^5.0.4 | React plugin for Vite |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.1.14 | Tailwind CSS v4 |
| `typescript` | ~5.8.2 | TypeScript compiler |
| `esbuild` | ^0.25.0 | Fast JS bundler |
| `tsx` | ^4.21.0 | TypeScript execution |
| `autoprefixer` | ^10.4.21 | CSS vendor prefixing |
| `@types/express` | ^4.17.21 | Express type definitions |
| `@types/node` | ^22.14.0 | Node.js type definitions |

> **IMPORTANT**: This project uses **Tailwind CSS v4** with the `@tailwindcss/vite` plugin. The dark mode variant is configured via `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` in `index.css`, NOT via `tailwind.config.js` (which does not exist). Theme switching uses `data-theme` attribute on `<html>`.

---

## 5. Directory Structure & File Map

```
Neovim-Handbook-Studio/
├── .agents/                          # Agent configuration (private, tracked in backup only)
│   ├── AGENTS.md                     # Workspace rules (10 rules + Liquid UX section)
│   ├── MEMORY.md                     # Project memory (single source of truth)
│   ├── ACTIVITY_LOG.md               # Detailed activity log (~550 lines)
│   └── skills/
│       └── liquid-ux-cursor-sandbox/
│           └── SKILL.md              # Cursor physics & Vim buffer skill
├── api/
│   └── explain.js                    # Vercel Serverless Function (Gemini API)
├── assets/                           # Static assets
├── dist/                             # Production build output (gitignored)
├── src/
│   ├── App.tsx                       # Main application (849 lines, 38KB)
│   ├── main.tsx                      # Entry point (renders App)
│   ├── types.ts                      # TypeScript interfaces
│   ├── index.css                     # Global styles & design tokens (606 lines, 17KB)
│   ├── view-transitions.d.ts         # View Transitions API type declarations
│   ├── data/
│   │   └── chapters.ts              # Chapter content data (643 lines, 24KB)
│   └── components/
│       ├── App.tsx                    # — see above —
│       ├── BackgroundCanvas.tsx       # Aurora orbs canvas (18KB)
│       ├── ChapterSection.tsx         # Chapter rendering + InteractiveCodeBlock (50KB)
│       ├── CustomCursor.tsx           # Custom fluid cursor physics (31KB)
│       ├── FloatingControls.tsx       # Scroll-to-top + floating buttons (3KB)
│       ├── Sidebar.tsx                # Desktop/mobile sidebar navigation (13KB)
│       ├── TerminalLanding.tsx        # Terminal landing page (9KB)
│       └── VimStatusLine.tsx          # Vim status bar + modals (61KB)
├── server.js                         # Express backend server (95 lines)
├── index.html                        # HTML entry point
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite build configuration
├── vercel.json                       # Vercel deployment routing
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment variable template
├── .gitignore                        # Git ignore rules
└── README.md                         # Project readme
```

### Component Size Reference
| Component | Lines | Size | Complexity |
|-----------|-------|------|------------|
| VimStatusLine.tsx | ~1159 | 61KB | Highest (status bar, modals, AI chat, commands) |
| ChapterSection.tsx | ~1008 | 50KB | High (InteractiveCodeBlock, terminal sandbox, tables) |
| App.tsx | ~849 | 39KB | High (state orchestration, layout, contribute modal) |
| CustomCursor.tsx | ~692 | 31KB | High (physics engine, hover detection, morphing) |
| BackgroundCanvas.tsx | ~480 | 18KB | Medium (aurora orbs, constellations, parallax) |
| Sidebar.tsx | ~340 | 13KB | Medium (chapter list, search, 3D animations) |
| TerminalLanding.tsx | ~218 | 9KB | Low (landing page, magnetic buttons) |
| FloatingControls.tsx | ~90 | 3KB | Low (scroll-to-top button) |

---

## 6. Configuration Files

### vite.config.ts
```typescript
export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  server: {
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } },
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx", "moduleResolution": "bundler", "isolatedModules": true,
    "allowJs": true, "skipLibCheck": true, "noEmit": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

### vercel.json
- API functions in `api/**/*.js` have `maxDuration: 30` seconds.
- Rewrites: `/api/:path*` → serverless functions; all other routes → `index.html` (SPA fallback).

---

## 7. Type System & Data Architecture

### Core Types (`src/types.ts`)
```typescript
interface SubSection {
  id: string;           // e.g. "c1-s1", "c18-s1"
  title: string;
  description?: string;
  type: 'text' | 'vs_matrix' | 'steps' | 'code_block' | 'table' | 'callout' | 'custom_diagram' | 'checklist';
  content?: string;     // Raw text or code content
  extraData?: any;      // Flexible field for tables, matrices, etc.
}

interface Chapter {
  id: string;           // e.g. "chapter-1"
  num: number;          // Chapter number
  tag: string;          // Category tag
  title: string;
  description: string;
  sections: SubSection[];
}

interface SearchRecord {
  id: string;
  chapterId: string;
  chapterNum: number;
  chapterTitle: string;
  title: string;
  text: string;
  elementIdToScroll: string;
}
```

### Content Data (`src/data/chapters.ts`)
- Exports `CHAPTERS_DATA: Chapter[]` — an array of ~20 chapters.
- Each chapter contains 2-5 sections of various types.
- Section types determine rendering logic in `ChapterSection.tsx`:
  - `text` → Prose paragraph
  - `table` → Rendered HTML table from `extraData.headers` + `extraData.rows`
  - `vs_matrix` → Side-by-side comparison cards
  - `code_block` → **Interactive Vim buffer** (the `InteractiveCodeBlock` component)
  - `steps` → Numbered step cards
  - `checklist` → Interactive checkbox items
  - `callout` → Highlighted info boxes
  - `custom_diagram` → Special layout (e.g., `c18-s1` Lua keymap simulator)

---

## 8. Component Architecture

### App.tsx (Main Orchestrator)
**State Variables**:
- `onLanding` (boolean) — Controls landing page vs handbook view.
- `theme` ('dark' | 'light') — Active color scheme.
- `activeChapterId` (string) — Currently focused chapter.
- `vimMode` (VimMode) — Global Vim mode state: `'normal' | 'insert' | 'visual' | 'command'`.
- `registers` (Record<string, string>) — In-memory yank registers (`"`, `+`, `a`, `b`, `c`).
- `sidebarVisible`, `mobileSidebarOpen` — Sidebar toggle states.
- `contributeOpen` — Contribute overlay modal state.
- `keystrokes` — Active keystroke HUD badge list.

**Key Functions**:
- `toggleTheme(clickX, clickY)` — Triggers View Transitions API circular reveal.
- `handleYank(text)` — Stores yanked text in registers with round-robin assignment.
- `handleMagneticMove/Leave` — Magnetic pull physics for interactive buttons.

### TerminalLanding.tsx
- Full-screen terminal-themed landing page.
- Three action buttons with magnetic hover physics.
- `handleMagneticMove`: Sets `transition: 'none'` during drag for 200+ FPS.
- `handleMagneticLeave`: Restores `transition: 'transform 0.6s var(--ease-inertial)'`.

### ChapterSection.tsx
Contains two components:
1. **`InteractiveCodeBlock`** — Full Vim buffer simulator (see Section 11).
2. **`ChapterSection`** — Main chapter renderer handling all section types.

Key internal state: `terminalActive`, `terminalHistory`, `terminalInput` (per-section terminal sandboxes), `keymapTip`, `simulatedMode` (lua keymap simulator), `activeLineExplain` (hover line explanations).

Special section renderers:
- `c18-s1` → Interactive Lua keymap simulator with animated keystroke indicators.
- All `code_block` types → `InteractiveCodeBlock` component.
- Terminal sandbox with commands: `help`, `run`/`compile`, `ls`, `cat init.lua`, `clear`, `exit`.

### VimStatusLine.tsx
The largest component (1159 lines). Contains:
- **Global keyboard handler** (`handleGlobalKeys`) with mode-specific bindings.
- **Command autocomplete** (`getAutocompleteSuggestions`) with `:q!`, `:wq`, `:theme dark/light`, `:registers`, `:explain`, `:chapter N`, `:help TOPIC`.
- **Command executor** (`executeCommand`) with error handling.
- **Registers modal** — Glassmorphic popup showing all yank registers.
- **Help modal** — Context-aware help documentation with AI chat integration.
- **Gemini AI chat** — Multi-turn conversation with streaming typewriter effect.

### CustomCursor.tsx
Custom fluid cursor physics engine (see Section 10).

### BackgroundCanvas.tsx
HTML5 Canvas rendering:
- Aurora orbs (4 floating colored circles with sine-wave breathing alpha).
- Constellations web (landing page only, connecting nearby particles).
- Mouse parallax nudge on orbs.
- Scroll-based vertical parallax.

### Sidebar.tsx
- Desktop: 3D perspective spring slide-in animation (rotateY -15deg, scale 0.94).
- Staggered spring entry animations for chapter navigation links.
- Search input with highlight-flash on navigation.

### FloatingControls.tsx
- Scroll-to-top button with fade-in/out based on scroll position.

---

## 9. Backend & API Architecture

### Local Development (`server.js`)
- Express.js server on port 3001.
- Single endpoint: `POST /api/explain`
- Request body: `{ prompt: string, context?: string, messages?: Array<{role, content}> }`
- Uses `@google/genai` SDK with `gemini-2.5-flash` model.
- System instruction: "Elite Neovim config architect... maximum 3-4 sentences..."
- Supports multi-turn conversations via `messages` array.
- Serves static build files from `dist/` in production.

### Vercel Production (`api/explain.js`)
- Identical logic to `server.js` endpoint but as a Vercel Serverless Function.
- Includes CORS headers for cross-origin requests.
- Handles OPTIONS preflight requests.
- Max duration: 30 seconds.

---

## 10. Custom Cursor Physics Engine

### Architecture Overview
The custom cursor system replaces the OS cursor with two elements:
1. **`#custom-cursor-follower`** — Large glassmorphic reticle circle that follows with delay.
2. **`#custom-cursor-dot`** — Small dot that morphs into different shapes based on context.

### Physics Constants (CRITICAL — DO NOT CHANGE WITHOUT UNDERSTANDING)
```
Position Follow:   posSpring = 0.16,  posFriction = 0.40  (overdamped, zero bounce)
Dimension Morph:   dimSpring = 0.28,  dimFriction = 0.40  (overdamped, zero bounce)
Border-Radius:     rSpring   = 0.32,  rFriction   = 0.40  (overdamped, zero bounce)
```

### Delta-Time Normalization
```typescript
const deltaMs = now - lastFrameTime;
const dt = Math.min(3, deltaMs / 16.666); // Normalized to 60fps

// Spring integration (applies to all axes)
vel += (target - current) * spring * dt;
vel *= Math.pow(friction, dt);  // Exponential decay
current += vel * dt;
```

### Hover State Detection
The `updateHoverState` function runs on `mousemove` and `scroll` events (NOT on every frame — this was a critical performance fix). It detects:
- **Title elements** (`h1, h2, .chapter-title`) → Tall vertical caret matching title height.
- **Close buttons** (`[data-close-btn='true']`) → Red X SVG icon.
- **Sparkles buttons** (`[data-sparkles-btn='true']`) → Rotating Gemini sparkle logo.
- **Input fields** (`input, textarea, [contenteditable]`) → Thin I-beam caret.
- **Text cursor elements** (via `getComputedStyle(target).cursor === 'text'`) → I-beam caret on all selectable text.
- **Code blocks** (`code, pre, .term-code`) → Green blinking block caret.
- **Checklist cards** (`[data-checklist-card]`) → Green tick or red X based on checked state.
- **Clickable elements** (`a, button, kbd, .cursor-pointer`, etc.) → Small dot (NO hand cursor).
- **Default** → 6px circle dot.

### Static ClassName Rule
**NEVER** write to `dot.className` inside the animation loop. Keep the base classes static in JSX. Use `classList.add/remove` only for binary toggles like `ai-cursor-blink`.

---

## 11. Interactive Vim Buffer Simulator

### Component: `InteractiveCodeBlock` (in `ChapterSection.tsx`)

Replaces all static code block renderers with a focusable, interactive Vim-like text editor.

### Props
```typescript
interface InteractiveCodeBlockProps {
  sectionId: string;
  initialContent: string;
  modeColor: string;
  onYank: (text: string) => void;
  getLineExplanation: (line: string) => string;
  setActiveExplanation: (explain: string) => void;
}
```

### State
- `editorLines: string[]` — Current buffer content (line array).
- `cursorLine: number` — Active line index (0-indexed).
- `editorMode: 'NORMAL' | 'INSERT' | 'COMMAND'` — Current editor mode.
- `commandInput: string` — Active `:` command buffer.
- `statusMsg: string` — Bottom status bar message.
- `isFocused: boolean` — Whether the buffer has keyboard focus.
- `lastYankedLine: number | null` — Line index of last yank (for green flash).

### Keybindings (NORMAL mode)
| Key | Action |
|-----|--------|
| `j` / `k` | Move cursor line down / up (with auto-scroll) |
| `i` | Enter INSERT mode (renders inline text input) |
| `y` | Yank current line to registers (green flash) |
| `G` | Jump to last line |
| `g` | Jump to first line |
| `:` | Enter COMMAND mode (focuses command input) |

### Commands (COMMAND mode)
| Command | Action |
|---------|--------|
| `:w` | "Write" — shows success status message |
| `:q` | "Quit" — resets buffer to initial content |
| `:%s/old/new/g` | Global find-and-replace across all lines |

### Visual Design
- Unfocused: `border-zinc-800/85`, text "CLICK BUFFER TO FOCUS & EDIT"
- Focused: `border-indigo-500/80` with indigo glow shadow, text "VIM MODE ACTIVE"
- Active line: Indigo highlight with indigo left border
- Yanked line: Emerald green background flash
- Status bar shows `[NORMAL]`/`[INSERT]`/`[COMMAND]` + cursor position `line:col`

---

## 12. Keyboard Navigation System

### Global Vim Keybindings (in `VimStatusLine.tsx`)

#### NORMAL Mode
| Key | Action |
|-----|--------|
| `j` / `k` | Scroll page down/up by 35% viewport height |
| `G` | Scroll to bottom of page |
| `gg` | Scroll to top of page (double-tap `g` within 1s) |
| `i` / `I` | Enter INSERT mode, open sidebar, focus search |
| `/` | Open sidebar + focus search (Vim search pattern) |
| `v` / `V` | Enter VISUAL mode |
| `:` | Enter COMMAND mode |
| `Escape` | Return to NORMAL mode from any mode |

#### VISUAL Mode
| Key | Action |
|-----|--------|
| `y` / `Y` / `v` / `V` | Yank browser text selection to registers |

#### COMMAND Mode
Available commands via `:` command bar:
- `:q!` — Return to landing page
- `:wq` — Save & return to landing page
- `:theme dark` / `:theme light` — Switch theme
- `:registers` — Open registers modal
- `:explain <query>` — Ask Gemini AI
- `:chapter <N>` — Jump to chapter N
- `:help <topic>` — Open help for topic (modal, registers, buffer, keymaps, macro, treesitter, lsp, general)

---

## 13. Theme System & View Transitions

### Theme Switching
- Stored in `data-theme` attribute on `<html>` element.
- Two themes: `dark` (default) and `light`.
- Switching uses the **View Transitions API** (`document.startViewTransition`).
- Circular clip-path reveal animation from click coordinates via CSS custom properties `--vt-x` and `--vt-y`.
- Type declarations in `src/view-transitions.d.ts`.
- Graceful fallback for unsupported browsers (instant toggle).

### View Transition Overlay Exclusion
- Class `.vt-overlay-exclude` applied to modals prevents them from being captured in the View Transition screenshot, which would destroy their backdrop-blur effects.

---

## 14. Canvas Background System

### Aurora Orbs (`BackgroundCanvas.tsx`)
- 4 floating colored circles with configurable properties (position, radius, velocity, color).
- Velocity: Very slow organic float (`vx`/`vy` random between -0.1 and 0.1, or 6-12px/s).
- Sine-wave breathing alpha (~8-12s cycle).
- Mouse-based parallax nudge.
- Scroll-based vertical parallax (depth-aware).
- No heavy canvas shadow blurs (removed for performance).

### Constellations
- Particle web connecting nearby points.
- **Only rendered on the landing page** (disabled on handbook pages for performance).

---

## 15. Design Tokens & CSS Architecture

### Fonts
- **Sans**: Inter (body text)
- **Display**: Plus Jakarta Sans (headings)
- **Mono**: JetBrains Mono (code, terminal)

### Custom CSS Properties (`:root`)
- `--sidebar-width: 320px`
- `--max-content-width: 920px`
- Easing curves: `--ease-inertial`, `--ease-mechanical`, `--ease-spring`
- Transition presets: `--transition-fluid` (0.6s), `--transition-snap` (0.25s), `--transition-medium` (0.4s)
- Z-index layers: `--z-back` (-1) through `--z-cursor-dot` (100000000)

### Dark Theme Colors
- Background: `--bg-void: #121214`
- Accents: Indigo (`#a5b4fc`), Teal (`#7dd3fc`), Emerald (`#a7f3d0`), Amber (`#fde047`), Crimson (`#fecdd3`)

### Light Theme Colors
- Background: `--bg-void: #f9f8f4` (warm paper)
- Accents: Indigo (`#4f46e5`), Teal (`#0284c7`), Emerald (`#059669`), Amber (`#d97706`), Crimson (`#be123c`)

### Mode Accent Colors
Each Vim mode maps to a CSS variable used across the UI:
- Normal → `--neon-indigo`
- Insert → `--neon-amber`
- Visual → `--neon-emerald`
- Command → `--neon-crimson`

### Custom Cursor CSS
- All OS cursors hidden globally via `cursor: none !important` on `@media (pointer: fine)`.
- `#custom-cursor-follower`: Glassmorphic reticle (96px, rounded, blur backdrop).
- `#custom-cursor-dot`: 6px morphing dot with `.cursor-transition` class.
- `.ai-cursor-blink`: Step-end blinking animation for code block carets.

---

## 16. Deployment Architecture

### Vercel
- **Build Command**: `vite build` (outputs to `dist/`)
- **Framework Preset**: Vite
- **Root Directory**: Project root
- **Serverless Functions**: `api/explain.js` at route `/api/explain`
- **SPA Fallback**: All non-API routes rewrite to `/index.html`
- **Environment Variables**: `GEMINI_API_KEY` must be set in Vercel project settings.

### Local Development
- Vite dev server on port 3000 with proxy for `/api/*` to Express on port 3001.
- Express `server.js` also serves `dist/` statically for production testing.

---

## 17. Agent Configuration & Rules

### Workspace Rules (`.agents/AGENTS.md`)
1. **Single-Confirmation for Public Pushes**: Ask once before `git push` to public repo.
2. **Data Security Guardrail**: No sensitive data, PII, credentials, or inferred personal info.
3. **Private Backup Target**: Default to `private-backup` branch, `backup` remote.
4. **Persistent Memory File Management**: Read MEMORY.md before work, update after.
5. **Detailed Activity Log**: Append to ACTIVITY_LOG.md after every task.
6. **Important Events Review**: Add milestone events to MEMORY.md Section 4.
7. **Context/Memory Clearance Exception**: Don't update files when told to clear memory.

### Liquid UX Engineering Rules
8. **Zero-Bounce Physics**: Use overdamped friction values (`≤ 0.40`) for all cursor spring axes.
9. **Dynamic ClassName Ban**: Never assign `element.className` in rAF loops.
10. **CSS Transition Suppression**: Set `transition: 'none'` during drag events.
11. **AnimatePresence Wrappers**: Immediate child of `<AnimatePresence>` must be `<motion.div>` with unique `key`.
12. **Computed Cursor Style Detection**: Use `getComputedStyle(target).cursor === 'text'` for caret morphing.

### Skills (`.agents/skills/liquid-ux-cursor-sandbox/SKILL.md`)
Detailed documentation of:
- Framerate-independent spring physics equations
- Decoupled spring constant tuning
- Browser reflow prevention patterns
- Interactive Vim buffer simulator architecture
- Modal exit transition patterns

---

## 18. Mistakes Made & What Not To Do

### Performance Anti-Patterns Discovered
1. **DO NOT** call `document.elementFromPoint()` or `getComputedStyle()` inside `requestAnimationFrame` loops — it forces layout reflow on every frame (drops to <10 FPS). Instead, update hover states only on `mousemove` and `scroll` events.
2. **DO NOT** assign `element.className` inside animation loops — this triggers full style recalculation on every frame, breaking CSS transitions.
3. **DO NOT** set CSS `transition` and update `transform` simultaneously on mousemove — the browser fights between the transition animation and the new transform value, resulting in ~5 FPS sluggishness.
4. **DO NOT** use `backdrop-blur` on modal content cards that also have scale animations — the blur filter is re-composited on every animation frame, causing GPU bottlenecks. Use solid high-opacity backgrounds instead (`bg-zinc-900/98`).
5. **DO NOT** use costly canvas shadow blurs — shadowBlur inside Canvas 2D contexts slows down rendering exponentially.
6. **DO NOT** nest heavy constellation connection distance loops outside the landing page — drawing coordinate lines between 60+ moving particles at 60fps is too heavy for continuous reading layouts.

### Architecture Mistakes
7. **DO NOT** use standard `<div>` as the immediate child of `<AnimatePresence>` — Framer Motion cannot track its unmount lifecycle. Exit animations will be instantly dropped.
8. **DO NOT** use `posFriction > 0.48` for cursor physics — values above 0.48 produce visible rubber-banding/bubble-bounce effects. The sweet spot for "snappy but no bounce" is exactly `0.40`.
9. **DO NOT** attempt typography scaling with custom CSS variable overrides on Tailwind v4 — it conflicts with the JIT engine. Use native Tailwind text size classes instead.

### Git Mistakes
10. **DO NOT** push `.agents/`, `.vscode/`, or `.antigravity/` directories to the public repository — they were cleaned from `main` history and are in `.gitignore`.
11. **DO NOT** push without explicitly confirming with the user for public repos.

---

## 19. What Works Well

1. **Overdamped spring physics** at `friction = 0.40` — perfectly snappy, zero bounce, feels premium.
2. **Delta-time normalization** — cursor feels identical on 60Hz, 144Hz, and 360Hz monitors.
3. **Separated backdrop/card animations** — fast modal opens without GPU lag.
4. **`classList` toggling** instead of `className` overwriting — 240fps+ cursor morphing.
5. **Computed cursor style detection** — automatically morphs to I-beam on any selectable text.
6. **View Transitions API** — beautiful circular reveal theme switching.
7. **Interactive code blocks** — users can actually edit code, navigate with j/k, yank lines.
8. **Gemini AI integration** — real-time contextual explanations with multi-turn chat.
9. **Tailwind v4 native sizing** — typography matches the "hope" branch reference exactly.
10. **Canvas performance** — removed shadow blurs and restricted constellations to landing page.

---

## 20. Current State & What's Done

### ✅ Completed Features
- Full custom cursor physics engine (overdamped, framerate-independent)
- Interactive Vim buffer simulator in all code blocks
- Terminal sandbox in code blocks (help, run, compile, ls, cat, clear, exit)
- Lua keymap simulator (Chapter 18)
- Global Vim keyboard navigation (j/k scroll, gg/G, i search, v visual yank, : command)
- Command bar with autocomplete and 11+ commands
- Gemini AI chat integration with multi-turn conversations
- Registers modal with 5 yank slots
- Help system with 8 topic modals
- View Transitions circular reveal theme switching
- Aurora orb canvas with parallax and breathing
- 3D sidebar with staggered chapter animations
- Magnetic button hover effects (200+ FPS)
- Gemini sparkle cursor logo on AI buttons
- Premium glassmorphic design system
- Vercel deployment with serverless Gemini API
- Reading time estimates and scroll progress bars
- Contribute modal with GitHub link
- Keystroke HUD badges

---

## 21. Future Plans & What's Left

### High Priority
1. **LocalStorage Persistence for InteractiveCodeBlock** — Save modified buffer lines so edits survive page reload.
2. **Visual Block Selection (v mode)** — Multi-line selection in InteractiveCodeBlock with block-yank support.
3. **dd (Delete Line)** — Add line deletion in NORMAL mode.
4. **o/O (Open Line)** — Insert new lines above/below cursor.
5. **u (Undo)** — Undo stack for buffer modifications.

### Medium Priority
6. **Custom Keymap Registration** — Let users define and test custom keymaps in the sandbox.
7. **Macro Recording (q + @)** — Record and replay keystroke sequences.
8. **Syntax Highlighting** — Basic Lua/VimL syntax coloring in code blocks.
9. **Split View** — Side-by-side buffer comparison (`:vsplit` simulation).

### Low Priority
10. **Mobile Touch Optimization** — Custom cursor disabled on touch; touch-friendly code blocks.
11. **PWA Support** — Service worker for offline reading.
12. **Search Across Chapters** — Full-text search with fuzzy matching.
13. **User Progress Tracking** — Chapter completion checkmarks saved to localStorage.
14. **Plugin Ecosystem Reference** — Chapters on popular Neovim plugins (Telescope, lazy.nvim, etc.).
