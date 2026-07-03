---
name: liquid-ux-cursor-sandbox
description: Guidelines and instructions for building liquid critically-damped custom cursors, high-FPS magnetic button drags, and interactive Vim buffer editor sandboxes.
---

# Liquid UX, Custom Cursor Physics & Interactive Vim Buffers

This skill provides guidelines and patterns for implementing highly-optimized, premium-feel user experiences (UX) featuring custom fluid cursors, zero-bounce physics, high-FPS interactive UI components, and stateful terminal/code block simulators.

---

## 1. Framerate-Independent Custom Cursor Physics

To ensure physics calculations behave identically across varying monitor refresh rates (60Hz, 144Hz, 240Hz, or 360Hz) while taking advantage of high-Hz coordinate paths:

### Delta-Time (dt) Normalization
1. Track frame delta times using `performance.now()`.
2. Normalize delta time relative to 60fps (ideal step size `16.666ms`).
3. Scale spring integrations and apply exponential decay damping using `Math.pow(friction, dt)`.

```typescript
// Inside requestAnimationFrame loop
const now = performance.now();
const deltaMs = now - lastFrameTime;
lastFrameTime = now;
const dt = Math.min(3, deltaMs / 16.666); // Cap step size to prevent giant jumps

// Spring force integration
vel.x += (target.x - current.x) * spring * dt;
vel.x *= Math.pow(friction, dt); // Exponential decay damping
current.x += vel.x * dt;
```

### Decoupled Spring Tuning
Decouple positional spring constants from dimensional morphing to allow floaty, natural cursor tracking and snappy shape snaps.

- **Positional Follow**: Tuned for smooth drifting behind the real pointer.
  - `posSpring = 0.16`
  - `posFriction = 0.40` (overdamped to settle with zero overshoot)
- **Dimensional/Shape Morphing**: Tuned for instant bounding box adjustment.
  - `dimSpring = 0.28`
  - `dimFriction = 0.40` (overdamped to prevent elastic bouncing)
- **Border-Radius Morphing**: Tuned for quick transition between circular and rectangular states.
  - `rSpring = 0.32`
  - `rFriction = 0.40` (prevents border-radius wobble or capsule morph lag)

---

## 2. Preventing Browser Reflows & High-FPS Snaps

Updating stylesheets or styles in requestAnimationFrame can cause massive rendering bottlenecks (jank).

### Static ClassNames
- **Rule**: Never overwrite or assign to `element.className` on every frame inside the physics loop.
- **Solution**: Keep the core utility layout classes static in the JSX wrapper. Use `element.classList.add()` and `element.classList.remove()` strictly for binary state changes (such as adding a blinking caret class `ai-cursor-blink`).

### Magnetic Button Dragging
- **Transform-Transition Conflict**: Overwriting inline `element.style.transform` on every mousemove event while a CSS `transition` is active forces the browser to evaluate transitions over active coordinates, capping framerates to ~5-10 FPS.
- **Rule**:
  1. Set `element.style.transition = 'none'` inside the active `mousemove` / `handleMagneticMove` handler.
  2. Apply the magnetic pull transforms instantly.
  3. Inside the `mouseleave` / `handleMagneticLeave` handler, restore the CSS transition (e.g., `transition = 'transform 0.6s var(--ease-inertial)'`) and reset the transform to return the button back to center smoothly.

---

## 3. Stateful Interactive Vim Buffer Simulator

Convert standard static code block sections into tab-focusable, stateful mock Neovim editor buffers.

### Core Architecture
- **State Fields**:
  - `editorLines`: String array initialized to the section's code contents.
  - `cursorLine`: Active line index (0-indexed).
  - `editorMode`: `'NORMAL'`, `'INSERT'`, or `'COMMAND'`.
  - `commandInput`: Input buffer for active `:` commands.
- **Vim Navigation Keybindings**:
  - `j` / `k`: Increment or decrement `cursorLine` (clamped). Scroll the active line container into view using `scrollIntoView({ block: 'nearest' })`.
  - `i`: Enter `INSERT` mode. Render a native text input overlay over the active cursor line to edit code text dynamically.
  - `y`: Yank the active line text to the clipboard and local registers, highlighting the line container in emerald green.
  - `G` / `g`: Jump cursor line directly to the bottom or top of the buffer.
  - `:`: Toggle `COMMAND` mode and focus a status bar command input.
- **Status Bar commands**:
  - `:w` -> Show confirmation message (`"[filename].lua written successfully"`).
  - `:q` -> Reset simulated buffer state back to default contents.
  - `:%s/old/new/g` -> Execute replacement across all lines in `editorLines`.

---

## 4. Modal Exit Transitions (Framer Motion)

Ensure overlays and popups unmount cleanly with entry and exit animations.

- **Framer Motion `<AnimatePresence>` Rule**: The immediate child of `<AnimatePresence>` must be a `<motion.div>` (or `<motion.section>`) with a unique `key` prop (e.g. `key="registers-overlay"`).
- **Correct Overlay Markup**:
  ```tsx
  <AnimatePresence>
    {isOpen && (
      <motion.div
        key="my-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal Card Slide/Spring Zoom */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          {/* Content */}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  ```
