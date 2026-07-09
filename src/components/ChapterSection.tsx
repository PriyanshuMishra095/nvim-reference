import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';
import { Copy, Check, TableProperties, Sparkles, MonitorPlay, Zap, RefreshCw } from 'lucide-react';
import { Chapter, SubSection } from '../types';

/* ── LUA SYNTAX HIGHLIGHTER ──
   Tiny tokenizer for the interactive Vim buffers. Buffers render on a dark
   terminal surface in both themes, so the palette is dark-tuned. */
const LUA_KEYWORDS = new Set([
  'local', 'function', 'return', 'require', 'if', 'then', 'else', 'elseif', 'end',
  'for', 'in', 'do', 'while', 'repeat', 'until', 'break', 'true', 'false', 'nil',
  'not', 'and', 'or'
]);
const LUA_BUILTINS = new Set([
  'vim', 'opt', 'keymap', 'api', 'g', 'fn', 'cmd', 'setup', 'use', 'map', 'set',
  'print', 'pairs', 'ipairs', 'pcall'
]);

const LUA_TOKEN_RE = /(--.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+\.?\d*\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/gm;

function HighlightedLine({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let i = 0;
  LUA_TOKEN_RE.lastIndex = 0;
  while ((match = LUA_TOKEN_RE.exec(text)) !== null) {
    const [tok, comment, str, num, ident] = match;
    let cls = 'text-zinc-400';
    if (comment) cls = 'text-zinc-500 italic';
    else if (str) cls = 'text-emerald-300';
    else if (num) cls = 'text-amber-300';
    else if (ident) {
      if (LUA_KEYWORDS.has(ident)) cls = 'text-violet-300 font-semibold';
      else if (LUA_BUILTINS.has(ident)) cls = 'text-sky-300';
      else cls = 'text-zinc-200';
    }
    nodes.push(<span key={i++} className={cls}>{tok}</span>);
    if (tok.length === 0) break; // safety against zero-length matches
  }
  return <>{nodes}</>;
}

interface InteractiveCodeBlockProps {
  sectionId: string;
  initialContent: string;
  modeColor: string;
  onYank: (text: string) => void;
  getLineExplanation: (line: string) => string;
  setActiveExplanation: (explain: string) => void;
}

function InteractiveCodeBlock({
  sectionId,
  initialContent,
  modeColor,
  onYank,
  getLineExplanation,
  setActiveExplanation
}: InteractiveCodeBlockProps) {
  const [editorLines, setEditorLines] = useState<string[]>(() => initialContent.split('\n'));
  const [cursorLine, setCursorLine] = useState<number>(0);
  const [editorMode, setEditorMode] = useState<'NORMAL' | 'INSERT' | 'COMMAND'>('NORMAL');
  const [commandInput, setCommandInput] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const commandInputRef = useRef<HTMLInputElement | null>(null);
  const [lastYankedLine, setLastYankedLine] = useState<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused) return;

    if (editorMode === 'NORMAL') {
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setCursorLine(prev => Math.min(editorLines.length - 1, prev + 1));
        setStatusMsg('');
        setLastYankedLine(null);
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setCursorLine(prev => Math.max(0, prev - 1));
        setStatusMsg('');
        setLastYankedLine(null);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setEditorMode('INSERT');
        setStatusMsg('-- INSERT -- (Press ESC or Enter to exit)');
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        const lineText = editorLines[cursorLine];
        onYank(lineText);
        setLastYankedLine(cursorLine);
        setStatusMsg(`[Yanked] Line ${cursorLine + 1} copied to registers!`);
      } else if (e.key === ':') {
        e.preventDefault();
        setEditorMode('COMMAND');
        setCommandInput('');
        setStatusMsg('');
        setTimeout(() => commandInputRef.current?.focus(), 20);
      } else if (e.key === 'G') {
        e.preventDefault();
        setCursorLine(editorLines.length - 1);
        setStatusMsg('');
      } else if (e.key === 'g') {
        e.preventDefault();
        setCursorLine(0);
        setStatusMsg('');
      }
    }
  };

  const handleLineChange = (idx: number, newVal: string) => {
    const nextLines = [...editorLines];
    nextLines[idx] = newVal;
    setEditorLines(nextLines);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (cmd === ':w') {
      setStatusMsg(`"${sectionId}.lua" ${editorLines.length}L written successfully`);
      setEditorMode('NORMAL');
    } else if (cmd === ':q') {
      setEditorLines(initialContent.split('\n'));
      setCursorLine(0);
      setEditorMode('NORMAL');
      setStatusMsg('Buffer reloaded and reset to default.');
    } else if (cmd.startsWith(':%s/')) {
      const parts = cmd.split('/');
      if (parts.length >= 3) {
        const findVal = parts[2];
        const replaceVal = parts[3] || '';
        const nextLines = editorLines.map(line => line.replaceAll(findVal, replaceVal));
        setEditorLines(nextLines);
        setStatusMsg(`Globally replaced "${findVal}" with "${replaceVal}"`);
      } else {
        setStatusMsg('E486: Pattern not found');
      }
      setEditorMode('NORMAL');
    } else {
      setStatusMsg(`E492: Not a buffer command: ${cmd}`);
      setEditorMode('NORMAL');
    }
    setCommandInput('');
  };

  useEffect(() => {
    if (containerRef.current && isFocused) {
      const activeLineEl = containerRef.current.querySelector(`[data-line-idx="${cursorLine}"]`);
      activeLineEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [cursorLine, isFocused]);

  return (
    <div
      ref={containerRef}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setTimeout(() => {
          if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
            setIsFocused(false);
            setEditorMode('NORMAL');
            setStatusMsg('');
          }
        }, 100);
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative my-4 rounded-xl border overflow-hidden font-mono text-[11px] md:text-xs leading-relaxed bg-[#0b0c10] select-none outline-none transition-all duration-300 ${
        isFocused 
          ? 'border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.25)]' 
          : 'border-zinc-800/85 hover:border-zinc-700/80'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-950 text-[11px] text-zinc-400 font-bold select-none">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isFocused ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span>nvim://buffer/{sectionId}.lua</span>
        </div>
        <div className="text-zinc-600 flex items-center gap-1">
          <span>{isFocused ? 'VIM MODE ACTIVE' : 'CLICK BUFFER TO FOCUS & EDIT'}</span>
        </div>
      </div>

      <div className="p-4 max-h-56 overflow-y-auto custom-scroll space-y-0.5 bg-black/40">
        {editorLines.map((line, idx) => {
          const isCursor = idx === cursorLine && isFocused;
          const explanation = getLineExplanation(line);
          return (
            <div
              key={idx}
              data-line-idx={idx}
              onClick={() => {
                setCursorLine(idx);
                setIsFocused(true);
              }}
              onMouseEnter={() => {
                if (explanation) setActiveExplanation(explanation);
              }}
              onMouseLeave={() => {
                setActiveExplanation('');
              }}
              className={`flex gap-3 px-2 py-0.5 rounded border-l-2 transition-all duration-150 ${
                isCursor
                  ? 'bg-zinc-900/60 border-indigo-500 text-indigo-200'
                  : 'border-transparent text-zinc-400 hover:bg-zinc-900/20 hover:text-zinc-300 cursor-pointer'
              } ${lastYankedLine === idx ? 'bg-emerald-950/30 text-emerald-300' : ''}`}
            >
              <span className={`text-right w-5 pr-1 select-none font-bold ${isCursor ? 'text-indigo-400' : 'text-zinc-600'}`}>
                {idx + 1}
              </span>
              {editorMode === 'INSERT' && isCursor ? (
                <input
                  type="text"
                  value={line}
                  onChange={(e) => handleLineChange(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setEditorMode('NORMAL');
                      setStatusMsg('-- NORMAL -- (Saved changes)');
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setEditorMode('NORMAL');
                      setStatusMsg('-- NORMAL --');
                    }
                  }}
                  autoFocus
                  className="bg-transparent flex-1 text-indigo-100 outline-none border-b border-indigo-500/80 font-mono text-[11px] md:text-xs py-0 m-0"
                />
              ) : (
                <span className="flex-1 whitespace-pre">{line ? <HighlightedLine text={line} /> : ' '}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-950 flex items-center justify-between text-[11px] select-none text-zinc-400">
        <div className="flex items-center gap-2 flex-1">
          <span className="font-black text-indigo-500">[{editorMode}]</span>
          {editorMode === 'COMMAND' ? (
            <form onSubmit={handleCommandSubmit} className="flex items-center flex-1">
              <input
                ref={commandInputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setEditorMode('NORMAL');
                    setStatusMsg('');
                  }
                }}
                className="bg-transparent text-zinc-200 font-mono outline-none border-none text-[10px] w-full py-0 m-0"
                placeholder=":w (write), :q (reload/reset), :%s/old/new/g (replace)"
              />
            </form>
          ) : (
            <span className="text-zinc-400 truncate">{statusMsg || 'Buffer clean. j/k: navigate | i: edit | y: yank | :w: write | :q: reset'}</span>
          )}
        </div>
        <div className="text-zinc-600 font-bold ml-2">
          {cursorLine + 1}:{editorLines[cursorLine]?.length || 0}
        </div>
      </div>
    </div>
  );
}

interface ChapterSectionProps {
  key?: string | number;
  chapter: Chapter;
  vimMode: 'normal' | 'insert' | 'visual' | 'command';
  onYank: (text: string) => void;
}

export default function ChapterSection({ chapter, vimMode, onYank }: ChapterSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Calculate reading time estimate (~200 WPM)
  const estimateReadingTime = () => {
    let totalText = chapter.description + ' ' + chapter.title;
    for (const sec of chapter.sections) {
      if (sec.content) totalText += ' ' + sec.content;
      if (sec.description) totalText += ' ' + sec.description;
      if (sec.extraData) {
        try {
          totalText += ' ' + JSON.stringify(sec.extraData);
        } catch (e) {}
      }
    }
    const wordCount = totalText.split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return minutes;
  };

  const readingTime = estimateReadingTime();

  // Physics-based scroll progress using Framer Motion
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Apply a gentle spring for buttery smooth bar filling
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Ghost numeral parallax: drifts against scroll direction at ~08x speed
  const ghostY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  // Get active accent styles dynamically matching Vim mode
  const getBadgeClass = () => {
    switch (vimMode) {
      case 'insert': return 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'visual': return 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'command': return 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      id={chapter.id}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -20% 0px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="chapter-section mb-24 scroll-mt-24 relative"
    >
      {/* Ghost chapter numeral — editorial scale anchor, drifts slower than the page */}
      <motion.span
        className="chapter-ghost-num"
        style={{ y: ghostY }}
        aria-hidden="true"
      >
        {String(chapter.num).padStart(2, '0')}
      </motion.span>

      {/* Per-chapter reading progress bar */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden rounded-t-lg">
        <motion.div
          className="chapter-progress-bar shadow-[0_0_8px_rgba(99,102,241,0.6)]"
          style={{ scaleX }}
        />
      </div>

      {/* Chapter Title Badge Header */}
      <div className="flex items-center gap-3 mb-4 select-none flex-wrap">
        <span className={`font-mono text-xs font-black uppercase tracking-widest px-3 py-1 rounded border transition-colors duration-300 ${getBadgeClass()}`}>
          Chapter {String(chapter.num).padStart(2, '0')}
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-bold tracking-wide">
          {chapter.tag}
        </span>
        <span className="reading-time-badge text-zinc-400 dark:text-zinc-500 bg-zinc-100/50 dark:bg-zinc-800/40 border border-zinc-200/30 dark:border-zinc-700/30">
          ~{readingTime} min read
        </span>
      </div>

      {/* Heading with adjusted leading to prevent ascender clipping */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-[1.18] py-1 mb-4">
        {chapter.title}
      </h2>

      <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg leading-relaxed mb-8 max-w-[62ch] font-sans">
        {chapter.description}
      </p>

      {/* Render sub-sections dynamically based on their interactive type */}
      <div className="space-y-10">
        {chapter.sections.map((sec) => (
          <SubSectionWrapper key={sec.id} sec={sec} vimMode={vimMode} onYank={onYank}>
            <SubSectionRenderer sec={sec} vimMode={vimMode} onYank={onYank} />
          </SubSectionWrapper>
        ))}
      </div>
    </motion.section>
  );
}

/* --- WRAPPER TO ENABLE IN-CONTOUR VISUAL YANK SELECTIONS (When in Visual Mode) --- */
interface SubSectionWrapperProps {
  key?: string | number;
  children: React.ReactNode;
  sec: SubSection;
  vimMode: string;
  onYank: (text: string) => void;
}

function SubSectionWrapper({ children, sec, vimMode, onYank }: SubSectionWrapperProps) {
  const [justSelected, setJustSelected] = useState(false);
  const isVisual = vimMode === 'visual';

  const handleClickToYank = () => {
    if (!isVisual) return;
    
    // Extract logical plain text content to yank
    const plainText = sec.content || sec.title || (sec.extraData ? JSON.stringify(sec.extraData) : '');
    onYank(plainText);
    
    setJustSelected(true);
    setTimeout(() => {
      setJustSelected(false);
    }, 1500);
  };

  return (
    <div
      onClick={handleClickToYank}
      className={`relative rounded-2xl transition-all duration-200 border border-transparent ${
        isVisual 
          ? 'hover:border-emerald-500/40 hover:bg-emerald-500/[0.01] dark:hover:bg-emerald-500/[0.005] cursor-crosshair group/yank shadow-[0_0_20px_transparent] hover:shadow-[0_4px_30px_rgba(16,185,129,0.03)]' 
          : ''
      }`}
    >
      {/* Sparkles or Outline Overlay for Visual yank feedback */}
      <AnimatePresence>
        {isVisual && (
          <div className="absolute top-2.5 right-2.5 pointer-events-none opacity-0 group-hover/yank:opacity-100 transition-opacity z-10">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold tracking-widest uppercase shadow-sm border border-emerald-500/15">
              <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
              <span>Yank Row to Register</span>
            </span>
          </div>
        )}

        {justSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-500/[0.05] dark:bg-emerald-500/[0.03] border-2 border-emerald-500 rounded-2xl pointer-events-none flex items-center justify-center z-20"
          >
            <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold px-4 py-2 rounded-lg bg-zinc-950 border border-emerald-500/35 flex items-center gap-2 text-xs shadow-xl scale-105">
              <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
              Yanked to register slot!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </div>
  );
}

/* --- ACTIVE RENDERER COMPONENT --- */
function SubSectionRenderer({ sec, vimMode, onYank }: { sec: SubSection; vimMode: string; onYank: (text: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [activeLineExplain, setActiveLineExplain] = useState<Record<string, string>>({});
  const [terminalActive, setTerminalActive] = useState<Record<string, boolean>>({});
  const [terminalHistory, setTerminalHistory] = useState<Record<string, string[]>>({});
  const [terminalInput, setTerminalInput] = useState<Record<string, string>>({});

  // States for Settings Interactive Playground (c17-s1)
  const [optNumber, setOptNumber] = useState(true);
  const [optRelative, setOptRelative] = useState(true);
  const [optTrueColor, setOptTrueColor] = useState(true);
  const [activeOptInfo, setActiveOptInfo] = useState('Hover options on left to inspect compile specs!');

  // States for Keymaps Interactive Simulator (c18-s1)
  const [simulatedMode, setSimulatedMode] = useState<'INSERT' | 'NORMAL'>('INSERT');
  const [keystrokeAnim, setKeystrokeAnim] = useState<string[]>([]);
  const [keymapTip, setKeymapTip] = useState('Type or click triggers to expand key-mappings!');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCheck = (idx: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const triggerKeymapSimulation = () => {
    setKeystrokeAnim(['j', 'k']);
    setTimeout(() => {
      setSimulatedMode('NORMAL');
      setKeystrokeAnim(['j', 'k', 'Esc']);
      setKeymapTip('Triggered: Home-row "jk" maps to escaping safely!');
    }, 900);
  };

  const resetKeymapSimulation = () => {
    setSimulatedMode('INSERT');
    setKeystrokeAnim([]);
    setKeymapTip('Reset! Back inside insert mode typing editor text.');
  };

  // Get active mode accent color hex/rgb for dynamic simulator styles
  const getModeColor = () => {
    switch (vimMode) {
      case 'insert': return 'rgb(245, 158, 11)';
      case 'visual': return 'rgb(16, 185, 129)';
      case 'command': return 'rgb(244, 63, 94)';
      default: return 'rgb(99, 102, 241)';
    }
  };

  const modeColor = getModeColor();

  switch (sec.type) {
    case 'text':
      return (
        <div id={sec.id} className="text-zinc-700 dark:text-zinc-300 text-base md:text-[1.0625rem] leading-[1.75] max-w-[65ch] space-y-4 p-1">
          <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-normal font-sans">
            {sec.title}
          </h4>
          <p>{sec.content}</p>
        </div>
      );

    case 'vs_matrix':
      const matrix = sec.extraData;
      return (
        <div id={sec.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 p-1">
          {/* Legacy side */}
          <div className="p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500/80" />
            <h5 className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 mb-4 tracking-wider uppercase">
              {matrix?.leftTitle || 'Legacy System'}
            </h5>
            <ul className="space-y-3">
              {matrix?.leftItems?.map((item: string, idx: number) => (
                <li key={idx} className="flex gap-2.5 text-xs md:text-sm text-zinc-600 dark:text-zinc-400 items-start">
                  <span className="text-rose-500 select-none font-bold mt-0.5 shrink-0">✕</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Modern side */}
          <div className="p-6 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-900/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: modeColor }} />
            <h5 className="font-mono text-xs font-bold mb-4 tracking-wider uppercase transition-colors duration-300" style={{ color: modeColor }}>
              {matrix?.rightTitle || 'Neovim Modern System'}
            </h5>
            <ul className="space-y-3">
              {matrix?.rightItems?.map((item: string, idx: number) => (
                <li key={idx} className="flex gap-2.5 text-xs md:text-sm text-zinc-800 dark:text-zinc-200 items-start">
                  <span className="select-none font-bold transition-colors duration-300 mt-0.5 shrink-0" style={{ color: modeColor }}>✓</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'steps':
      const stepsList = sec.extraData || [];
      return (
        <div id={sec.id} className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 space-y-8 my-10 ml-3 py-1">
          <h4 className="text-sm font-black tracking-wider font-mono absolute -top-8 -left-6 pl-6 uppercase transition-colors duration-300" style={{ color: modeColor }}>
            {sec.title}
          </h4>
          {stepsList.map((step: any, idx: number) => (
            <div key={idx} className="relative space-y-1">
              <span className="absolute -left-[35px] top-[2px] w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center font-mono text-xs font-bold shadow-sm select-none transition-colors duration-300" style={{ color: modeColor }}>
                {step.num}
              </span>
              <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{step.title}</h5>
              <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 pr-4 leading-relaxed mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      );

    case 'code_block':
      // ─── OPTION 1: USER SETTINGS INTERACTIVE PLAYGROUND (c17-s1) ───
      if (sec.id === 'c17-s1') {
        return (
          <div id={sec.id} className="my-8 lg:-mx-10 xl:-mx-16 rounded-2xl border border-zinc-300/50 dark:border-zinc-800/80 bg-zinc-950 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-zinc-900 border-b border-zinc-800/80 text-xs font-mono select-none">
              <span className="text-zinc-400 flex items-center gap-1.5 font-bold transition-colors duration-300" style={{ color: modeColor }}>
                <MonitorPlay className="w-4 h-4 animate-pulse" />
                <span>Interactive lua/user/settings.lua Simulator</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold transition-colors duration-300" style={{ backgroundColor: `${modeColor}15`, color: modeColor }}>LIVE COMPILE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-900">
              
              {/* Left Settings controls Column */}
              <div className="p-5 font-mono text-xs space-y-4 select-none">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1">Click lines to toggle settings:</div>
                
                <div 
                  onMouseEnter={() => setActiveOptInfo('opt.number = true: Enables absolute line numbers, serving as vertical grid markers.')}
                  onClick={() => setOptNumber(!optNumber)}
                  className={`p-2.5 rounded-lg border transition cursor-pointer select-none ${
                    optNumber 
                      ? 'bg-indigo-500/5 border-indigo-500/25 text-indigo-300' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-500 line-through'
                  }`}
                >
                  <code className="font-bold">vim.opt.number = {String(optNumber)}</code>
                  <span className="block text-[10px] text-zinc-500 mt-1">&rarr; Toggle absolute numbers columns</span>
                </div>

                <div 
                  onMouseEnter={() => setActiveOptInfo('opt.relativenumber = true: Enables relative numbering, so numbers list lines steps away from active cursor (perfect for high-speed jumping e.g. 5j, 10k).')}
                  onClick={() => setOptRelative(!optRelative)}
                  className={`p-2.5 rounded-lg border transition cursor-pointer select-none ${
                    optRelative 
                      ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-300' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-500 line-through'
                  }`}
                >
                  <code className="font-bold">vim.opt.relativenumber = {String(optRelative)}</code>
                  <span className="block text-[10px] text-zinc-500 mt-1">&rarr; Toggle jumping calculation columns</span>
                </div>

                <div 
                  onMouseEnter={() => setActiveOptInfo('opt.termguicolors = true: Restores native high-fidelity 24-bit RGB spectrums. When disabled, falls back to monochrome retro terminal schemes.')}
                  onClick={() => setOptTrueColor(!optTrueColor)}
                  className={`p-2.5 rounded-lg border transition cursor-pointer select-none ${
                    optTrueColor 
                      ? 'bg-sky-500/5 border-sky-500/25 text-sky-300' 
                      : 'bg-zinc-950 border-zinc-900 text-zinc-500 font-serif'
                  }`}
                >
                  <code className="font-bold">vim.opt.termguicolors = {String(optTrueColor)}</code>
                  <span className="block text-[10px] text-zinc-500 mt-1">&rarr; Toggle 24-bit palette colors renderer</span>
                </div>

                {/* Inspect tooltip */}
                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-900 text-zinc-400 leading-normal text-[11px] min-h-[60px]">
                  💡 <strong>Option Info:</strong> {activeOptInfo}
                </div>
              </div>

              {/* Right Live-simulated Virtual Terminal Column */}
              <div className={`p-5 font-mono text-[11px] flex flex-col justify-between transition-colors bg-zinc-950 ${
                optTrueColor ? '' : 'grayscale contrast-125'
              }`}>
                <div className="space-y-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1 flex items-center justify-between">
                    <span>SIMULATED NVIM RENDERER PORT:</span>
                    <span className={optTrueColor ? "font-bold text-zinc-400" : "text-zinc-500"} style={{ color: optTrueColor ? modeColor : '' }}>
                      {optTrueColor ? "TRUECOLOR ENABLED" : "MONOCHROME TERMINAL"}
                    </span>
                  </div>

                  {/* Lines mock */}
                  <div className="space-y-1 block border border-zinc-900 p-3 rounded-lg bg-black text-xs md:text-sm leading-relaxed overflow-hidden">
                    <div className="flex gap-4">
                      <span className="text-zinc-50 w-6 text-right select-none">
                        {optNumber ? (optRelative ? '2' : '1') : ''}
                      </span>
                      <span><span className={optTrueColor ? "text-indigo-400 font-semibold" : "text-white"}>local</span> map = vim.keymap</span>
                    </div>

                    <div className="flex gap-4 bg-zinc-900/30">
                      <span className="text-emerald-500 w-6 text-right select-none font-bold">
                        {optNumber ? '1' : ''}
                      </span>
                      <span>map.set(<span className={optTrueColor ? "text-sky-400" : "text-white"}>"n"</span>, <span className={optTrueColor ? "text-emerald-400" : "text-white"}>"&lt;C-h&gt;"</span>, <span className={optTrueColor ? "text-emerald-400" : "text-white"}>"&lt;C-w&gt;h"</span>)</span>
                    </div>

                    <div className="flex gap-4">
                      <span className="text-zinc-50 w-6 text-right select-none">
                        {optNumber ? (optRelative ? '2' : '3') : ''}
                      </span>
                      <span>print(<span className={optTrueColor ? "text-sky-400" : "text-white"}>"Neovim Online"</span>)</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 leading-normal pt-4 mt-2 border-t border-zinc-900 select-none">
                  ⚡ Simulated output changes live when you toggle compilation rules on the left!
                </div>
              </div>

            </div>
          </div>
        );
      }

      // ─── OPTION 2: LUA KEYMAPS INTERACTIVE SIMULATOR (c18-s1) ───
      if (sec.id === 'c18-s1') {
        return (
          <div id={sec.id} className="my-8 lg:-mx-10 xl:-mx-16 rounded-2xl border border-zinc-300/50 dark:border-zinc-800/80 bg-zinc-950 shadow-2xl overflow-hidden font-mono">
            <div className="flex items-center justify-between px-5 py-3 bg-zinc-900 border-b border-zinc-800/80 text-xs select-none">
              <span className="text-zinc-400 flex items-center gap-1.5 font-bold transition-colors duration-300" style={{ color: modeColor }}>
                <MonitorPlay className="w-4 h-4" />
                <span>Interactive lua/user/keymaps.lua Sandbox</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold transition-colors duration-300" style={{ backgroundColor: `${modeColor}15`, color: modeColor }}>MODAL MAP TEST</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-900 text-xs">
              
              {/* Left Column code triggers */}
              <div className="p-5 space-y-4 select-none">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Interactive map trigger actions:</div>
                
                <div className="p-3 bg-zinc-900/30 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between font-bold text-zinc-200">
                    <code>map("i", "jk", "&lt;Esc&gt;")</code>
                    <button
                      onClick={triggerKeymapSimulation}
                      className="px-2.5 py-1 rounded text-white text-[10px] transition cursor-pointer active:scale-95 shadow-sm font-bold duration-300"
                      style={{ backgroundColor: modeColor }}
                    >
                      Trigger Test
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                    Watch simulated cursor transition from insert mode typing back to Normal navigation state smoothly!
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-900 text-zinc-400 leading-normal text-[11px] min-h-[50px]">
                  💡 <strong>Simulator Status:</strong> {keymapTip}
                </div>
              </div>

              {/* Right Column Simulated terminal viewport */}
              <div className="p-5 flex flex-col justify-between bg-zinc-950">
                <div className="space-y-4">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center justify-between select-none">
                    <span>Virtual Editor State:</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors duration-300" style={{ backgroundColor: `${modeColor}15`, color: modeColor }}>
                      {simulatedMode} MODE
                    </span>
                  </div>

                  {/* Terminal mock viewport */}
                  <div className="border border-zinc-900 p-4 rounded-lg bg-black h-[110px] flex flex-col justify-between relative overflow-hidden">
                    <div className="text-zinc-300 leading-relaxed text-xs">
                      {simulatedMode === 'INSERT' ? (
                        <div>
                          <span>Some typing lines inside insertmode</span>
                          <span className="inline-block w-1.5 h-3.5 ml-0.5 animate-pulse" style={{ backgroundColor: modeColor }} />
                        </div>
                      ) : (
                        <div>
                          <span className="px-1.5 py-0.5 rounded select-none font-bold mr-1.5 border" style={{ backgroundColor: `${modeColor}15`, borderColor: `${modeColor}30`, color: modeColor }}>ESC FIRED!</span>
                          <span>Escaped back to Normal mode. cursor restored.</span>
                          <span className="inline-block w-2.5 h-2.5 ml-0.5" style={{ backgroundColor: modeColor }} />
                        </div>
                      )}
                    </div>

                    {/* Show animated keys indicator */}
                    <div className="flex gap-2 select-none">
                      <span className="text-[10px] text-zinc-600">Simulate Typing keys:</span>
                      <AnimatePresence>
                        {keystrokeAnim.map((k, idx) => (
                          <motion.kbd
                            key={idx}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            className="bg-zinc-800 border-zinc-700 font-bold px-1.5 rounded text-[10px] text-amber-400"
                          >
                            {k}
                          </motion.kbd>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-4 mt-2 border-t border-zinc-900 h-8 select-none">
                  <span className="text-[10px] text-zinc-500">Practice keys "jk" to slide out of insert</span>
                  <button
                    onClick={resetKeymapSimulation}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition whitespace-nowrap cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset View</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      }

      // Default Raw Code Block (unmatched filenames)
      const codeLines = (sec.content || '').split('\n');
      const getLineExplanation = (lineText: string) => {
        const trimmed = lineText.trim();
        if (trimmed.length === 0) return 'BLANK LINE: Spacer for visual clarity in configuration modules.';
        if (trimmed.startsWith('--')) return 'LUA COMMENT: Explains code pathways or flags modular configurations.';
        if (trimmed.includes('require(') || trimmed.includes('require ')) return 'LUA REQUIRE: Dynamically imports sibling plugins/configs relative to runtime folders.';
        if (trimmed.includes('vim.keymap.set') || trimmed.includes('map.set') || trimmed.includes('vim.api.nvim_set_keymap')) return 'VIM.KEYMAP.SET: Maps physical keys in selective modes (HJKL, <C-h>, Esc) to direct automations.';
        if (trimmed.includes('vim.opt.') || trimmed.includes('opt.')) return 'VIM.OPT: Alters global compiler preferences (tabstop, relative numbers, color support).';
        if (trimmed.startsWith('local ')) return 'LOCAL SCOPE: Invokes block-level private structures avoiding global memory bleed.';
        if (trimmed.startsWith('return ')) return 'MODULE EXPORT: Packs local configs back so requiring structures can grab them.';
        if (trimmed.includes('setup({') || trimmed.includes('.setup')) return 'INITIALIZE PORT: Hooks override parameters directly to plugin engines.';
        if (trimmed.includes('use {') || trimmed.includes('use(')) return 'PACKER REGISTRY: Registers modular package names to be downloaded automatically.';
        
        // Generic fallback for lexical AST parsing hover
        const firstWord = trimmed.split(/[^a-zA-Z0-9_]/)[0];
        if (firstWord) {
          return `EXPRESSION: Executes lexical token [${firstWord}] to configure Neovim state.`;
        }
        return 'STATEMENT: Evaluates Lua code statements in Neovim runtime.';
      };

      const activeExplanation = activeLineExplain[sec.id] || null;
      const isTerminal = terminalActive[sec.id] || false;

      return (
        <div id={sec.id} className="my-8 lg:-mx-10 xl:-mx-16 rounded-xl border border-zinc-200/30 dark:border-zinc-800 bg-zinc-950 shadow-[0_25px_60px_rgba(0,0,0,0.2)] overflow-hidden font-mono group/code block select-text">
          <div className="flex items-center justify-between px-5 py-3 bg-zinc-900 border-b border-zinc-800 text-xs select-none">
            <span className="text-zinc-400 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: modeColor }} />
              <span>{sec.extraData?.filename || 'init.lua'}</span>
            </span>
            <div className="flex items-center gap-4">
              {!isTerminal && (
                <button
                  onClick={() => handleCopy(sec.content || '')}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white transition duration-150 active:scale-95 cursor-pointer font-bold text-[11px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy config</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setTerminalActive(prev => {
                    const active = !prev[sec.id];
                    if (active && !terminalHistory[sec.id]) {
                      setTerminalHistory(h => ({
                        ...h,
                        [sec.id]: [
                          `nvim://reference terminal sandbox v0.8.2`,
                          `Type 'help' to see list of mock commands.`,
                          `Type 'run' or 'compile' to execute this lua configuration.`,
                          `----------------------------------------------------`
                        ]
                      }));
                    }
                    return { ...prev, [sec.id]: active };
                  });
                }}
                className="flex items-center gap-1 text-zinc-400 hover:text-white transition duration-150 active:scale-95 cursor-pointer font-bold text-[11px]"
              >
                <MonitorPlay className="w-3.5 h-3.5" />
                <span>{isTerminal ? 'Exit Sandbox' : 'Terminal Sandbox'}</span>
              </button>
            </div>
          </div>
          
          {isTerminal ? (
            <div className="px-5 py-4 h-64 bg-[#0b0c10] border-b border-zinc-900/60 flex flex-col font-mono text-zinc-300 text-xs leading-relaxed">
              <div className="flex-1 overflow-y-auto space-y-1 mb-2 pr-1 custom-scrollbar scroll-smooth">
                {(terminalHistory[sec.id] || []).map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{line}</div>
                ))}
                <div ref={el => el?.scrollIntoView({ behavior: 'smooth' })} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const cmdRaw = terminalInput[sec.id] || '';
                  const cmd = cmdRaw.trim();
                  if (!cmd) return;
                  const newHistory = [...(terminalHistory[sec.id] || []), `$ ${cmdRaw}`];
                  const cleanCmd = cmd.toLowerCase();
                  if (cleanCmd === 'help') {
                    newHistory.push(
                      `Available commands:`,
                      `  run / compile  - Simulates running the lua config in Neovim`,
                      `  ls             - Lists local files in runtime directory`,
                      `  cat init.lua   - Print the contents of init.lua`,
                      `  clear          - Clear terminal history`,
                      `  exit           - Exit terminal sandbox`
                    );
                  } else if (cleanCmd === 'run' || cleanCmd === 'compile') {
                    newHistory.push(
                      `[info] Parsing init.lua...`,
                      `[success] Compiled successfully without syntax errors!`,
                      `[success] Applied settings to Neovim buffer.`
                    );
                  } else if (cleanCmd === 'ls') {
                    newHistory.push(
                      `init.lua`,
                      `lua/`,
                      `  plugins.lua`,
                      `  keymaps.lua`,
                      `  options.lua`
                    );
                  } else if (cleanCmd === 'cat init.lua') {
                    newHistory.push(...(sec.content || '').split('\n'));
                  } else if (cleanCmd === 'clear') {
                    setTerminalHistory(h => ({ ...h, [sec.id]: [] }));
                    setTerminalInput(inp => ({ ...inp, [sec.id]: '' }));
                    return;
                  } else if (cleanCmd === 'exit') {
                    setTerminalActive(prev => ({ ...prev, [sec.id]: false }));
                    return;
                  } else {
                    newHistory.push(`sh: command not found: ${cmd}. Type 'help' to view suggestions.`);
                  }
                  setTerminalHistory(h => ({ ...h, [sec.id]: newHistory }));
                  setTerminalInput(inp => ({ ...inp, [sec.id]: '' }));
                }}
                className="flex items-center gap-1.5 border-t border-zinc-800/80 pt-2 select-none"
              >
                <span className="text-emerald-500 font-bold select-none">$</span>
                <input
                  type="text"
                  value={terminalInput[sec.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTerminalInput(inp => ({ ...inp, [sec.id]: val }));
                  }}
                  className="bg-transparent flex-1 text-white outline-none font-mono text-sm"
                  placeholder="Type a command (e.g. run, help, ls, clear)..."
                />
              </form>
            </div>
          ) : (
            <InteractiveCodeBlock
              sectionId={sec.id}
              initialContent={sec.content || ''}
              modeColor={modeColor}
              onYank={onYank}
              getLineExplanation={getLineExplanation}
              setActiveExplanation={(explain) => setActiveLineExplain(prev => ({ ...prev, [sec.id]: explain }))}
            />
          )}

          {/* Context-aware interactive AST Explanation feedback footer */}
          <div className="px-5 py-2.5 bg-zinc-900/40 text-[11px] leading-normal flex items-center gap-2 select-none">
            {isTerminal ? (
              <span className="text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sandbox Terminal Active. Type commands inside the shell.</span>
              </span>
            ) : activeExplanation ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 font-semibold"
                style={{ color: modeColor }}
              >
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase" style={{ backgroundColor: `${modeColor}15`, color: modeColor }}>LEXICAL INSPECTOR</span>
                <span className="text-zinc-200">{activeExplanation}</span>
              </motion.div>
            ) : (
              <span className="text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
                <span>Move cursor over code blocks above to trigger real-time lexical AST parsing</span>
              </span>
            )}
          </div>
        </div>
      );

    case 'table':
      const tableData = sec.extraData;
      return (
        <div id={sec.id} className="my-8 select-none">
          <div className="pb-3 border-b-2 border-zinc-300/60 dark:border-zinc-700/50 flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
            <TableProperties className="w-4 h-4" style={{ color: modeColor }} />
            <span>{sec.title}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-200/50 dark:border-zinc-800/80">
                  {tableData?.headers?.map((head: string, idx: number) => (
                    <th key={idx} className="px-4 py-3 font-bold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/20 dark:divide-zinc-800/20">
                {tableData?.rows?.map((row: string[], rowIdx: number) => (
                  <tr key={rowIdx} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
                    {row.map((cell: string, cellIdx: number) => (
                      <td key={cellIdx} className={`px-4 py-3.5 ${cellIdx === 0 ? 'font-bold text-zinc-950 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-200'}`} style={{ color: cellIdx === 0 ? (vimMode === 'normal' ? 'var(--neon-indigo)' : modeColor) : '' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'checklist':
      const checklistArray = sec.extraData || [];
      return (
        <div id={sec.id} className="space-y-4 my-6">
          <h4 className="text-sm font-bold font-mono tracking-widest uppercase mb-1 flex items-center gap-2" style={{ color: modeColor }}>
            <Zap className="w-3.5 h-3.5" style={{ color: modeColor }} />
            <span>{sec.title}</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
            {checklistArray.map((item: any, idx: number) => {
              const isChecked = !!checkedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(String(idx))}
                  data-checklist-card="true"
                  data-checked={isChecked ? "true" : "false"}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isChecked
                      ? 'border-emerald-500/30 bg-emerald-500/[0.04] text-emerald-800 dark:text-emerald-300'
                      : 'border-zinc-200/50 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 font-semibold">
                    <Check className={`w-4 h-4 shrink-0 transition-colors duration-300 ${isChecked ? 'text-emerald-500 font-bold' : 'text-zinc-400'}`} />
                    <span className="text-xs md:text-sm">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      );

    default:
      return null;
  }
}
