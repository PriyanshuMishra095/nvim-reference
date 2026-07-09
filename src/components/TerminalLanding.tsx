import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

interface TerminalLandingProps {
  onExplore: () => void;
  onContribute: () => void;
  theme: 'dark' | 'light';
  siteTitle: string;
  onUpdateTitle: (newTitle: string) => void;
}

const BOOT_COMMAND = 'nvim reference.md';

export default function TerminalLanding({ onExplore, onContribute, theme, siteTitle, onUpdateTitle }: TerminalLandingProps) {
  const [scrollHintVisible, setScrollHintVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(siteTitle);
  const gridOverlayRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const contributeBtnRef = useRef<HTMLButtonElement>(null);

  // Boot sequence: type `nvim reference.md` like a real terminal before the buffer opens.
  // Skipped for reduced-motion users, repeat visits in the same session, and reloads mid-page.
  const shouldBoot = () => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      if (sessionStorage.getItem('nvim-booted') === '1') return false;
    } catch (e) {}
    return window.scrollY < window.innerHeight * 0.5;
  };
  const [phase, setPhase] = useState<'boot' | 'ready'>(() => (shouldBoot() ? 'boot' : 'ready'));
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    if (phase !== 'boot') return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const typeNext = (i: number) => {
      if (cancelled) return;
      if (i > BOOT_COMMAND.length) {
        // Command fully typed — brief pause as if hitting Enter, then open the "buffer"
        timer = setTimeout(() => {
          if (cancelled) return;
          setPhase('ready');
          try { sessionStorage.setItem('nvim-booted', '1'); } catch (e) {}
        }, 420);
        return;
      }
      setTypedChars(i);
      // Human-ish typing rhythm: fast base with tiny jitter
      timer = setTimeout(() => typeNext(i + 1), 42 + Math.random() * 48);
    };

    timer = setTimeout(() => typeNext(1), 500);

    // Any key/click skips the boot instantly
    const skip = () => {
      cancelled = true;
      setPhase('ready');
      try { sessionStorage.setItem('nvim-booted', '1'); } catch (e) {}
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('mousedown', skip);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('mousedown', skip);
    };
  }, [phase]);

  useEffect(() => {
    setEditValue(siteTitle);
  }, [siteTitle]);

  useEffect(() => {
    // 1. Inactivity Timer for scroll prompt trigger
    let inactivityTimeout: NodeJS.Timeout;
    let lastClientX: number | null = null;
    let lastClientY: number | null = null;

    const showHint = () => {
      setScrollHintVisible(true);
    };

    const hideHint = () => {
      setScrollHintVisible(false);
    };

    const resetInactivityTimer = (e: MouseEvent | TouchEvent | KeyboardEvent | Event) => {
      if (e && e.type === 'mousemove') {
        const mouseEvent = e as MouseEvent;
        if (mouseEvent.clientX === lastClientX && mouseEvent.clientY === lastClientY) {
          return;
        }
        lastClientX = mouseEvent.clientX;
        lastClientY = mouseEvent.clientY;
      }

      hideHint();
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(showHint, 3500);
    };

    const activityEvents = ['mousemove', 'scroll', 'keydown', 'mousedown', 'touchstart'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    // Start timer on mount
    resetInactivityTimer({} as Event);

    // 2. Mouse Parallax on the Grid Overlay
    const handleMouseMoveGrid = (e: MouseEvent) => {
      if (gridOverlayRef.current) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.015;
        gridOverlayRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMoveGrid, { passive: true });

    return () => {
      clearTimeout(inactivityTimeout);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
      window.removeEventListener('mousemove', handleMouseMoveGrid);
    };
  }, []);

  // 3. Magnetic button hover handler with cached rect to avoid layout thrashing
  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const elem = e.currentTarget;
    const rect = elem.getBoundingClientRect();
    const elemX = rect.left + rect.width / 2;
    const elemY = rect.top + rect.height / 2;
    const dx = e.clientX - elemX;
    const dy = e.clientY - elemY;

    const maxPull = 12;
    const pullX = (dx / (rect.width / 2)) * maxPull;
    const pullY = (dy / (rect.height / 2)) * maxPull;

    elem.style.transition = 'none';
    elem.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.04)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const elem = e.currentTarget;
    elem.style.transition = 'transform 0.6s var(--ease-inertial)';
    elem.style.transform = '';
  };

  // Helper to split nvim://reference or similar patterns for design highlights
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

  // Empty-buffer tildes column (the unmistakable Vim signature)
  const railRows = ['1', '2', '3', '4', '5', '6', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'];

  return (
    <div className="relative select-none w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-transparent text-[var(--text-secondary)]">

      {/* ── BOOT PHASE: a bare terminal typing the launch command ── */}
      {phase === 'boot' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--bg-void)]">
          <div className="font-mono text-base sm:text-xl md:text-2xl text-[var(--text-primary)] tracking-tight">
            <span className="text-[var(--phosphor)]">➜</span>
            <span className="text-[var(--text-muted)] ml-3">~</span>
            <span className="ml-3">{BOOT_COMMAND.slice(0, typedChars)}</span>
            <span className="block-caret" />
          </div>
        </div>
      )}

      {/* Cinematic Fading Grid Overlay using var(--border-subtle) */}
      <div
        ref={gridOverlayRef}
        className="absolute inset-0 bg-[linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] bg-[size:80px_80px] bg-center opacity-80 pointer-events-none [mask-image:radial-gradient(circle,black_30%,transparent_70%)] [webkit-mask-image:radial-gradient(circle,black_30%,transparent_70%)]"
      />

      {phase === 'ready' && (
        <>
          {/* Vim line-number rail cascading down the left edge — the buffer just "opened" */}
          <div className="absolute left-5 md:left-8 top-0 bottom-0 hidden sm:flex flex-col justify-center gap-[1.1em] font-mono text-xs text-[var(--text-muted)] pointer-events-none" aria-hidden="true">
            {railRows.map((row, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: row === '~' ? 0.35 : 0.7, x: 0 }}
                transition={{ delay: 0.15 + i * 0.045, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={row === '~' ? 'text-[var(--phosphor)]' : ''}
              >
                {row}
              </motion.span>
            ))}
          </div>

          {/* Expanding horizontal entrance line matching layout.css */}
          <div className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-indigo)] via-[var(--neon-teal)] to-transparent pointer-events-none [transform:translate(-50%,-50%)] animate-[expandLine_1.4s_var(--ease-inertial)_forwards]" />

          {/* Main content layer without container blur background */}
          <div className="relative z-10 px-6 max-w-[95vw] xl:max-w-[85vw] text-center flex flex-col items-center gap-14 animate-[fadeInUpBlur_0.8s_var(--ease-inertial)_forwards]">

            {/* Title Container Group */}
            <div className="flex flex-col items-center gap-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateTitle(editValue);
                      setIsEditing(false);
                    } else if (e.key === 'Escape') {
                      setEditValue(siteTitle);
                      setIsEditing(false);
                    }
                  }}
                  onBlur={() => {
                    onUpdateTitle(editValue);
                    setIsEditing(false);
                  }}
                  className="landing-title-input text-center bg-transparent border-b border-[var(--neon-indigo)] outline-none text-[clamp(2.5rem,9vw,7rem)] font-black font-display tracking-tight text-[var(--text-primary)] leading-none max-w-full placeholder-zinc-500 py-1"
                  autoFocus
                />
              ) : (
                <h1
                  onClick={() => setIsEditing(true)}
                  className="landing-title text-[clamp(2.5rem,9vw,7rem)] font-black font-display tracking-tight text-[var(--text-primary)] leading-none cursor-text transition-all duration-300 hover:opacity-90 select-text"
                >
                  <span className="text-[var(--text-muted)]">{prefix}</span>{suffix}
                  <span className="block-caret" aria-hidden="true" />
                </h1>
              )}

              {/* Monospaced Subtitle */}
              <p className="landing-subtitle font-mono text-xs sm:text-sm md:text-base text-[var(--text-secondary)] tracking-[0.25em] uppercase font-bold mt-10">
                One reference to rule them all
              </p>
            </div>

            {/* Landing actions — primary CTA carries the weight, secondary stays quiet */}
            <div className="landing-actions flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                ref={exploreBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  onExplore();
                }}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="landing-btn primary-btn cursor-pointer px-[2.4rem] py-[0.9rem] font-mono text-[0.85rem] font-bold tracking-[0.05em] rounded-lg border border-transparent bg-[var(--text-primary)] text-[var(--bg-void)] hover:opacity-90 transition-colors duration-300 active:scale-95 shadow-lg"
                id="explore-trigger"
              >
                :e handbook
              </button>

              <button
                ref={contributeBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  onContribute();
                }}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="landing-btn secondary-btn cursor-pointer px-[2.4rem] py-[0.9rem] font-mono text-[0.85rem] font-semibold tracking-[0.05em] rounded-lg border border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--border-glow)] hover:border-[var(--border-active)] transition-colors duration-300 active:scale-95"
              >
                Contribute
              </button>
            </div>
          </div>

          {/* Subtle Scroll Hint — spoken in ex-command */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onExplore();
            }}
            className={`subtle-scroll-hint absolute bottom-[2.5rem] left-1/2 -translate-x-1/2 flex flex-col items-center gap-[0.4rem] cursor-pointer font-mono text-[0.8rem] tracking-[0.12em] text-[var(--phosphor)] transition-opacity duration-800 z-20 ${
              scrollHintVisible ? 'opacity-80' : 'opacity-0 pointer-events-none'
            }`}
            id="scroll-prompt-trigger"
          >
            <span>:read more<span className="block-caret" /></span>
          </div>
        </>
      )}
    </div>
  );
}
