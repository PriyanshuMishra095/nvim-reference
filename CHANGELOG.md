# Changelog — Neovim Handbook Studio

All notable changes to the `nvim://reference` project are documented below.

---

## [2026-07-02]

### Custom Cursor Zero-Bounce Physics & High-Hz Normalization
- **Modified**: `src/components/CustomCursor.tsx`
- **Added**: Delta-time (`dt`) physics loop normalized to 60fps, resolving cursor coordinate acceleration and scaling on high-refresh rate displays (144Hz, 240Hz, 360Hz).
- **Optimized**: Decoupled spring coordinates for position follow (`posSpring=0.16`), dimensions (`dimSpring=0.28`), and border-radius (`rSpring=0.32`), and set all friction coefficients to exactly `0.40` (overdamped) to completely eliminate bubble bounce/overshoot oscillations.

### Stateful Interactive Vim Buffers
- **Modified**: `src/components/ChapterSection.tsx`
- **Added**: Stateful `InteractiveCodeBlock` component replacing all static code blocks.
- **Implemented**: Core Vim editor states (`NORMAL`, `INSERT`, `COMMAND`) with `j`/`k` vertical navigation, `i` editing mode, `y` line-yanking, `:w` file writing simulation, `:q` file resets, and `:%s/find/replace/g` global substitution commands.

### Performance & Style Optimization
- **Modified**: `src/components/CustomCursor.tsx`, `src/index.css`, `src/components/TerminalLanding.tsx`
- **Bypassed**: Costly `getBoundingClientRect` calls within rAF loops by caching active snap dimensions in `cachedActiveRectRef`, preventing layout thrashing.
- **Optimized**: Suspended active CSS transitions on magnetic elements during dragging (`transition: none`) to achieve a solid 200+ FPS button pulling experience.
- **Improved**: Replaced dynamic `dot.className` overrides with static JSX classes and `classList` state checks to avoid browser reflow overheads.

### Modals Exit Transition & Backdrop Blur Preservation
- **Modified**: `src/components/VimStatusLine.tsx`, `src/App.tsx`, `src/index.css`
- **Fixed**: Modal card overlays unmounting instantly without exit transitions by wrapping them in `<motion.div>` with unique keys inside `<AnimatePresence>`.
- **Improved**: Isolated overlays using `.vt-overlay-exclude` to prevent View Transition screenshot rendering from wiping out backdrop-filter blurs.
- **Optimized**: Replaced backdrop blur filters on scale-animating modal cards with solid colors (`bg-zinc-900/98`) to eliminate GPU composition bottlenecks during zooms.

### Circular Sweep View Transitions
- **Modified**: `src/App.tsx`, `src/index.css`, `src/view-transitions.d.ts`
- **Added**: Native View Transitions API theme switcher (`document.startViewTransition`) sweeping a circular clip-path reveal from custom properties coordinates (`--vt-x`/`--vt-y`) mapped to theme toggle clicks.

### Canvas Performance & Parallax Tweaks
- **Modified**: `src/components/BackgroundCanvas.tsx`
- **Optimized**: Disabled expensive shadow blurs on stars and restricted constellation lines drawing exclusively to the landing page, solving 5fps main handbook panel lag.
- **Improved**: Sized-down initial velocities (`vx`/`vy` between -0.1 and 0.1) and added depth-aware scroll-parallax offsets.

---

## [Prior to 2026-07-02]

### Matrix Typewriter & AI Integrations
- **Modified**: `src/components/VimStatusLine.tsx`, `api/explain.js`, `server.js`
- **Added**: Matrix typewriter animation for LLM help results, typing characters dynamically with block carets.
- **Fixed**: Vercel serverless Gemini API arrays content format bugs, added CORS headers, and created express server fallback keys.

### 3D Sidebar Animations
- **Modified**: `src/components/Sidebar.tsx`, `src/App.tsx`
- **Added**: Staggered spring slide-in scale and 3D Y-axis rotation Y entry on sidebar toggle.

### Initial Brand Refactoring
- **Modified**: Project-wide
- **Added**: Renamed and rebranded all files and UI assets to `nvim://reference`.
- **Configured**: Active target branches, backup configurations, and security ignores.
