# Workspace Rules for nvim-reference

- **Double-Confirmation for Public Pushes**: You must explicitly ask and confirm with the user TWICE before running any `git push` commands to the public GitHub repository (e.g., origin at `https://github.com/PriyanshuMishra095/nvim-reference.git` or `Neovim-Handbook-Studio.git`).
- **Private Backup Target**: Default all Git version control operations and code pushes to the private backup repository once configured.
- **Persistent Memory File Management**: Before starting work on any prompt, you must read the project memory file at `.agents/MEMORY.md`. After completing any task or prompt, you must update this memory file with any changes, additions, or new context to prevent loss of information when the chat context is compressed or reset. Always notify the user of any modifications, additions, or context deletions made in the memory file.
