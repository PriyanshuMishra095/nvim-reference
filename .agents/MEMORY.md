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
- **Rule 1 (Double-Confirmation for Public Pushes)**: Must explicitly ask and confirm with the user TWICE before executing any `git push` command targeting the public GitHub repository (`origin`).
- **Rule 2 (Private Backup Target)**: Default all version control operations and push commands to the private `backup` repository unless explicitly instructed otherwise.
- **Rule 3 (Memory Maintenance)**: Always revisit this memory file (`.agents/MEMORY.md`) before working on any prompt, and update it after completing a task to ensure no historical details are lost. Always let the user know what was updated or removed.
- **Rule 4 (Context/Memory Clearance Exception)**: When explicitly asked to 'Clear your contexts' or 'Clear your memory', do not update the memory file or modify any files for that command.

---

## 4. Chronological Implementation History
- **Branding & Logo Polish**: 
  - Unified all titles and logo texts to `nvim://reference`.
  - Removed the **N** icon badge from the sidebar logo container in `Sidebar.tsx`.
  - Replaced the release version text in the sidebar logo with the tagline: `One reference to rule them all`.
- **High-Contrast contrast styling**:
  - Implemented HSL custom colors matching APCA astigmatism-friendly contrast guidelines for both light and dark modes.
- **Sidebar layout tweaks**:
  - Hid the sidebar scrollbar with `.no-scrollbar` (main window scrollbar remains visible).
  - Increased font size for sidebar buttons to `text-sm`.
  - Search placeholder updated to a minimal `/`.
- **Landing Page & Navigation Fixes**:
  - Removed Vim Modality Specifier badge from the hero section.
  - Replaced the secondary button ("Official Website") with a "Contribute" button.
  - Fixed choppy hover scaling on hero action buttons by removing conflicting Tailwind hover transition classes and running physics-based calculations entirely via JS mouse handlers.
- **Contribute Page**:
  - Designed and integrated a gorgeous glassmorphic full-screen Contribute modal overlay inside `App.tsx` triggered by the landing button.
  - Added repository context, GitHub project link, and full AI/LLM assistance disclosure.
- **Vim Statusline Refactoring**:
  - Modified statusline (`VimStatusLine.tsx`) to remain a single horizontal row on all viewport widths (forcing `flex items-center justify-between h-11 md:h-12`).
  - Vertically centered the Mode badge, file path, register indicators, and action buttons.
  - Set the file path to dynamically collapse on mobile screens (hiding `AppData/Local/nvim/` and showing `init.lua[+]`).
  - Shortened the "Registers" button text to "Regs" on mobile screen widths.
  - Added hide/show statusline toggle triggers.
- **Scroll-to-Top Indicator**:
  - Repositioned to the bottom-left corner.
  - Added dynamic layout positioning triggers to offset the button when the sidebar or statusline hides/shows, preventing layout collisions.
- **Interactive Cursor Customizations**:
  - Customized repulsion physics with floating star canvas background.
  - Disabled the ability of the custom opaque mouse cursor to morph into a standard hand icon.
  - Programmed card hover morphing: Custom opaque mouse cursor morphs into a green tick mark when hovering unchecked option cards, and morphs into a red "X" when hovering checked option cards (both sized slightly larger than the hand icon).
- **Vercel Analytics**:
  - Imported and loaded `<Analytics />` from `@vercel/analytics/react` into the main layout root in `App.tsx`.
- **Branding footprint cleanup**:
  - Removed `Layout: Modular Studio App` metadata from the footer in `App.tsx` and `Layout: Modular Astro-Style App` in `Sidebar.tsx`.
- **Assets & Documentation**:
  - Set custom Neovim SVG icon as the favicon inside `index.html`.
  - Created a simple layman-friendly `README.md` containing simple clone/setup instructions and AI contribution disclosures.
- **Interactive Cursor, Buttons & Editable Title**:
  - Modified CustomCursor to morph into a thin text caret matching the title's computed font-size on hover, and hid the reticle.
  - Implemented inline click-to-edit site title on landing with session state (resets back to default 'nvim://reference' on page refresh) synced globally.
  - Removed description paragraph and rectangular blur wrapper from landing content to maintain a clean layout.
  - Resolved magnetic button movement jankiness and repulsion glitches by removing shared rect state and calculating coordinates dynamically per hover event with smooth bezier transitions.
  - Aligned expand sidebar button size (`w-12 h-12`) with the celestial theme toggle, merged it into the sidebar edge, and added a 180-degree rotation transition.
  - Set scroll-to-top and bottom statusline hide buttons to be vertically static (`bottom-6`), and added a smooth rotation to the hide statusline chevron.
