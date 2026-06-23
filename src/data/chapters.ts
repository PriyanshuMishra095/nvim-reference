import { Chapter } from '../types';

export const CHAPTERS_DATA: Chapter[] = [
  // --- SECTION 1: COGNITIVE ONBOARDING ---
  {
    id: 'chapter-1',
    num: 1,
    tag: 'Cognitive Foundations',
    title: 'The Neovim Journey: "But Why?"',
    description: 'A ground-up conceptual introduction for individuals entering terminal-driven development, highlighting tactile focus and workflow velocity.',
    sections: [
      {
        id: 'c1-s1',
        title: 'Tactile Momentum vs. Mouse Overhead',
        type: 'text',
        content: 'Welcome to the threshold of an alternate computing paradigm. If you are reading this guide, you are likely a developer who works in high-overhead Graphical User Interfaces (GUIs) like VS Code or WebStorm. Every time you shift your hand away from your keyboard to use a mouse, edit a file tab, or scroll a sidebar, you break your active intellectual momentum. Neovim eliminates this physical overhead, transforming your keyboard into an integrated, zero-latency instrument where actions map directly to muscle memory.'
      },
      {
        id: 'c1-s2',
        title: 'The Lineage of Terminal Editing Masters',
        type: 'table',
        extraData: {
          headers: ['Ecosystem Build', 'Era', 'Architectural Innovations'],
          rows: [
            ['Vi (Visual Interface)', '1976', 'Designed for low-bandwidth terminals without dedicated arrow keys. Bound navigation entirely to the keyboard home row (HJKL).'],
            ['Vim (Vi Improved)', '1991', 'Introduced powerful internal scripting (Vimscript), visual modes, syntax highlighting, and multiple window view splits.'],
            ['Neovim (Modern Era)', '2014+', 'A fully multi-threaded, asynchronously reactive engine with out-of-the-box Lua runtime execution, background processes, and native language intelligence (LSP).']
          ]
        }
      }
    ]
  },
  {
    id: 'chapter-2',
    num: 2,
    tag: 'Conceptual Models',
    title: 'The Mental Paradigm Shift: Modal Editing',
    description: 'Unlearning the traditional persistent typing state and entering the highly versatile system of operational control states.',
    sections: [
      {
        id: 'c2-s1',
        title: 'The Power of Modal Isolation',
        type: 'text',
        content: 'Traditional editors assume you are always typing raw letters directly onto the screen. To undo, copy, or move blocks, you must struggle with awkward combinations of Ctrl, Alt, and Shift. Neovim separates action from input by default. By starting in Normal Mode, your keyboard is configured as a fast control panel where single keys function as powerful commands.'
      },
      {
        id: 'c2-s2',
        title: 'Traditional Single-State Editing vs. Neovim Modality',
        type: 'vs_matrix',
        extraData: {
          leftTitle: 'Traditional Flat Editors',
          leftItems: [
            'Keyboard is locked as a flat text entry typewriter.',
            'Every movement requires mouse clicks or reaching for distant arrow/home keys.',
            'High cognitive friction is introduced when selecting and refactoring.'
          ],
          rightTitle: 'Modern Neovim Modality',
          rightItems: [
            'Keyboard is treated as a programmatic grid of commands.',
            'Tactile control remains securely centered on the home row.',
            'Editing, jumping, and structure transformations execute via clean formulas.'
          ]
        }
      }
    ]
  },
  {
    id: 'chapter-3',
    num: 3,
    tag: 'Data Layer Mechanics',
    title: 'Ecosystem Architecture: Buffers and Windows',
    description: 'Understanding how Neovim separates in-memory file buffers from the viewports that render them.',
    sections: [
      {
        id: 'c3-s1',
        title: 'Decoupling File Data from Display Panels',
        type: 'text',
        content: 'In standard graphical workspaces, a tab and a file are the same thing. In Neovim, they are separated. Buffers, windows, and tab pages exist as three distinct, modular layers in the workspace runtime:'
      },
      {
        id: 'c3-s2',
        title: 'The Three-Tier Architecture',
        type: 'steps',
        extraData: [
          {
            num: 'B',
            title: 'The Buffer Layer (Memory Storage)',
            desc: 'The in-memory file data. When you call a file, Neovim loads it into dynamic RAM. A buffer exists whether or not a visible panel displays it.'
          },
          {
            num: 'W',
            title: 'The Window Layer (Viewports)',
            desc: 'A physical rectangular slice cut across your screen showing a buffer. You can run multiple windows side-by-side looking at the same or different buffers.'
          },
          {
            num: 'T',
            title: 'The Tab Page Layer (Workspace Layouts)',
            desc: 'An arrangement of windows. Think of Tabs not as files, but as totally separate screen configurations you can flip through instantly.'
          }
        ]
      }
    ]
  },

  // --- SECTION 2: ENVIRONMENTAL SETUP ---
  {
    id: 'chapter-4',
    num: 4,
    tag: 'System Layer Architecture',
    title: 'The Terminal Context for Windows Users',
    description: 'Establishing your terminal platform host, understanding graphic renderers, and standardizing shell variable queries.',
    sections: [
      {
        id: 'c4-s1',
        title: 'Shell Process vs. Terminal presentation Canvas',
        type: 'text',
        content: 'Neovim runs cleanly inside terminal environments. Because of this, it relies on a host container application to handle fonts, padding, and colors. Windows users must distinguish between the shell process (e.g., cmd, Powershell) and the graphical terminal window wrapper (e.g., Windows Terminal).'
      },
      {
        id: 'c4-s2',
        title: 'Terminal Emulator Comparison Matrix',
        type: 'table',
        extraData: {
          headers: ['Terminal Host', 'True-Color (24-bit)', 'Renderer Engine', 'Neovim Verdict'],
          rows: [
            ['Legacy Console Host (conhost.exe)', 'Missing', 'Classic Windows GDI (Slow, rigid)', 'Do Not Use (Causes distorted colors)'],
            ['Windows Terminal', 'Native Support', 'GPU-Accelerated DirectX (Fast, responsive)', 'Excellent Standard (Recommended)']
          ]
        }
      }
    ]
  },
  {
    id: 'chapter-5',
    num: 5,
    tag: 'Environment Setup Walkthrough',
    title: 'Windows Installation & Fonts Setup',
    description: 'Step-by-step winget deployment pipelines, installing patched Nerd Fonts, and configuring profiles.',
    sections: [
      {
        id: 'c5-s1',
        title: 'Deploying Core Packages via Winget',
        type: 'code_block',
        content: `# Run these in PowerShell to install Neovim and the modern Terminal wrapper
winget install Microsoft.WindowsTerminal
winget install Neovim.Neovim`,
        extraData: {
          filename: 'PowerShell Deployment'
        }
      },
      {
        id: 'c5-s2',
        title: 'Resolving Glyphs and Tofu Icons',
        type: 'text',
        content: 'By default, standard windows fonts cannot render developer icons like git symbols, folders, or LSP state circles. Downloading a patched Nerd Font (such as JetBrainsMono Nerd Font) maps these glyph blocks perfectly so your terminal renders everything clean.'
      },
      {
        id: 'c5-s3',
        title: 'Windows Terminal Profile Binding',
        type: 'code_block',
        content: `{
  "profiles": {
    "defaults": {
      "font": {
        "face": "JetBrainsMono Nerd Font",
        "size": 13
      },
      "padding": "10, 10, 10, 10"
    }
  }
}`,
        extraData: {
          filename: 'settings.json (Windows Terminal)'
        }
      }
    ]
  },
  {
    id: 'chapter-6',
    num: 6,
    tag: 'Initial Session Hook',
    title: 'Ground Zero Launch — Modal Survival',
    description: 'Launching your first editor viewport safely and learning the emergency exits before editing data.',
    sections: [
      {
        id: 'c6-s1',
        title: 'The Modal Survival Guidelines',
        type: 'checklist',
        extraData: [
          {
            title: 'Stabilize Calibration via Triple Escape',
            desc: 'Press the Escape key three times in rapid succession. This clears temporary action queues and forces Neovim back into Normal Mode.'
          },
          {
            title: 'Safe Quit Discarding Changes (:q!)',
            desc: 'Type colon (:) followed by "q!" and press Enter to instantly exit the editor and discard any experimental workspace edits.'
          },
          {
            title: 'Write of Active Buffer and Exit (:wq)',
            desc: 'Type colon (:) followed by "wq" and press Enter to write active memory edits to disk and exit the session safely.'
          }
        ]
      }
    ]
  },
  {
    id: 'chapter-7',
    num: 7,
    tag: 'Structural State Framework',
    title: 'The Four Core Modes',
    description: 'A detailed map of Normal, Insert, Visual, and Command states with their keyboard mapping laws.',
    sections: [
      {
        id: 'c7-s1',
        title: 'Modal Identification Table',
        type: 'table',
        extraData: {
          headers: ['Mode Name', 'Primary Function', 'Key to Enter', 'Status indicator Label'],
          rows: [
            ['Normal Mode', 'High-speed navigation, deletion, refactoring', 'Esc', 'Clean (Standard status)'],
            ['Insert Mode', 'Writing new text, code entry', 'i (or a, o, A, O)', '-- INSERT --'],
            ['Visual Mode', 'Highlighting text blocks', 'v (or V, Ctrl+V)', '-- VISUAL --'],
            ['Command Mode', 'System actions, saving, search filters', ':', 'Active prompt starting with ":"']
          ]
        }
      }
    ]
  },

  // --- SECTION 3: CORE MECHANICS ---
  {
    id: 'chapter-8',
    num: 8,
    tag: 'Workspace Architectures',
    title: 'The Core Architecture: Buffers, Windows, and Tabs',
    description: 'Practical exercise loops to navigate spatial splits and command buffer queries.',
    sections: [
      {
        id: 'c8-s1',
        title: 'Practical Window and Buffer Split Run',
        type: 'checklist',
        extraData: [
          {
            title: 'Load file1.txt and file2.txt',
            desc: 'Execute :edit file1.txt then :edit file2.txt. Both files now exist as hidden buffers in active memory.'
          },
          {
            title: 'Split the Viewport (:split / :vsplit)',
            desc: 'Type :vsplit to split your screen vertically. You now have two viewports with active focus.'
          },
          {
            title: 'Jump Focus via Ctrl-W Motions',
            desc: 'Press Ctrl+W followed by direction keys (H, J, K, L) to move your active cursor smoothly across window nodes.'
          }
        ]
      }
    ]
  },
  {
    id: 'chapter-9',
    num: 9,
    tag: 'Compositional Grammar',
    title: 'Text Manipulation Mastery: Operators and Text Objects',
    description: 'Treating code as a structural language. Unifying semantic operators and nouns into powerful edits.',
    sections: [
      {
        id: 'c9-s1',
        title: 'The Composable Editing Formula',
        type: 'text',
        content: 'Vim actions are not memorized commands; they are a structural language constructed using a simple formula of Operator (Verb) + Text Object/Motion (Noun).'
      },
      {
        id: 'c9-s2',
        title: 'Verbs (Operators) and Nouns (Ranges)',
        type: 'table',
        extraData: {
          headers: ['Operator (Verb)', 'Target Scope (Noun)', 'Combined Result Formula'],
          rows: [
            ['d (Delete)', 'iw (Inner Word)', 'diw = Delete current active word cleanly'],
            ['c (Change)', 'i" (Inside Quotes)', 'ci" = Clear quote content and enter Insert mode'],
            ['y (Yank/Copy)', 'ip (Inner Paragraph)', 'yip = Copy entire code block to register']
          ]
        }
      }
    ]
  },
  {
    id: 'chapter-10',
    num: 10,
    tag: 'Memory Registries',
    title: 'The Clipboard and Registers: Demystifying Storage',
    description: 'Breaking down clipboards, copying to system registers, and isolating deleted text from yanks.',
    sections: [
      {
        id: 'c10-s1',
        title: 'Understanding Neovim registers',
        type: 'text',
        content: 'Unlike traditional OS environments, Neovim doesn\'t have one clipboard. It features multiple isolated storage cells called Registers. Prepend your actions with "{register} to direct text to specific registers.'
      },
      {
        id: 'c10-s2',
        title: 'Register Classes',
        type: 'table',
        extraData: {
          headers: ['Register Key', 'Register Class', 'Functional Behavior'],
          rows: [
            ['" (double quote)', 'Unnamed Register', 'Stores your last deleted, changed, or copied text.'],
            ['+ (plus sign)', 'System Clipboard', 'Direct bridge to copy and paste to external windows applications.'],
            ['a-z', 'Named Registers', 'Safe cells that persist throughout your editing session without being overwritten.']
          ]
        }
      }
    ]
  },
  {
    id: 'chapter-11',
    num: 11,
    tag: 'Stream Parsing',
    title: 'Search, Global Substitutions, and Pattern Matching',
    description: 'Performing fast real-time search queries and global substitutions with safety confirmation.',
    sections: [
      {
        id: 'c11-s1',
        title: 'Search and Replace Formula',
        type: 'code_block',
        content: `# Replace 'foo' with 'bar' across the entire active file with safety confirmations
:%s/foo/bar/gc`,
        extraData: {
          filename: 'Ex-Command line'
        }
      }
    ]
  },
  {
    id: 'chapter-12',
    num: 12,
    tag: 'Recordings',
    title: 'Atomic Efficiency: Recording and Executing Macros',
    description: 'Using macro cameras to record repetitive text actions and replay them hundreds of times cleanly.',
    sections: [
      {
        id: 'c12-s1',
        title: 'How to build a Macro Loop',
        type: 'steps',
        extraData: [
          {
            num: 'q',
            title: 'Initialize Recording',
            desc: 'Press q in Normal Mode followed by a register name (e.g., qw) to point the camera at cell w.'
          },
          {
            num: 'R',
            title: 'Run Actions Carefully',
            desc: 'Perform your sequence (e.g. insert quotes, append commas, edit spacing) cleanly.'
          },
          {
            num: 'N',
            title: 'Reset to standard Start Point',
            desc: 'Move to the start of the next row (j followed by 0) so the camera aligns perfectly for the next loop.'
          },
          {
            num: 'q',
            title: 'Halt the Camera',
            desc: 'Press q one more time to complete your macro recording.'
          }
        ]
      },
      {
        id: 'c12-s2',
        title: 'Replay Macro Loop',
        type: 'text',
        content: 'Press @w to replay once, or type 50@w to repeat your actions on the next 50 rows instantly.'
      }
    ]
  },
  {
    id: 'chapter-13',
    num: 13,
    tag: 'Command Dispatch',
    title: 'Command Mode (Ex-Commands) and OS Integration',
    description: 'Sending shell pipelines directly, integrating operating system utilities, and writing logs.',
    sections: [
      {
        id: 'c13-s1',
        title: 'Command Examples',
        type: 'table',
        extraData: {
          headers: ['Command', 'Action', 'Usage'],
          rows: [
            [':!mkdir src', 'Create clean project directories directly without leaving the terminal', 'Shell command execution'],
            [':r !echo %USERNAME%', 'Read terminal outputs and paste them straight into file lines', 'Buffer output capture']
          ]
        }
      }
    ]
  },
  {
    id: 'chapter-14',
    num: 14,
    tag: 'Spatiotemporal Jumps',
    title: 'Spatial Navigation: Marks, Jumps, and the Change List',
    description: 'Mapping and hopping across historical editing regions and navigating spatial jump logs.',
    sections: [
      {
        id: 'c14-s1',
        title: 'Bookmarks and Jumps Keys',
        type: 'table',
        extraData: {
          headers: ['Keystroke', 'Action Map', 'Context'],
          rows: [
            ['ma', 'Mark spatial waypoint "a"', 'Set waypoint'],
            ["'a", 'Instantly jump back to line containing waypoint "a"', 'Visit line'],
            ['Ctrl + O', 'Step backward through search and navigation jump history', 'Walk cursor back in history'],
            ['Ctrl + I', 'Step forward through search and navigation jump history', 'Walk cursor forward in history']
          ]
        }
      }
    ]
  },
  {
    id: 'chapter-15',
    num: 15,
    tag: 'Documentation Systems',
    title: 'The Autonomous Learning Engine: Mastering the Help System',
    description: 'Using help index triggers, navigating context-rich system texts, and stepping backwards.',
    sections: [
      {
        id: 'c15-s1',
        title: 'Interrogating Neovim Help',
        type: 'text',
        content: 'Neovim has a comprehensive built-in help system. Open any documentation page by prepending your search query with :help. Use Ctrl + ] to jump deeper into highlighted blue paths, and Ctrl + T to return.'
      }
    ]
  },

  // --- SECTION 4: IDE SYNTHESIS ---
  {
    id: 'chapter-16',
    num: 16,
    tag: 'Modular Runtimes',
    title: 'The Anatomy of init.lua & Modular Architecture',
    description: 'Organizing complex configurations into maintainable directories with explicit Lua modules.',
    sections: [
      {
        id: 'c16-s1',
        title: 'XDG Config Directories',
        type: 'text',
        content: 'When Neovim starts up, it reads from your standards directory folder. You can locate your exact config folder path by running study path queries. On Windows, it sits in AppData-Local, and on Unix systems, in .config.'
      }
    ]
  },
  {
    id: 'chapter-17',
    num: 17,
    tag: 'Scoping Variables',
    title: 'Neovim Option Scoping & Settings Variables',
    description: 'Configuring standard options like cursor highlights and indentation ratios inside config schemas.',
    sections: [
      {
        id: 'c17-s1',
        title: 'Premium Settings Block',
        type: 'code_block',
        content: `-- lua/user/settings.lua
vim.g.mapleader = " " -- Set key leader as simple space and local leader
vim.opt.number = true -- Activate line numbering guide markers
vim.opt.relativenumber = true -- Enable dynamic jumping calculation spacing
vim.opt.expandtab = true -- Automatically map tabs directly to whitespace
vim.opt.tabstop = 4 -- Space representation standard sizing 4
vim.opt.shiftwidth = 4 -- Standard structural indentation step size 4
vim.opt.termguicolors = true -- Force 24-bit RGB True-Color renderer output`,
        extraData: {
          filename: 'lua/user/settings.lua'
        }
      }
    ]
  },
  {
    id: 'chapter-18',
    num: 18,
    tag: 'Keyboard Binds',
    title: 'Declarative Keymaps via Lua API',
    description: 'Constructing robust declarative keyboard binds using standard Lua mapping APIs.',
    sections: [
      {
        id: 'c18-s1',
        title: 'Standard Keymaps File',
        type: 'code_block',
        content: `-- lua/user/keymaps.lua
local map = vim.keymap.set

-- Smooth mode escaping directly via home row keys
map("i", "jk", "<Esc>", { desc = "Exit insert mode safely without moving hands" })

-- Safe clipboard void registries (Do not delete characters to your clipboard)
map({"n", "v"}, "x", '"_x', { desc = "Prevent deletions from overwriting yank cells" })

-- Modular window navigation swaps
map("n", "<C-h>", "<C-w>h", { desc = "Jump focus to far-left split viewport" })
map("n", "<C-l>", "<C-w>l", { desc = "Jump focus to far-right split viewport" })
map("n", "<C-j>", "<C-w>j", { desc = "Jump focus to lower split viewport" })
map("n", "<C-k>", "<C-w>k", { desc = "Jump focus to upper split viewport" })`,
        extraData: {
          filename: 'lua/user/keymaps.lua'
        }
      }
    ]
  },
  {
    id: 'chapter-19',
    num: 19,
    tag: 'Package Integration',
    title: 'The Modern Plugin Landscape: lazy.nvim',
    description: 'Bootstrapping the Lazy package manager and configuring async loading configurations.',
    sections: [
      {
        id: 'c19-s1',
        title: 'Bootstrap specifications loader',
        type: 'code_block',
        content: `-- lua/user/lazy.lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
    vim.fn.system({
        "git",
        "clone",
        "--filter=blob:none",
        "https://github.com/folke/lazy.nvim.git",
        "--branch=stable",
        lazypath,
    })
end
vim.opt.rtp:prepend(lazypath)

-- Build package specifications arrays
require("lazy").setup({
    { "tiagovla/tokyodark.nvim", lazy = false, priority = 1000 },
    { "nvim-telescope/telescope.nvim", dependencies = { "nvim-lua/plenary.nvim" } }
})`,
        extraData: {
          filename: 'lua/user/lazy.lua'
        }
      }
    ]
  },
  {
    id: 'chapter-20',
    num: 20,
    tag: 'Language Compilers',
    title: 'The Structural Syntax Matrix: Native Tree-sitter Compilation',
    description: 'Deploying real-time native Tree-sitter code compilation for accurate token highlights.',
    sections: [
      {
        id: 'c20-s1',
        title: 'Syntax Highlights: Regex vs Tree-sitter AST',
        type: 'vs_matrix',
        extraData: {
          leftTitle: 'Traditional Regular Expressions',
          leftItems: [
            'Scans and parses line-by-line as unstructured string chains.',
            'Breaks on complex multi-line comment scopes.',
            'Requires custom nested templates to process templates correctly.'
          ],
          rightTitle: 'Tree-sitter Compiler Parsing',
          rightItems: [
            'Compiles code files directly into a living Abstract Syntax Tree (AST).',
            'Saves memory by performing quick incremental parses.',
            'Maintains semantic understanding of scopes and variables.'
          ]
        }
      }
    ]
  },
  {
    id: 'chapter-21',
    num: 21,
    tag: 'Client-Server LSP',
    title: 'The Built-in Language Server Protocol (LSP) Engine',
    description: 'Configuring Mason language server managers and building standard trigger bindings.',
    sections: [
      {
        id: 'c21-s1',
        title: 'Core LSP Specifications Spec',
        type: 'code_block',
        content: `-- Mason and LSP configuration block
{
    "neovim/nvim-lspconfig",
    dependencies = { "williamboman/mason.nvim", "williamboman/mason-lspconfig.nvim" },
    config = function()
        require("mason").setup()
        require("mason-lspconfig").setup({
            ensure_installed = { "lua_ls", "ts_ls", "html", "cssls" }
        })

        -- Dynamically map connections to standard handler protocols
        require("mason-lspconfig").setup_handlers({
            function(server_name)
                require("lspconfig")[server_name].setup({})
            end,
        })
    end
}`,
        extraData: {
          filename: 'LSP Spec config'
        }
      }
    ]
  },
  {
    id: 'chapter-22',
    num: 22,
    tag: 'Rust Completion',
    title: 'The Next-Gen Autocompletion Matrix: blink.cmp',
    description: 'Configuring blink.cmp compiled asynchrony autocomplete rules under modern systems.',
    sections: [
      {
        id: 'c22-s1',
        title: 'Blink Autocomplete specifications Spec',
        type: 'code_block',
        content: `-- rust-powered autocompletion specifications
{
    "saghen/blink.cmp",
    version = "v1.*", -- Bind version to stable major update states
    event = "InsertEnter", -- Lazy load state: stay asleep until typing matches

    opts = {
        keymap = {
            preset = "default",
            ["<Tab>"] = { "select_next", "fallback" },
            ["<S-Tab>"] = { "select_prev", "fallback" },
            ["<CR>"] = { "accept", "fallback" },
        },
        sources = {
            default = { "lsp", "path", "snippets", "buffer" },
        },
    },
}`,
        extraData: {
          filename: 'blink-cmp.lua'
        }
      }
    ]
  }
];
