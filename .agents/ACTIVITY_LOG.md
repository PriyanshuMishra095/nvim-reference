# Activity Log

This file is a write-only log of every detailed activity performed during development. Agents must append new activities here as they happen, ensuring high detail.

---

## Migrated History

### Branding & Logo Polish
- Unified all titles and logo texts to `nvim://reference`.
- Removed the **N** icon badge from the sidebar logo container in `Sidebar.tsx`.
- Replaced the release version text in the sidebar logo with the tagline: `One reference to rule them all`.

### High-Contrast Contrast Styling
- Implemented HSL custom colors matching APCA astigmatism-friendly contrast guidelines for both light and dark modes.

### Sidebar Layout Tweaks
- Hid the sidebar scrollbar with `.no-scrollbar` (main window scrollbar remains visible).
- Increased font size for sidebar buttons to `text-sm`.
- Search placeholder updated to a minimal `/`.

### Landing Page & Navigation Fixes
- Removed Vim Modality Specifier badge from the hero section.
- Replaced the secondary button ("Official Website") with a "Contribute" button.
- Fixed choppy hover scaling on hero action buttons by removing conflicting Tailwind hover transition classes and running physics-based calculations entirely via JS mouse handlers.

### Contribute Page
- Designed and integrated a gorgeous glassmorphic full-screen Contribute modal overlay inside `App.tsx` triggered by the landing button.
- Added repository context, GitHub project link, and full AI/LLM assistance disclosure.

### Vim Statusline Refactoring
- Modified statusline (`VimStatusLine.tsx`) to remain a single horizontal row on all viewport widths (forcing `flex items-center justify-between h-11 md:h-12`).
- Vertically centered the Mode badge, file path, register indicators, and action buttons.
- Set the file path to dynamically collapse on mobile screens (hiding `AppData/Local/nvim/` and showing `init.lua[+]`).
- Shortened the "Registers" button text to "Regs" on mobile screen widths.
- Added hide/show statusline toggle triggers.

### Scroll-to-Top Indicator
- Repositioned to the bottom-left corner.
- Added dynamic layout positioning triggers to offset the button when the sidebar or statusline hides/shows, preventing layout collisions.

### Interactive Cursor Customizations
- Customized repulsion physics with floating star canvas background.
- Disabled the ability of the custom opaque mouse cursor to morph into a standard hand icon.
- Programmed card hover morphing: Custom opaque mouse cursor morphs into a green tick mark when hovering unchecked option cards, and morphs into a red "X" when hovering checked option cards (both sized slightly larger than the hand icon).

### Vercel Analytics
- Imported and loaded `<Analytics />` from `@vercel/analytics/react` into the main layout root in `App.tsx`.

### Branding Footprint Cleanup
- Removed `Layout: Modular Studio App` metadata from the footer in `App.tsx` and `Layout: Modular Astro-Style App` in `Sidebar.tsx`.

### Assets & Documentation
- Set custom Neovim SVG icon as the favicon inside `index.html`.
- Created a simple layman-friendly `README.md` containing simple clone/setup instructions and AI contribution disclosures.

### Interactive Cursor, Buttons & Editable Title
- Modified CustomCursor to morph into a thin text caret matching the title's computed font-size on hover, and hid the reticle.
- Implemented inline click-to-edit site title on landing with session state (resets back to default 'nvim://reference' on page refresh) synced globally.
- Removed description paragraph and rectangular blur wrapper from landing content to maintain a clean layout.
- Resolved magnetic button movement jankiness and repulsion glitches by removing shared rect state and calculating coordinates dynamically per hover event with smooth bezier transitions.
- Aligned expand sidebar button size (`w-12 h-12`) with the celestial theme toggle, merged it into the sidebar edge, and added a 180-degree rotation transition.
- Set scroll-to-top and bottom statusline hide buttons to be vertically static (`bottom-6`), and added a smooth rotation to the hide statusline chevron.

### UI Scaling, Vim Keybinds, & Fluid Droplet Animation
- Scaled the custom cursor text caret (width `3px` and height multiplier `1.15`) and input caret (width `2.5px` and height `22px`) on the landing page for enhanced visibility.
- Adjusted the landing page main title font size to a balanced responsive size (`text-4xl sm:text-5xl md:text-[5rem] lg:text-[6rem] xl:text-[7rem]`) to ensure it scales cleanly on small screens.
- Added vertical separation to landing content (container `gap-16`, title group `gap-4`, and subtitle `mt-12`) and scaled the subtitle text size up to `text-xs sm:text-sm md:text-base` for responsive readability.
- Set the sidebar brand title text to `font-black` to make it bolder.
- Widened the landing content container to `max-w-[95vw] xl:max-w-[85vw]` to prevent the scaled title from wrapping to two lines.
- Polished the custom cursor morphing physics by using a faster spring constant (`rSpring = 0.32`) and higher damping (`rFriction = 0.85` friction) combined with a physical border-radius boundary clamp (`maxPhysicalR = Math.min(width/2, height/2)`) specifically for the border-radius property, preventing visual capsule/oval shape lag or overshoot when hovering over rectangle buttons.
- Programmed a reactive `activeChapterId` watcher in `Sidebar.tsx` to automatically scroll the current highlighted chapter button into view inside the sidebar links viewport.
- Added global Vim key binds in `VimStatusLine.tsx`: pressing `i`/`I` in Normal mode (if selection is empty) opens the sidebar, turns on insert mode, and focuses the search input. Exiting insert mode via `Escape` automatically restores the sidebar back to hidden if it was previously hidden, and blurs active focus.
- Redesigned the desktop collapse sidebar button: it is now always `rounded-full` (circle only) and floats at `left: 256px` (well within the borders of the sidebar) when open, and pops out to `left: 24px` with a snappy, low-viscosity fluid animation (`0.6s` runtime, `@keyframes droplet-pop` horizontal stretch and translation offset) when collapsed.
- Fixed the contribute overlay layout to use a fully opaque solid background (rendering a secondary `<BackgroundCanvas theme={theme} />` internally with `relative z-10` overlay elements) so it displays as its own page with animating cosmic star field particles rather than showing transparently on top of existing layouts, and fixed the title gradient color (`teal-455` typo to theme's custom `var(--neon-teal)`) to prevent title text fading.
- Optimized the Contribute page modal for phone screens: reduced container padding to `p-5 sm:p-8`, adjusted close button alignment, scaled title text to `text-2xl sm:text-4xl`, and added vertical scrolling focus support for tiny mobile viewports.

### Status Bar Layout, Snapping Cursor, Registers Explanation & AI Server
- Corrected a React tag syntax mismatch in `VimStatusLine.tsx` around the status bar closing divs to restore build compilation.
- Eliminated `flex-shrink-0` layout constraints from Section B (File Status) and Section C (Chapter Info) in the statusline, enabling clean CSS text truncation.
- Configured `flex-shrink-0` on the right-hand statusline columns to ensure that the Vim Interactive Help Tutor button is never clipped or pushed out of view.
- Added a `.vim-statusline` selector target to the status bar container and updated `CustomCursor.tsx` to snap with a snug `-2` padding, correcting morphing mouse distortions.
- Expanded the in-memory registers tray explanation modal to clearly explain registers (`"`, `+`) and detail selection-yank triggers.
- Fully removed the `[concept]` placeholder string from command suggestion autocompletes.
- Verified backend server (`server.js`) connectivity running as a background task on port 3001, proxying API calls cleanly.

### Detailed Morphing Cursor Corners, Clickable Chapter Name, Hidden Sidebar & Autocomplete Typing Polish
- Upgraded `CustomCursor.tsx` to support 4-corner border-radius animation physics (`rTL`, `rTR`, `rBL`, `rBR`), allowing the reticle to morph perfectly around non-uniform buttons like the leftmost and rightmost status bar items (which have only left or right rounded corners).
- Explicitly added `rounded-l-xl` to the status bar's leftmost Mode badge button and `rounded-r-xl` to the rightmost Interactive Help button in `VimStatusLine.tsx`.
- Configured the registers grid modal to make the entire card container scrollable (`max-h-[85vh] overflow-y-auto`) and removed the nested scroll container to support smooth unified scrolling on all screen sizes.
- Defaulted the sidebar state `sidebarVisible` to `false` in `App.tsx` so it stays hidden by default when a user starts scrolling from the landing page.
- Transformed the Chapter Info section on the status bar into a clickable button that toggles/opens the sidebar.
- Improved the Vim `:` console overlay behavior: it now initializes the input box with a `:` value pre-typed, places the text cursor immediately after it, and cleanly exits console mode back to normal mode if the user backspaces or deletes the leading `:`. Removed the redundant outside colon prefix element.

### Blinking Green Text Input Cursors & Status Badge Cursor Contrast
- Reprogrammed text box inputs (`isOverInputRef.current` triggers) in `CustomCursor.tsx` to display a retro blinking green block caret (just like in Vim code blocks), affecting the command-line overlay box and the sidebar search inputs.
- Added a `data-mode-badge` attribute to the Active Mode Badge button in `VimStatusLine.tsx` and modified the default dot background calculation in `CustomCursor.tsx` to invert to high-contrast white (light mode) or black (dark mode) when hovering over the indigo Normal mode button.
- Confirmed the architecture runs both the React frontend build and the backend Gemini API service unified under the Express web server (`server.js`) in production.

### Vercel API Configuration, LLM Help Redesign & Public History Purge
- Created a Vercel Serverless Function under `api/explain.js` to route and execute Gemini API requests on Vercel deployments.
- Redesigned the AI Explanation modal layout: renamed to "Neovim LLM Help", simplified the footer text, and changed the primary button to "Ask another question" which triggers auto-opening of the console prefilled with `:explain `.
- Completely purged `.antigravity/`, `.vscode/`, and `.agents/` directories and their history from the public `main` branch. Added `.agents/` to `.gitignore` on `main`, keeping the public branch clean while keeping `.agents/` tracked on `private-dev` for private backup repository sync.

### Public Repository Security Audit
- Conducted a comprehensive audit of the `main` branch and the remote `origin/main` repository to ensure compliance with the Data Security Guardrail.
- Verified that `.agents/`, `.vscode/`, and `.antigravity/` directories were successfully purged from the entire git history via `git filter-branch` and force-pushed to the remote.
- Confirmed no other sensitive files, API keys, `.env` files, or personal data exist in the public repository's current tree or commit history.

---

## Log Entries

### [2026-06-25T04:01:27+05:30] Created Activity Log & Restructured Memory File
- **Files Modified**: 
  - `[NEW] .agents/ACTIVITY_LOG.md` (Created write-only log, migrated all detailed history).
  - `[MODIFY] .agents/MEMORY.md` (Removed detailed history, replaced with a concise "Important Events" section, added instructions for the new workflow).
  - `[MODIFY] .agents/AGENTS.md` (Updated rules: single-confirmation for public pushes, added rule to append to `ACTIVITY_LOG.md` after every action, added rule to check and append to `MEMORY.md`'s "Important Events" when significant events occur).
- **Details**:
  - Moved the detailed implementation history from `.agents/MEMORY.md` to `.agents/ACTIVITY_LOG.md`.
  - Configured `MEMORY.md` to only store high-level "Important Events" in a very compact, information-rich format.
  - Formulated strict workspace instructions for future agents to log detailed work to `ACTIVITY_LOG.md` and keep `MEMORY.md` concise.

### [2026-06-25T04:10:00+05:30] Implemented In-Modal AI Chat, Command Autocomplete, Overlay improvements, and named label change
- **Files Modified**:
  - `[MODIFY] src/components/VimStatusLine.tsx` (Added chat history rendering, follow-up query submission box, Tab key autocompletion, backdrop pointer-events-auto click dismiss, stopPropagation on container, updated modal footer buttons/descriptions, renamed label to 'Run Command').
  - `[MODIFY] api/explain.js` (Destructured messages history array and compiled contents array matching SDK specifications).
  - `[MODIFY] server.js` (Implemented identical messages history compiling logic on development backend server).
- **Details**:
  - Upgraded `/api/explain` API endpoints on both Vercel and Express to support parsing message history for continuous AI chat threads.
  - Integrated a fully interactive conversation chat UI within the "Neovim LLM Help" modal, rendering user prompts and markdown responses in a scrollable view with auto-scroll.
  - Placed a blinking caret text input at the bottom of the modal that activates upon clicking "Ask another question".
  - Configured Tab key down autocompletion inside the console input to instantly select the closest matching command.
  - Restricted mouse clicks to the backdrop overlay to dismiss/minimize the console while keeping particle canvas mouse repulsion fully operational globally.
  - Renamed the autocomplete hint panel header to 'Run Command'.
  - Removed "Click on blue links..." footer description from the AI modal.

