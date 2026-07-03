# Workspace Rules for nvim-reference

- **Single-Confirmation for Public Pushes**: You must explicitly ask and confirm with the user ONCE before running any `git push` commands to the public GitHub repository (e.g., origin at `https://github.com/PriyanshuMishra095/nvim-reference.git` or `Neovim-Handbook-Studio.git`).
- **Data Security Guardrail**: Do not upload anything sensitive. Do not upload anything that is not required by the developers to work on the project. Do not upload anything which might imply to sensitive data. Do not upload any such data which might seem safe to upload but when compiled and analysed with other data might reveal sesitive or personal information. Do not upload any email, password or phone number or any personal information of any kind.
- **Private Backup Target**: Always remain on the `private-backup` branch and perform all Git version control operations and code pushes exclusively to the private backup repository. Do not use or switch to the public `main` branch or push to the public repo unless explicitly instructed otherwise.
- **Persistent Memory File Management**: Before starting work on any prompt, you must read the project memory file at `.agents/MEMORY.md`. After completing any task or prompt, you must update this memory file with any changes, additions, or new context to prevent loss of information when the chat context is compressed or reset. Always notify the user of any modifications, additions, or context deletions made in the memory file.
- **Detailed Activity Log Maintenance**: After completing any task or prompt, you must append a detailed log entry of all performed activities to `.agents/ACTIVITY_LOG.md`. You do not need to read this file every time on startup, but refer to it when historical implementation details are required.
- **Important Events Review**: After completing any task, check if the activity is important enough (e.g., architectural change, major UI milestone, deployment updates) to be mentioned in Section 4 of `.agents/MEMORY.md` under "Important Events". If so, append a highly concise, information-rich summary there.
- **Context/Memory Clearance Exception**: When explicitly asked to 'Clear your contexts' or 'Clear your memory', do not update the memory file or modify any files for that command.

### Liquid UX & Custom Cursor Engineering Rules

- **Zero-Bounce Custom Cursor Physics**: Always decouple custom cursor physics variables into:
  - Position Follow: `posSpring = 0.16`, `posFriction = 0.40`
  - Dimension Morph: `dimSpring = 0.28`, `dimFriction = 0.40`
  - Shape Morph Radius: `rSpring = 0.32`, `rFriction = 0.40`
  Using overdamped friction values (`0.40` or lower) is required to prevent coordinate overshoots or shape "bubble bouncing".
- **Dynamic ClassName Override Ban**: Do not overwrite or assign to `element.className` on every frame inside the `requestAnimationFrame` physics loop. Always use static class lists in JSX and use `classList.add`/`remove` to toggle temporary caret states (like blinking) to avoid stylesheet reflows.
- **Active CSS Transition Suppression**: When implementing drag/magnetic pull on elements:
  - Set `style.transition = 'none'` during drag/mousemove events to avoid transition-transform wars.
  - Reset the style and restore transition (e.g. `transition = 'transform 0.6s var(--ease-inertial)'`) on mouseleave.
- **AnimatePresence Exit Wrappers**: The immediate child of `<AnimatePresence>` must be a `<motion.div>` (or motion component) with a unique `key` prop, otherwise exit transitions are dropped immediately.
- **Computed Cursor Style Detection**: To dynamically morph custom cursors into I-beam text carets on selectable texts, query the target's computed style using `window.getComputedStyle(target).cursor === 'text'` (or `'vertical-text'`) instead of hardcoding element selectors.
