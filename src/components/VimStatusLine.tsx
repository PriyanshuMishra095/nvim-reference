import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, Keyboard, Copy, BookOpen, AlertCircle, HelpCircle, CornerDownLeft, Sparkles, Folder, Cpu, RefreshCw } from 'lucide-react';
import { Chapter } from '../types';

export type VimMode = 'normal' | 'insert' | 'visual' | 'command';

interface VimStatusLineProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeChapter: Chapter | null;
  onNavigateChapter: (chapterId: string) => void;
  chapters: Chapter[];
  onOpenPlayground: () => void;
  registers: Record<string, string>;
  onClearRegister: (key: string) => void;
  onYankNotification: string | null;
  onClearYankNotification: () => void;
  vimMode: VimMode;
  setVimMode: (mode: VimMode) => void;
  style?: React.CSSProperties;
  sidebarVisible?: boolean;
  setSidebarVisible?: (visible: boolean) => void;
}

export default function VimStatusLine({
  theme,
  onToggleTheme,
  activeChapter,
  onNavigateChapter,
  chapters,
  onOpenPlayground,
  registers,
  onClearRegister,
  onYankNotification,
  onClearYankNotification,
  vimMode,
  setVimMode,
  style,
  sidebarVisible = true,
  setSidebarVisible
}: VimStatusLineProps) {
  const [commandInput, setCommandInput] = useState('');
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [commandError, setCommandError] = useState<string | null>(null);
  const [commandSuccess, setCommandSuccess] = useState<string | null>(null);
  const [showRegistersTray, setShowRegistersTray] = useState(false);
  const [activeHelpTopic, setActiveHelpTopic] = useState<string | null>(null);
  const [aiExplanationText, setAiExplanationText] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const commandInputRef = useRef<HTMLInputElement | null>(null);

  // Focus command prompt when mode sets to command
  useEffect(() => {
    if (vimMode === 'command') {
      setCommandInput(':');
      setTimeout(() => {
        if (commandInputRef.current) {
          commandInputRef.current.focus();
          commandInputRef.current.selectionStart = 1;
          commandInputRef.current.selectionEnd = 1;
        }
      }, 50);
    } else {
      setCommandInput('');
      setShowAutoComplete(false);
    }
  }, [vimMode]);

  const sidebarWasHiddenRef = useRef(false);
  const prevModeRef = useRef(vimMode);

  // Monitor Vim Mode transitions to restore sidebar states reactively
  useEffect(() => {
    if (prevModeRef.current === 'insert' && vimMode !== 'insert') {
      if (sidebarWasHiddenRef.current && setSidebarVisible) {
        setSidebarVisible(false);
      }
      sidebarWasHiddenRef.current = false;
    }
    prevModeRef.current = vimMode;
  }, [vimMode, setSidebarVisible]);

  // Hook global keys to swap Vim Modes cleanly across screens
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Disallow stealing input if typing within a standard form/sidebar search input (except if key is Escape)
      const target = e.target as HTMLElement;
      const isTyping = target && (target.closest('input, textarea, [contenteditable="true"]'));
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setVimMode('normal');
        setActiveHelpTopic(null);
        setCommandError(null);
        setCommandInput('');
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      if (isTyping && vimMode !== 'command') {
        return;
      }

      // 1. Normal mode shortcuts
      if (vimMode === 'normal') {
        if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          
          // Check if text is currently highlighted / selected
          const selection = window.getSelection();
          const hasSelection = selection && selection.toString().trim().length > 0;
          
          if (!hasSelection) {
            sidebarWasHiddenRef.current = !sidebarVisible;
            if (!sidebarVisible && setSidebarVisible) {
              setSidebarVisible(true);
            }
            setVimMode('insert');
            // Focus search box automatically
            setTimeout(() => {
              document.getElementById('search-input-box')?.focus();
            }, 50);
          }
        } else if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          setVimMode('visual');
        } else if (e.key === ':') {
          e.preventDefault();
          setVimMode('command');
        } else if (e.key === 'j' || e.key === 'J') {
          // Scroll page down smoothly
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.35, behavior: 'smooth' });
        } else if (e.key === 'k' || e.key === 'K') {
          // Scroll page up smoothly
          e.preventDefault();
          window.scrollBy({ top: -window.innerHeight * 0.35, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeys, true);
    return () => window.removeEventListener('keydown', handleGlobalKeys, true);
  }, [vimMode, setVimMode, sidebarVisible, setSidebarVisible]);

  // Command Autocomplete list parser
  const getAutocompleteSuggestions = () => {
    const query = commandInput.trim().toLowerCase();
    const suggestions: { cmd: string; desc: string; run: () => void }[] = [];

    // Base commands
    suggestions.push({
      cmd: ':q!',
      desc: 'Quit. Return immediately to terminal editor landing.',
      run: () => onOpenPlayground()
    });
    suggestions.push({
      cmd: ':wq',
      desc: 'Write & Quit. Record bookmarks securely and return to landing.',
      run: () => {
        setCommandSuccess('Configuration compiled and written to init.lua successfully!');
        setTimeout(() => {
          onOpenPlayground();
          setCommandSuccess(null);
        }, 1200);
      }
    });
    suggestions.push({
      cmd: ':theme dark',
      desc: 'Activate the eyes-safe midnight charcoal space scheme.',
      run: () => {
        if (theme !== 'dark') onToggleTheme();
        setCommandSuccess('Applied theme: Royal Slate Dark');
      }
    });
    suggestions.push({
      cmd: ':theme light',
      desc: 'Activate the high-contrast editorial soft-white scheme.',
      run: () => {
        if (theme === 'dark') onToggleTheme();
        setCommandSuccess('Applied theme: Editorial Soft-White');
      }
    });
    suggestions.push({
      cmd: ':registers',
      desc: 'Explore active in-memory cut/copy yanks.',
      run: () => setShowRegistersTray(true)
    });
    suggestions.push({
      cmd: ':explain',
      desc: 'Ask Gemini AI to explain any Neovim concept, config, or Lua syntax.',
      run: () => {
        setCommandInput(':explain ');
        if (commandInputRef.current) {
          commandInputRef.current.focus();
        }
      }
    });

    // Populate Dynamic Chapters suggestions!
    chapters.forEach((ch) => {
      suggestions.push({
        cmd: `:chapter ${ch.num}`,
        desc: `Jump focus to: ${ch.title}`,
        run: () => {
          onNavigateChapter(ch.id);
          const el = document.getElementById(ch.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Flash color spotlight
            el.classList.add('search-flash-highlight');
            setTimeout(() => el.classList.remove('search-flash-highlight'), 2000);
          }
        }
      });
    });

    // Populate dynamic Neovim help guides
    const helpTopics = ['modal', 'registers', 'buffer', 'keymaps', 'macro', 'treesitter', 'lsp'];
    helpTopics.forEach((topic) => {
      suggestions.push({
        cmd: `:help ${topic}`,
        desc: `View the built-in system documentation explaining ${topic}.`,
        run: () => setActiveHelpTopic(topic)
      });
    });

    if (!query) return suggestions.slice(0, 5);
    return suggestions.filter(s => s.cmd.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query));
  };

  const executeCommand = (cmdText: string) => {
    const clean = cmdText.trim().toLowerCase();
    
    // 1. Direct match or execute first autocomplete suggestion
    const suggestions = getAutocompleteSuggestions();
    const matched = suggestions.find(s => s.cmd.toLowerCase() === clean);

    if (matched) {
      matched.run();
    } else if (clean.startsWith(':explain ')) {
      const topic = cmdText.slice(9).trim();
      if (!topic) {
        setCommandError('Error: Please specify a concept or query after :explain');
        return;
      }
      setCommandSuccess(`Querying Gemini for explanation on "${topic}"...`);
      setVimMode('normal');
      setActiveHelpTopic('ai-explain');
      setAiLoading(true);
      setAiExplanationText(null);
      
      fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topic, context: activeChapter?.title })
      })
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(data => {
        setAiExplanationText(data.text);
        setAiLoading(false);
        setCommandSuccess(null);
      })
      .catch(err => {
        console.error(err);
        setAiExplanationText(`Error: Could not retrieve Gemini explanation. Make sure the backend server is running.`);
        setAiLoading(false);
        setCommandSuccess(null);
      });
    } else if (clean.startsWith(':chapter ')) {
      const num = parseInt(clean.replace(':chapter ', ''));
      const foundCh = chapters.find(c => c.num === num);
      if (foundCh) {
        onNavigateChapter(foundCh.id);
        const el = document.getElementById(foundCh.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCommandSuccess(`Successfully moved cursor to Chapter ${num}`);
      } else {
        setCommandError(`Error: Invalid chapter. Choose a chapter between 1 and ${chapters.length}`);
      }
    } else if (clean.startsWith(':help ')) {
      const topic = clean.replace(':help ', '');
      setActiveHelpTopic(topic);
    } else if (clean === ':help') {
      setActiveHelpTopic('general');
    } else {
      setCommandError(`E492: Not an editor command: ${cmdText}`);
    }

    setVimMode('normal');
    setCommandInput('');
    setShowAutoComplete(false);
  };

  const handleCommandFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) {
      setVimMode('normal');
      return;
    }
    executeCommand(commandInput);
  };

  // Statusline Mode configuration styling
  const modeSpec = {
    normal: { label: 'NORMAL', bg: 'bg-[#4f46e5] dark:bg-[#818cf8]', text: 'text-white border-indigo-650' },
    insert: { label: 'INSERT', bg: 'bg-amber-600 dark:bg-amber-500 animate-pulse-subtle', text: 'text-white font-bold' },
    visual: { label: 'VISUAL', bg: 'bg-emerald-600 dark:bg-emerald-500', text: 'text-white font-bold' },
    command: { label: 'COMMAND', bg: 'bg-rose-600 dark:bg-rose-500', text: 'text-white' },
  }[vimMode];

  // Get active accent color based on Vim mode
  const getModeColor = () => {
    switch (vimMode) {
      case 'insert': return 'rgb(245, 158, 11)';
      case 'visual': return 'rgb(16, 185, 129)';
      case 'command': return 'rgb(244, 63, 94)';
      default: return 'rgb(99, 102, 241)';
    }
  };

  const modeColor = getModeColor();

  return (
    <>
      {/* ─── FLOATING STATIC VIM CUSTOM STATUSLINE (Inspired by lualine.nvim) ─── */}
      <div 
        className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pointer-events-none select-none"
        style={style}
      >
        <div className="vim-statusline max-w-4xl mx-auto flex items-center justify-between border border-zinc-200/50 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-15px_50px_rgba(0,0,0,0.4)] rounded-xl pointer-events-auto overflow-hidden text-xs font-mono h-11 md:h-12 w-[calc(100%-2rem)] md:w-full">
          <div className="flex items-center h-full min-w-0">
            {/* Section A: Active Mode Badge */}
            <button
              onClick={() => {
                const nextModeMap: Record<VimMode, VimMode> = { normal: 'insert', insert: 'visual', visual: 'command', command: 'normal' };
                setVimMode(nextModeMap[vimMode]);
              }}
              data-mode-badge={vimMode}
              className={`px-4 md:px-5 h-full uppercase font-black flex items-center gap-1.5 transition-all text-[11px] leading-none cursor-pointer flex-shrink-0 rounded-l-xl ${modeSpec.bg} ${modeSpec.text}`}
              title="Click to switch modes manually"
            >
              <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{modeSpec.label}</span>
            </button>

            {/* Section B: File Status */}
            <div className="px-3 md:px-4 h-full border-r border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 min-w-0">
              <Folder className="w-3.5 h-3.5 text-indigo-500/70 flex-shrink-0" />
              <span className="truncate max-w-[90px] sm:max-w-none">
                <span className="hidden sm:inline">AppData/Local/nvim/</span><span className="font-bold text-zinc-800 dark:text-zinc-100">init.lua</span>[+]
              </span>
            </div>

            {/* Section C: Curated Chapter Info */}
            {activeChapter && (
              <button
                onClick={() => setSidebarVisible && setSidebarVisible(!sidebarVisible)}
                className="px-4 h-full border-r border-zinc-200/50 dark:border-zinc-800/50 hidden lg:flex items-center gap-2 text-zinc-500 dark:text-zinc-400 min-w-0 hover:bg-zinc-100/55 dark:hover:bg-zinc-900/30 transition cursor-pointer text-left"
                title="Click to toggle sidebar navigation"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-500/70 flex-shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-bold flex-shrink-0">Ch.{activeChapter.num}</span>
                <span className="truncate max-w-[150px]">{activeChapter.title.split(':')[0]}</span>
              </button>
            )}
          </div>

          <div className="flex items-center h-full flex-shrink-0">
            {/* Registers quick toggle */}
            <button
              onClick={() => setShowRegistersTray(!showRegistersTray)}
              className="px-3 md:px-4 h-full border-l border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/55 dark:hover:bg-zinc-900/30 transition cursor-pointer flex-shrink-0"
              title="View in-memory registers stack"
            >
              <Copy className="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" />
              <span className="hidden sm:inline font-bold">Registers (")</span>
              <span className="sm:hidden font-bold">Regs</span>
            </button>

            {/* Mode shortcut triggers */}
            <div className="hidden sm:flex items-center gap-1 border-l border-zinc-200/50 dark:border-zinc-800/50 px-3 h-full flex-shrink-0">
              <span className="text-[10px] text-zinc-400 uppercase mr-1 font-bold">Keys:</span>
              <kbd onClick={() => setVimMode('normal')} className={`kbd-btn px-2 py-0.5 text-[10px] rounded border cursor-pointer font-mono transition-all ${vimMode === 'normal' ? 'bg-[#4f46e5]/10 dark:bg-[#818cf8]/10 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}>ESC</kbd>
              <kbd onClick={() => setVimMode('insert')} className={`kbd-btn px-2 py-0.5 text-[10px] rounded border cursor-pointer font-mono transition-all ${vimMode === 'insert' ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-300 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}>i</kbd>
              <kbd onClick={() => setVimMode('visual')} className={`kbd-btn px-2 py-0.5 text-[10px] text-emerald-600 rounded border cursor-pointer font-mono transition-all ${vimMode === 'visual' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-650 dark:text-emerald-300 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}>v</kbd>
              <kbd onClick={() => setVimMode('command')} className={`kbd-btn px-2 py-0.5 text-[10px] rounded border cursor-pointer font-mono transition-all ${vimMode === 'command' ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-300 font-bold' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}>:</kbd>
            </div>

            {/* Section E: Keyboard Tutor info icon */}
            <button
              onClick={() => setActiveHelpTopic('general')}
              className="px-3 md:px-4 border-l border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100/55 dark:hover:bg-zinc-900/40 cursor-pointer transition h-full flex-shrink-0 rounded-r-xl"
              title="Vim Interactive Help Tutor"
            >
              <HelpCircle className="w-4 h-4 animate-pulse flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── FLOATING SYSTEM COMMAND INPUT BOX OVERLAY (Command state) ─── */}
      <AnimatePresence>
        {vimMode === 'command' && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-20 pointer-events-none select-none">
            {/* Visual focus blocker overlay (non-blocking pointer, just visual darken) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/20 dark:bg-black/40 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 15, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="relative w-full max-w-xl rounded-xl border bg-zinc-950 shadow-2xl text-zinc-200 overflow-hidden font-mono p-4 pointer-events-auto"
              style={{ borderColor: modeColor, boxShadow: `0 30px 70px ${modeColor}25` }}
            >
              {/* Autocomplete Hints panels */}
              <div className="mb-3 space-y-1 max-h-[140px] overflow-y-auto divide-y divide-zinc-900 border-b border-zinc-900 pb-2">
                <div className="text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5 pb-1" style={{ color: modeColor }}>
                  <Terminal className="w-3 h-3 animate-pulse" />
                  <span>Interactive Command dispatcher Autocompleting:</span>
                </div>
                {getAutocompleteSuggestions().map((s) => (
                  <button
                    key={s.cmd}
                    onClick={() => {
                      setCommandInput(s.cmd);
                      commandInputRef.current?.focus();
                    }}
                    className="w-full text-left py-1.5 px-1.5 text-xs flex items-center justify-between hover:bg-zinc-900/60 rounded transition group"
                  >
                    <span className="font-bold transition-colors group-hover:text-white" style={{ color: modeColor }}>{s.cmd}</span>
                    <span className="text-[10px] text-zinc-500 line-clamp-1 truncate ml-2">{s.desc}</span>
                  </button>
                ))}
              </div>

              {/* Command text input */}
              <form onSubmit={handleCommandFieldSubmit} className="flex items-center gap-2 w-full">
                <input
                  ref={commandInputRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val.startsWith(':')) {
                      setVimMode('normal');
                      setCommandInput('');
                    } else {
                      setCommandInput(val);
                      setShowAutoComplete(true);
                    }
                  }}
                  placeholder=":type command (e.g. :chapter 8, :theme light, :registers, :help keymaps, :wq)"
                  className="bg-transparent flex-1 text-sm text-white outline-none placeholder-zinc-700"
                  style={{ caretColor: '#22c55e' }}
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded border text-[10px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1"
                  style={{ backgroundColor: `${modeColor}15`, borderColor: `${modeColor}35`, color: modeColor }}
                >
                  <CornerDownLeft className="w-3 h-3" />
                  Execute
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── REAL-TIME EXPIRED ERROR OR SUCCESS MESSAGE FLASHERS ─── */}
      <AnimatePresence>
        {commandError && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-950/95 text-rose-200 backdrop-blur-md shadow-2xl font-mono text-xs">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>{commandError}</div>
              <button onClick={() => setCommandError(null)} className="ml-auto text-rose-400 hover:text-white font-bold">×</button>
            </div>
          </motion.div>
        )}

        {commandSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/95 text-emerald-200 backdrop-blur-md shadow-2xl font-mono text-xs">
              <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>{commandSuccess}</div>
              <button onClick={() => setCommandSuccess(null)} className="ml-auto text-emerald-400 hover:text-white font-bold">×</button>
            </div>
          </motion.div>
        )}

        {onYankNotification && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 max-w-sm w-full px-4"
          >
            <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-indigo-500/30 bg-white/95 dark:bg-[#0c0f13]/95 text-zinc-800 dark:text-indigo-200 backdrop-blur-md shadow-2xl font-mono text-xs relative overflow-hidden group">
              <div className="absolute top-0 left-0 h-full w-[3px]" style={{ backgroundColor: modeColor }} />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" style={{ color: modeColor }} />
                <span className="font-black" style={{ color: modeColor }}>Yanked block!</span>
                <button onClick={onClearYankNotification} className="ml-auto hover:opacity-70 font-bold">✕</button>
              </div>
              <div className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 italic leading-relaxed pt-1 select-all">
                "{onYankNotification}"
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-1">
                Assigned to Registers ( " ) & ( + )
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FLOATING IN-MEMORY VIM REGISTERS POPUP OVERLAY TRAY (") ─── */}
      <AnimatePresence>
        {showRegistersTray && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegistersTray(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl font-mono text-xs text-zinc-700 dark:text-zinc-300"
            >
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Vim Clipboard Registers Grid</span>
                </div>
                <button onClick={() => setShowRegistersTray(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white font-black text-sm">✕</button>
              </div>

              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed mb-4 space-y-2">
                <p>
                  <strong>What are Registers?</strong> In Vim/Neovim, registers are separate clipboard memory cells used to store text. Instead of having just one clipboard, Vim offers named registers like <code className="text-indigo-500 font-bold dark:text-indigo-400">"a</code>, <code className="text-indigo-500 font-bold dark:text-indigo-400">"b</code>, and special clipboards like <code className="text-indigo-500 font-bold dark:text-indigo-400">""</code> (unnamed default register) or <code className="text-indigo-500 font-bold dark:text-indigo-400">"+</code> (system clipboard).
                </p>
                <p>
                  <strong>How to use them here:</strong> Drag-highlight text inside any page section or code block. Highlighting automatically yanks the selection into register <code className="text-amber-500 font-bold">"</code> and the system clipboard <code className="text-amber-500 font-bold">+</code>. Use this grid to inspect your live clipboard stack!
                </p>
              </div>

              <div className="space-y-3 pr-1">
                {Object.entries(registers).map(([key, value]) => (
                  <div key={key} className="p-3 bg-zinc-50 dark:bg-zinc-900/65 rounded-lg border border-zinc-200/50 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 group transition duration-150">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-[11px] text-amber-600 dark:text-amber-400">Register <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">"{key}</span></span>
                      {value ? (
                        <button
                          onClick={() => onClearRegister(key)}
                          className="text-[10px] text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 hidden group-hover:inline opacity-80 cursor-pointer"
                        >
                          Clear Cell
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-600">Empty Cell</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 break-words line-clamp-3 select-all italic">
                      {value || 'No content copied to this slot. Hover and yank text rows in Visual Mode to populate.'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex justify-end">
                <button
                  onClick={() => setShowRegistersTray(false)}
                  className="px-4 py-2 rounded text-white font-bold transition text-xs shadow-lg cursor-pointer duration-300"
                  style={{ backgroundColor: modeColor, boxShadow: `0 4px 15px ${modeColor}20` }}
                >
                  Close Grid
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── FLOATING BUILT-IN VIM HELP DOCUMENTATION MODALS (:help) ─── */}
      <AnimatePresence>
        {activeHelpTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              onClick={() => setActiveHelpTopic(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-white dark:bg-zinc-950 border rounded-2xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto shadow-2xl font-mono text-xs text-zinc-700 dark:text-zinc-300 pointer-events-auto"
              style={{ borderColor: modeColor }}
            >
              <div className="absolute top-[5%] right-[5%] flex items-center gap-2 select-none">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-500 font-bold">ESC</kbd>
                <button onClick={() => setActiveHelpTopic(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white font-black text-sm">✕</button>
              </div>

              <div className="flex items-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3 mb-4 select-none">
                <Terminal className="w-4 h-4" style={{ color: modeColor }} />
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {activeHelpTopic === 'ai-explain' ? 'Neovim LLM Help' : `Neovim Help Documentation: ':h ${activeHelpTopic}'`}
                </span>
              </div>

              {/* Dynamic explanations */}
              {activeHelpTopic === 'modal' && (
                <div className="space-y-4 leading-relaxed">
                  <p className="font-bold" style={{ color: modeColor }}>Understanding Modality (*modal-editing*)</p>
                  <p>Neovim maintains isolated control states to give your fingers massive operational velocity. Standard modes include:</p>
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg space-y-2 border border-zinc-200/50 dark:border-zinc-800/80 text-[11px]">
                    <div><span className="font-black text-indigo-600 dark:text-indigo-400">NORMAL:</span> Navigational mode. Tap <code className="text-indigo-600 dark:text-indigo-400">j</code> and <code className="text-indigo-600 dark:text-indigo-400">k</code> to scroll smoothly, and <code className="text-indigo-600 dark:text-indigo-400">gg</code> to zoom to top.</div>
                    <div><span className="font-black text-amber-600 dark:text-amber-400">INSERT:</span> standard editor entry. Access via tapping <code className="text-amber-600 dark:text-amber-400">i</code>. Let's type in search parameters.</div>
                    <div><span className="font-black text-emerald-600 dark:text-emerald-400">VISUAL:</span> block selects. Copy/Yank any paragraph instantly by clicking on items.</div>
                    <div><span className="font-black text-rose-600 dark:text-rose-400">COMMAND:</span> System actions. Triggered via <code className="text-rose-600 dark:text-rose-400">:</code>.</div>
                  </div>
                </div>
              )}

              {activeHelpTopic === 'registers' && (
                <div className="space-y-4 leading-relaxed">
                  <p className="font-bold text-amber-600 dark:text-amber-400">Working with Clipboard Registers (*registers-api*)</p>
                  <p>Traditional operating systems limit you to a single copied item. Neovim organizes an index of registers:</p>
                  <ul className="list-disc list-inside space-y-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <li><code className="text-zinc-800 dark:text-zinc-200">" +</code> : standard System Clipboard. Shared with Windows/OS apps.</li>
                    <li><code className="text-zinc-800 dark:text-zinc-200">" "</code> : the general Unnamed Register containing the last yank.</li>
                    <li><code className="text-zinc-800 dark:text-zinc-200">" a - z</code> : custom registers which you lock and load for persistence.</li>
                  </ul>
                  <p>Press <code className="text-emerald-500 dark:text-emerald-500">v</code> to enter Visual Mode, then hover/click chapters to automatically load your registers grid!</p>
                </div>
              )}

              {activeHelpTopic === 'buffer' && (
                <div className="space-y-4 leading-relaxed">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">The Buffers, Windows & Tabs Decoupling (*buffers*)</p>
                  <p>Buffers represent pure in-memory data streams separate from viewer containers.</p>
                  <p>Windows represent the structural rectangles carved into your physical workspace screen rendering buffers.</p>
                  <p>Tabs organize arrangements/views of windows. Flipping tabs doesn't open files, it swaps workspace maps!</p>
                </div>
              )}

              {activeHelpTopic === 'keymaps' && (
                <div className="space-y-4 leading-relaxed">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">Declarative Declarations (*keymaps-lua*)</p>
                  <p>Configured using standard Lua scoping: <code className="text-emerald-600 dark:text-emerald-500">vim.keymap.set(mode, trigger, action, options)</code>.</p>
                  <p>Common maps:</p>
                  <pre className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg text-emerald-600 dark:text-emerald-400 text-[10px] border border-zinc-200/50 dark:border-zinc-800/80">
{`vim.keymap.set("i", "jk", "<Esc>") -- Home-row exit
vim.keymap.set("n", "<C-h>", "<C-w>h") -- split jumps`}
                  </pre>
                </div>
              )}

              {activeHelpTopic === 'macro' && (
                <div className="space-y-4 leading-relaxed">
                  <p className="font-bold text-purple-600 dark:text-purple-400">Repetitive Command Automation (*macros*)</p>
                  <p>Macros are automated commands recorded by a camera cell and replayed instantly.</p>
                  <p>Type <code className="text-purple-600 dark:text-purple-400">q</code> in Normal Mode followed by a register <span className="text-zinc-800 dark:text-zinc-200">w</span> to begin, perform changes, then halt recording with <code className="text-purple-600 dark:text-purple-400">q</code>. Replay with <code className="text-purple-600 dark:text-purple-400">@w</code>!</p>
                </div>
              )}

              {activeHelpTopic === 'treesitter' && (
                <div className="space-y-4 leading-relaxed">
                  <p className="font-bold text-sky-600 dark:text-sky-400">Tree-sitter Parsing AST (*treesitter*)</p>
                  <p>Abstract Syntax Trees compile flat text code files into dynamic syntax coordinate grids of tokens. This prevents regex color bleeding on comments and complex loops.</p>
                </div>
              )}

              {activeHelpTopic === 'lsp' && (
                <div className="space-y-4 leading-relaxed">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">Language Server Protocol (*lspconfig*)</p>
                  <p>Integrates code diagnostics, autocomplete dropdowns, definition jumping, and type signatures using a robust Client-Server pipeline directly in the terminal.</p>
                </div>
              )}

              {activeHelpTopic === 'ai-explain' && (
                <div className="space-y-4 leading-relaxed font-mono text-xs max-h-[350px] overflow-y-auto">
                  <p className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                    <span>Neovim LLM Help</span>
                  </p>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 py-6 justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
                      <span>Consulting Gemini models...</span>
                    </div>
                  ) : aiExplanationText ? (
                    <div className="whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-300 pr-1">
                      {aiExplanationText}
                    </div>
                  ) : (
                    <div className="text-rose-500 font-bold text-center py-4">Failed to load Gemini explanation. Make sure the API key is valid.</div>
                  )}
                </div>
              )}

              {/* General Tutor summary */}
              {(!activeHelpTopic || activeHelpTopic === 'general') && (
                <div className="space-y-4 leading-relaxed">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 text-[13px] border-b border-zinc-200/60 dark:border-zinc-800/60 pb-1">Welcome to the Neovim Interactive Tutor (2026 Edition)</p>
                  <p>This handbook is a living environment. Practice Neovim actions by tapping keys on your physical keyboard:</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-[11px] py-1 select-none">
                    <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-900/65 border border-zinc-200/60 dark:border-zinc-800/80">
                      <span className="font-black text-rose-600 dark:text-rose-400 block mb-1">Modes Quick-Shift</span>
                      <div>• <kbd className="text-rose-600 dark:text-rose-400">ESC</kbd> : Normal Mode</div>
                      <div>• <kbd className="text-amber-600 dark:text-amber-500">i</kbd> : Insert (Search)</div>
                      <div>• <kbd className="text-emerald-600 dark:text-emerald-500">v</kbd> : Visual (Yank-select)</div>
                      <div>• <kbd className="text-rose-600 dark:text-rose-500">:</kbd> : Command mode</div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-900/65 border border-zinc-200/60 dark:border-zinc-800/80">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 block mb-1">Normal Commands</span>
                      <div>• <kbd className="text-indigo-600 dark:text-indigo-400">j</kbd> / <kbd className="text-indigo-600 dark:text-indigo-400">k</kbd> : scroll down/up</div>
                      <div>• <kbd className="text-indigo-600 dark:text-indigo-400">/</kbd> : Search input focus</div>
                      <div>• <kbd className="text-indigo-600 dark:text-indigo-400">:</kbd> : slide open Console</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal select-none">
                    Enter <span className="font-bold underline text-rose-600 dark:text-rose-400">:chapter [num]</span> to speed jump, <span className="font-bold underline text-rose-600 dark:text-rose-400">:theme light</span> to change theme, or ask Gemini with <span className="font-bold underline text-purple-600 dark:text-purple-400">:explain</span>!
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-500 select-none">
                <span>Click on blue text links to jump to their help documentation.</span>
                {activeHelpTopic === 'ai-explain' ? (
                  <button
                    onClick={() => {
                      setActiveHelpTopic(null);
                      setVimMode('command');
                      setCommandInput(':explain ');
                    }}
                    className="px-4 py-2 rounded text-white font-bold transition text-xs shadow-lg cursor-pointer duration-300"
                    style={{ backgroundColor: modeColor, boxShadow: `0 4px 15px ${modeColor}20` }}
                  >
                    Ask another question
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveHelpTopic(null)}
                    className="px-4 py-2 rounded text-white font-bold transition text-xs shadow-lg cursor-pointer duration-300"
                    style={{ backgroundColor: modeColor, boxShadow: `0 4px 15px ${modeColor}20` }}
                  >
                    Discard help
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
