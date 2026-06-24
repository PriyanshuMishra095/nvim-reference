import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowUpCircle, Terminal, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { CHAPTERS_DATA } from './data/chapters';
import BackgroundCanvas from './components/BackgroundCanvas';
import CustomCursor from './components/CustomCursor';
import TerminalLanding from './components/TerminalLanding';
import Sidebar from './components/Sidebar';
import ChapterSection from './components/ChapterSection';
import FloatingControls from './components/FloatingControls';
import VimStatusLine, { VimMode } from './components/VimStatusLine';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [onLanding, setOnLanding] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeChapterId, setActiveChapterId] = useState<string>('chapter-1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [modeBarVisible, setModeBarVisible] = useState<boolean>(true);
  const [contributeOpen, setContributeOpen] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [siteTitle, setSiteTitle] = useState<string>(() => sessionStorage.getItem('site-title') || 'nvim://reference');

  const handleUpdateTitle = (newTitle: string) => {
    setSiteTitle(newTitle);
    sessionStorage.setItem('site-title', newTitle);
  };

  const splitTitle = (title: string) => {
    const idx = title.indexOf('://');
    if (idx !== -1) {
      return {
        prefix: title.slice(0, idx + 3),
        suffix: title.slice(idx + 3)
      };
    }
    return { prefix: '', suffix: title };
  };
  const { prefix, suffix } = splitTitle(siteTitle);

  // Sync onLanding class list with body element
  useEffect(() => {
    document.body.classList.toggle('on-landing', onLanding);
  }, [onLanding]);

  // Magnetic attraction handler for buttons with bounding rect caching to avoid layout thrashing
  const rectRef = useRef<DOMRect | null>(null);

  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const elem = e.currentTarget;
    let rect = rectRef.current;
    if (!rect) {
      rect = elem.getBoundingClientRect();
      rectRef.current = rect;
    }
    const elemX = rect.left + rect.width / 2;
    const elemY = rect.top + rect.height / 2;
    const dx = e.clientX - elemX;
    const dy = e.clientY - elemY;
    const maxPull = 10;
    const pullX = (dx / (rect.width / 2)) * maxPull;
    const pullY = (dy / (rect.height / 2)) * maxPull;
    elem.style.transition = 'none';
    elem.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.05)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const elem = e.currentTarget;
    rectRef.current = null;
    elem.style.transition = 'transform 0.6s var(--ease-inertial)';
    elem.style.transform = '';
  };

  // Unified Interactive Vim States
  const [vimMode, setVimMode] = useState<VimMode>('normal');
  const [yankNotification, setYankNotification] = useState<string | null>(null);
  const [registers, setRegisters] = useState<Record<string, string>>({
    '"': '',
    '+': '',
    'a': '',
    'b': '',
    'c': ''
  });

  // Intel keyboard keys hud tracking state
  const [keystrokes, setKeystrokes] = useState<{ id: string; key: string; desc: string; timestamp: number }[]>([]);

  // Periodically clean up expired keystroke badges
  useEffect(() => {
    if (keystrokes.length === 0) return;
    const interval = setInterval(() => {
      setKeystrokes((prev) => prev.filter((k) => Date.now() - k.timestamp < 1850));
    }, 250);
    return () => clearInterval(interval);
  }, [keystrokes]);

  // Global reader keystroke tracker hook
  useEffect(() => {
    if (onLanding) return;

    const handleKeyPressVisual = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target && (target.closest('input, textarea, [contenteditable="true"]'));
      if (isTyping) return;

      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

      // Automatically unhide Mode Bar on any Vim key action
      const isVimKey = ['j', 'k', 'h', 'l', 'i', 'v', ':', 'Escape'].includes(e.key) || e.key.match(/^[0-9]$/) || e.key === '/';
      if (isVimKey) {
        setModeBarVisible(true);
      }

      let desc = 'Tactile keystroke';
      const key = e.key;

      if (key === 'j' || key === 'J') desc = 'Scroll Down Screen Block';
      else if (key === 'k' || key === 'K') desc = 'Scroll Up Screen Block';
      else if (key === 'i' || key === 'I') desc = 'Set Mode: INSERT / SEARCH';
      else if (key === 'v' || key === 'V') desc = 'Set Mode: VISUAL / block yank';
      else if (key === ':') desc = 'Set Mode: COMMAND prompt overlay';
      else if (key === 'Escape') desc = 'Normal Node / Dismiss help';
      else if (key === 'h' || key === 'H') desc = 'Tapping Left (Vim Navigation)';
      else if (key === 'l' || key === 'L') desc = 'Tapping Right (Vim Navigation)';
      else if (key === '/') desc = 'In-Page search filter input';
      else if (key.match(/^[0-9]$/)) desc = `Speed jump bookmark [Ch.${key}]`;
      else return;

      const id = `${Date.now()}-${Math.random()}`;
      setKeystrokes((prev) => [...prev.slice(-2), { id, key, desc, timestamp: Date.now() }]);
    };

    window.addEventListener('keydown', handleKeyPressVisual, true);
    return () => window.removeEventListener('keydown', handleKeyPressVisual, true);
  }, [onLanding, setModeBarVisible]);

  const handleYankText = (text: string) => {
    setRegisters((prev) => ({
      ...prev,
      '"': text,
      '+': text,
      'b': prev.b || text
    }));
    setYankNotification(text);
  };

  const handleClearYankNotification = () => {
    setYankNotification(null);
  };

  const handleClearRegister = (key: string) => {
    setRegisters((prev) => ({
      ...prev,
      [key]: ''
    }));
  };

  // Load theme preference cleanly on mounts
  useEffect(() => {
    let savedTheme: 'dark' | 'light' | null = null;
    try {
      savedTheme = localStorage.getItem('handbook-theme') as 'dark' | 'light' | null;
    } catch (e) {
      console.warn('localStorage is restricted in this sandboxed environment:', e);
    }
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      let prefersDark = true;
      try {
        prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch (e) {
        console.warn('matchMedia is restricted or unsupported:', e);
      }
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('handbook-theme', nextTheme);
    } catch (e) {
      console.warn('localStorage write failed in sandbox:', e);
    }
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Track global scroll progression percentage to feed the reader bar
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrolled = docHeight - winHeight > 0 ? (winScroll / (docHeight - winHeight)) * 100 : 0;

      // Sync landing state with scroll position
      const landingHeight = winHeight * 0.85;
      const isOnLanding = winScroll < landingHeight;
      setOnLanding((prev) => {
        if (prev !== isOnLanding) return isOnLanding;
        return prev;
      });

      // Update reader progress bar width directly
      const progressBar = progressBarRef.current;
      if (progressBar) {
        progressBar.style.width = `${scrolled}%`;
      }

      // Reveal scroll-to-top buttons conditionally
      const shouldShowScroll = winScroll > 600;
      setShowScrollTop((prev) => {
        if (prev !== shouldShowScroll) return shouldShowScroll;
        return prev;
      });

      // Scroll-spy active chapters to highlight in Sidebar Table of Contents
      if (!onLanding) {
        let currentActive = CHAPTERS_DATA[0].id;
        for (const ch of CHAPTERS_DATA) {
          const el = document.getElementById(ch.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            // Match viewport middle boundary line
            if (rect.top <= window.innerHeight * 0.4) {
              currentActive = ch.id;
            }
          }
        }
        setActiveChapterId((prev) => {
          if (prev !== currentActive) return currentActive;
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial run to sync progress
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onLanding]);

  // Custom Scrollbar track & thumb handler matching reference navigation.js
  const [showCustomScrollbar, setShowCustomScrollbar] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollTopRef = useRef(0);

  useEffect(() => {
    const coarseMedia = window.matchMedia("(pointer: coarse)");
    const checkScrollbar = () => {
      const isDesktop = !coarseMedia.matches && window.innerWidth > 1220;
      setShowCustomScrollbar(isDesktop);
    };

    checkScrollbar();
    window.addEventListener('resize', checkScrollbar);
    
    return () => {
      window.removeEventListener('resize', checkScrollbar);
    };
  }, []);

  useEffect(() => {
    if (!showCustomScrollbar) return;

    const thumb = thumbRef.current;
    const track = trackRef.current;
    if (!thumb || !track) return;

    const syncScrollbar = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      const thumbHeight = Math.max(60, (winHeight / docHeight) * winHeight);
      const maxScroll = docHeight - winHeight;
      const maxThumbTop = winHeight - thumbHeight - 8;
      const thumbTop = maxScroll > 0 ? (scrollTop / maxScroll) * maxThumbTop + 4 : 4;

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.top = `${thumbTop}px`;
    };

    window.addEventListener('scroll', syncScrollbar, { passive: true });
    window.addEventListener('resize', syncScrollbar);
    syncScrollbar(); // initial sync

    const handleMouseDown = (e: MouseEvent) => {
      if (e.target !== thumb) return;
      isDraggingRef.current = true;
      thumb.classList.add('dragging');
      document.body.classList.add('disable-select', 'scrollbar-dragging');
      document.documentElement.style.scrollBehavior = 'auto'; // Disable smooth scroll
      startYRef.current = e.clientY;
      startScrollTopRef.current = window.pageYOffset || document.documentElement.scrollTop;
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const deltaY = e.clientY - startYRef.current;

      const thumbHeight = parseFloat(thumb.style.height || '0');
      const maxScroll = docHeight - winHeight;
      const maxThumbTop = winHeight - thumbHeight - 8;

      const scrollAmount = (deltaY / maxThumbTop) * maxScroll;
      window.scrollTo(0, startScrollTopRef.current + scrollAmount);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        thumb.classList.remove('dragging');
        document.body.classList.remove('disable-select', 'scrollbar-dragging');
        document.documentElement.style.scrollBehavior = ''; // Restore smooth scroll
      }
    };

    const handleTrackClick = (e: MouseEvent) => {
      if (e.target === thumb) return;
      const rect = track.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const thumbHeight = parseFloat(thumb.style.height || '0');

      const percentage = (clickY - thumbHeight / 2) / (winHeight - thumbHeight);
      window.scrollTo({
        top: Math.max(0, percentage * (docHeight - winHeight)),
        behavior: 'smooth'
      });
    };

    thumb.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    track.addEventListener('click', handleTrackClick);

    return () => {
      window.removeEventListener('scroll', syncScrollbar);
      window.removeEventListener('resize', syncScrollbar);
      thumb.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      track.removeEventListener('click', handleTrackClick);
    };
  }, [showCustomScrollbar]);

  const handleNavigateChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setMobileSidebarOpen(false); // Auto collapse on mobile selections
  };

  return (
    <div className="min-h-screen font-sans antialiased text-zinc-800 dark:text-zinc-200 selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300 bg-transparent overflow-x-hidden">
      
      {/* Dynamic Backdrops */}
      <BackgroundCanvas theme={theme} vimMode={vimMode} onLanding={onLanding} />
      <CustomCursor vimMode={vimMode} />

      {/* Custom Scrollbar elements */}
      {showCustomScrollbar && (
        <div ref={trackRef} className="custom-scroll-track">
          <div ref={thumbRef} className="custom-scroll-thumb" />
        </div>
      )}

      {/* Primary horizontal Scroll progress metric bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-zinc-200/20 dark:bg-zinc-800/20 z-50 pointer-events-none">
        <div 
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-100 ease-out"
          style={{ width: '0%' }}
        />
      </div>

      {/* Floating Orbital Theme togglers */}
      <FloatingControls 
        theme={theme} 
        vimMode={vimMode}
        onToggleTheme={toggleTheme} 
        onOpenPlayground={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

      <div className="relative flex flex-col min-h-screen">
        
        {/* Scrollable Landing Page Hero */}
        <TerminalLanding 
          onExplore={() => {
            const landingHeight = window.innerHeight;
            window.scrollTo({ top: landingHeight, behavior: 'smooth' });
          }} 
          onContribute={() => setContributeOpen(true)}
          theme={theme} 
          siteTitle={siteTitle}
          onUpdateTitle={handleUpdateTitle}
        />

        {/* Core Handbook Reader layout */}
        <div className="relative flex min-h-screen">
          
          {/* Mobile minimalists navigation hamburger trigger bar (hidden on landing) */}
          <div 
            className={`fixed top-6 left-6 z-40 xl:hidden transition-all duration-500 ${
              onLanding ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100'
            }`}
          >
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="w-12 h-12 rounded-full border border-zinc-200/50 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Desktop Table of Contents Sidebar (slides off left on landing or when collapsed) */}
          <div 
            className="hidden xl:block w-[320px] h-screen fixed left-0 top-0 border-r border-zinc-200/50 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-3xl z-35 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: onLanding ? 'translate3d(calc(-100% - 60px), 0, 0)' : (sidebarVisible ? 'translate3d(0, 0, 0)' : 'translate3d(calc(-100% - 60px), 0, 0)'),
              opacity: onLanding ? 0 : (sidebarVisible ? 1 : 0),
              pointerEvents: onLanding || !sidebarVisible ? 'none' : 'auto'
            }}
          >
            <Sidebar 
              chapters={CHAPTERS_DATA} 
              activeChapterId={activeChapterId} 
              onNavigateChapter={handleNavigateChapter} 
              vimMode={vimMode}
              siteTitle={siteTitle}
            />
          </div>

          {/* Mobile Slide-in Drawer Sourced Sidebar */}
          <AnimatePresence>
            {mobileSidebarOpen && (
              <>
                {/* Overlay backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileSidebarOpen(false)}
                  className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-md z-20 xl:hidden"
                />
                
                {/* Sidemenu tray */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="fixed top-0 left-0 w-[300px] h-screen bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/80 z-30 xl:hidden shadow-2xl"
                >
                  <Sidebar 
                    chapters={CHAPTERS_DATA} 
                    activeChapterId={activeChapterId} 
                    onNavigateChapter={handleNavigateChapter} 
                    vimMode={vimMode}
                    siteTitle={siteTitle}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Core scrollable content container (paddings transition reactively) */}
          <div 
            className={`flex-1 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              onLanding || !sidebarVisible ? 'xl:pl-0' : 'xl:pl-[320px]'
            }`}
          >
            <main className="max-w-4xl mx-auto px-6 md:px-12 py-24 md:py-32 space-y-16">
              
              {/* Confident Text-Only Display Hero Layout block as mandated */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative py-16 px-8 md:px-12 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/10 backdrop-blur-md overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.01)] mb-20 group"
              >
                <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-mono text-[10px] uppercase tracking-wider mb-6">
                  <span>Standard 0.12+ Blueprint Specification</span>
                </div>

                {/* CONFIDENT Typography with adjusted line-height to prevent font clipping */}
                <h1 className="text-4xl md:text-7xl font-black font-display text-zinc-900 dark:text-zinc-50 tracking-tight leading-[1.18] py-1 mb-6">
                  {prefix}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400">{suffix}</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed max-w-2xl mb-8">
                  One reference to rule them all. An encyclopedic developer showcase designed with absolute modal precision, structural syntax parsers, and custom configurations.
                </p>

                <div className="flex flex-flow gap-3 font-mono text-xs text-zinc-400">
                  <span className="px-3 py-1 rounded border border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-900/40">22 Chapters</span>
                  <span className="px-3 py-1 rounded border border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-900/40">Zero Mouse Overhead</span>
                  <span className="px-3 py-1 rounded border border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-900/40">Pure Velocity</span>
                </div>
              </motion.div>

              {/* Dynamic Chapter Lists */}
              <div className="divide-y divide-zinc-200/30 dark:divide-zinc-800/40 space-y-16 pb-24">
                {CHAPTERS_DATA.map((chapter) => (
                  <ChapterSection 
                    key={chapter.id} 
                    chapter={chapter} 
                    vimMode={vimMode}
                    onYank={handleYankText}
                  />
                ))}
              </div>

              {/* Spectacular Footer */}
              <footer className="pt-12 pb-16 border-t border-zinc-200/50 dark:border-zinc-800/70 text-center font-mono text-xs text-zinc-400 dark:text-zinc-500 space-y-3">
                <div className="flex justify-center items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  <span>{siteTitle} — Release 2026</span>
                </div>
                <div>Master the modal paradigm and command your terminal with pride.</div>
                <div className="text-[10px] text-zinc-400/80 dark:text-zinc-500/80 mt-1">
                  Client Host: Windows 11 x64
                </div>
              </footer>

            </main>
          </div>

          {/* Core Fixed Neovim Command Console and Mode Status bar (slides down on landing or when collapsed) */}
          <VimStatusLine
            theme={theme}
            onToggleTheme={toggleTheme}
            activeChapter={CHAPTERS_DATA.find(c => c.id === activeChapterId) || null}
            onNavigateChapter={handleNavigateChapter}
            chapters={CHAPTERS_DATA}
            onOpenPlayground={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            registers={registers}
            onClearRegister={handleClearRegister}
            onYankNotification={yankNotification}
            onClearYankNotification={handleClearYankNotification}
            vimMode={vimMode}
            setVimMode={setVimMode}
            style={{
              transform: onLanding ? 'translate3d(0, 100%, 0)' : (modeBarVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, calc(100% + 20px), 0)'),
              transition: 'transform 0.6s var(--ease-inertial)'
            } as React.CSSProperties}
          />

          {/* Collapse / Expand Desktop Sidebar Toggle handle */}
          {!onLanding && (
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="hidden xl:flex fixed top-6 z-40 w-10 h-10 rounded-full border border-zinc-200/50 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md items-center justify-center text-zinc-500 hover:text-indigo-500 shadow-sm cursor-pointer active:scale-95 transition-all duration-500"
              style={{ left: sidebarVisible ? '336px' : '24px' }}
              title={sidebarVisible ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {sidebarVisible ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}

          {/* Collapse / Expand Mode Bar Toggle handle */}
          {!onLanding && (
            <button
              onClick={() => setModeBarVisible(!modeBarVisible)}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className={`fixed right-6 z-40 w-10 h-10 rounded-full border border-zinc-200/50 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md flex items-center justify-center text-zinc-500 hover:text-indigo-500 shadow-sm cursor-pointer active:scale-95 transition-all duration-500 ${
                modeBarVisible ? 'bottom-[64px]' : 'bottom-6'
              }`}
              title={modeBarVisible ? "Hide Statusline" : "Show Statusline"}
            >
              {modeBarVisible ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}

          {/* Extreme interactive Scroll-to-Top Button trigger (positioned dynamically bottom-left) */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="scroll-to-top-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className={`fixed z-30 w-10 h-10 rounded-full border border-zinc-200/50 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md flex items-center justify-center text-indigo-500 hover:text-indigo-600 shadow-lg shadow-indigo-500/10 cursor-pointer transition-all duration-500 ${
                  sidebarVisible && !onLanding ? 'xl:left-[340px] left-6' : 'left-6'
                } ${
                  modeBarVisible ? 'bottom-[64px]' : 'bottom-6'
                }`}
                title="Scroll back to structural top"
              >
                <ArrowUpCircle className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Stacking glassmorphic interactive keystroke logger overlay (HUD - hidden on landing) */}
          {!onLanding && (
            <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none select-none max-w-xs font-mono">
              <AnimatePresence>
                {keystrokes.map((feed) => (
                  <motion.div
                    key={feed.id}
                    initial={{ opacity: 0, x: 50, scale: 0.85, y: 15 }}
                    animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
                    exit={{ opacity: 0, x: 25, scale: 0.85, y: -10 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 280 }}
                    className="p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-2xl flex items-center gap-3.5 w-[250px]"
                  >
                    <div className="px-2.5 py-1 rounded bg-zinc-950 dark:bg-zinc-900 border-b-[2.5px] border-zinc-950 text-white dark:text-zinc-100 text-xs font-black shadow-md shrink-0 flex items-center justify-center min-w-[34px] tracking-wider">
                      {feed.key === ' ' ? 'SPC' : feed.key}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-widest mb-0.5">Tactile Key HUD</div>
                      <div className="text-[11px] font-medium text-zinc-700 dark:text-zinc-200 truncate pr-1">
                        {feed.desc}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>
    
      {/* Contribute Page View */}
      <AnimatePresence>
        {contributeOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/90 dark:bg-[#07080a]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-zinc-850 dark:text-zinc-200"
          >
            <div className="max-w-2xl w-full border border-zinc-200/50 dark:border-zinc-800/85 bg-white/70 dark:bg-zinc-950/30 p-8 md:p-12 rounded-3xl relative shadow-2xl">
              {/* Close Button */}
              <button
                onClick={() => setContributeOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full border border-zinc-200/50 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 hover:text-zinc-850 dark:hover:text-white cursor-pointer active:scale-95 transition-all"
                title="Close Contribute Panel"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex flex-col gap-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-mono text-[10px] uppercase tracking-wider w-fit">
                  <span>Open Source Initiative</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black font-display text-zinc-900 dark:text-zinc-50 leading-tight">
                  nvim://<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-455">contribute</span>
                </h2>

                <div className="space-y-4 text-sm md:text-base leading-relaxed text-zinc-650 dark:text-zinc-300">
                  <p>
                    <strong>Why this handbook was needed:</strong> Neovim has a steep learning curve. Newbies are often overwhelmed by obscure config files and modal keystroke layouts. This website was built to help beginners master Neovim's modal paradigm on a clean, beautiful, and interactive interface.
                  </p>
                  <p>
                    This is a community-driven open-source project. We invite you to join us in building, translating, and styling this handbook!
                  </p>
                </div>

                {/* Repo Card */}
                <a
                  href="https://github.com/PriyanshuMishra095/Neovim-Handbook-Studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/70 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 hover:border-indigo-500/40 transition duration-300 group flex flex-col gap-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-550 dark:text-indigo-400">GitHub Repository</span>
                    <ArrowUpCircle className="w-5 h-5 text-indigo-550 dark:text-indigo-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50 break-all text-sm md:text-base">
                    PriyanshuMishra095/Neovim-Handbook-Studio
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Fork the repo, submit pull requests, or open issues to participate.
                  </span>
                </a>

                {/* LLM Disclosure Statement */}
                <div className="p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-100/40 dark:bg-zinc-900/10 text-xs text-zinc-500 dark:text-zinc-550 font-mono leading-relaxed mt-2">
                  <span className="font-bold text-zinc-700 dark:text-zinc-450 block mb-1">Full AI Disclosure:</span>
                  This handbook interface and its system components were designed and implemented with the assistance of agentic Large Language Models (LLMs) to ensure extreme modal fidelity, liquid physics, and premium APCA aesthetics.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Analytics />
    </div>
  );
}
