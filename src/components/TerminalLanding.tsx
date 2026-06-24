import React, { useEffect, useState, useRef } from 'react';

interface TerminalLandingProps {
  onExplore: () => void;
  onContribute: () => void;
  theme: 'dark' | 'light';
  siteTitle: string;
  onUpdateTitle: (newTitle: string) => void;
}

export default function TerminalLanding({ onExplore, onContribute, theme, siteTitle, onUpdateTitle }: TerminalLandingProps) {
  const [scrollHintVisible, setScrollHintVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(siteTitle);
  const gridOverlayRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const contributeBtnRef = useRef<HTMLButtonElement>(null);

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
  const rectRef = useRef<DOMRect | null>(null);

  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    const maxPull = 12;
    const pullX = (dx / (rect.width / 2)) * maxPull;
    const pullY = (dy / (rect.height / 2)) * maxPull;

    // Use a smooth bezier curve for the active hover state transition to eliminate lag/snapping
    elem.style.transition = 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1)';
    elem.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.04)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const elem = e.currentTarget;
    rectRef.current = null;
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

  return (
    <div className="relative select-none w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-transparent text-[var(--text-secondary)]">
      
      {/* Cinematic Fading Grid Overlay using var(--border-subtle) */}
      <div 
        ref={gridOverlayRef} 
        className="absolute inset-0 bg-[linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] bg-[size:80px_80px] bg-center opacity-80 pointer-events-none [mask-image:radial-gradient(circle,black_30%,transparent_70%)] [webkit-mask-image:radial-gradient(circle,black_30%,transparent_70%)]" 
      />
      
      {/* Expanding horizontal entrance line matching layout.css */}
      <div className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-indigo)] via-[var(--neon-teal)] to-transparent pointer-events-none [transform:translate(-50%,-50%)] animate-[expandLine_1.4s_var(--ease-inertial)_forwards]" />

      {/* Main glassmorphic elevated panel framing the landing content */}
      <div className="relative z-10 px-8 py-12 md:px-16 md:py-16 mx-4 max-w-3xl text-center flex flex-col items-center gap-8 rounded-3xl border border-zinc-200/10 dark:border-zinc-800/20 bg-white/5 dark:bg-zinc-950/10 backdrop-blur-lg shadow-[0_30px_100px_rgba(0,0,0,0.01)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.15)] animate-[fadeInUpBlur_0.8s_var(--ease-inertial)_forwards]">
        
        {/* Title Container Group */}
        <div className="flex flex-col items-center gap-2">
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
              className="landing-title-input text-center bg-transparent border-b border-[var(--neon-indigo)] outline-none text-5xl md:text-7xl font-black font-display tracking-tight text-[var(--text-primary)] leading-none max-w-full placeholder-zinc-500 py-1"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditing(true)}
              className="landing-title text-5xl md:text-7xl font-black font-display tracking-tight text-[var(--text-primary)] leading-none cursor-text transition-all duration-300 hover:opacity-90 select-text"
            >
              {prefix}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-indigo)] to-[var(--neon-teal)]">{suffix}</span>
            </h1>
          )}

          {/* Monospaced Subtitle */}
          <p className="landing-subtitle font-mono text-xs md:text-sm text-[var(--text-secondary)] tracking-[0.25em] uppercase font-bold mt-2">
            One reference to rule them all
          </p>
        </div>

        {/* Clear Description Paragraph */}
        <p className="landing-description text-xs md:text-sm leading-relaxed max-w-xl text-[var(--text-secondary)]">
          Master the modal editing paradigm. Construct high-contrast visual environments, design modular Lua configuration layers, compile Tree-sitter parsers, and synthesize native autocomplete engines under Windows Terminal.
        </p>

        {/* Landing actions */}
        <div className="landing-actions flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            ref={exploreBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              onExplore();
            }}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="landing-btn primary-btn cursor-pointer px-[2.2rem] py-[0.85rem] font-mono text-[0.85rem] font-semibold tracking-[0.05em] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-glow)] hover:border-[var(--border-active)] transition-colors duration-300 active:scale-95 shadow-sm"
            id="explore-trigger"
          >
            Explore Handbook
          </button>
          
          <button
            ref={contributeBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              onContribute();
            }}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="landing-btn secondary-btn cursor-pointer px-[2.2rem] py-[0.85rem] font-mono text-[0.85rem] font-semibold tracking-[0.05em] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-glow)] hover:border-[var(--border-active)] transition-colors duration-300 active:scale-95 shadow-sm"
          >
            Contribute
          </button>
        </div>
      </div>

      {/* Subtle Scroll Hint */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onExplore();
        }}
        className={`subtle-scroll-hint absolute bottom-[2.5rem] left-1/2 -translate-x-1/2 flex flex-col items-center gap-[0.4rem] cursor-pointer font-mono text-[0.75rem] tracking-[0.15em] uppercase text-[var(--text-secondary)] transition-opacity duration-800 z-20 ${
          scrollHintVisible ? 'opacity-60' : 'opacity-0 pointer-events-none'
        }`}
        id="scroll-prompt-trigger"
      >
        <span className="hint-arrow text-sm animate-bounce">↓</span>
      </div>
    </div>
  );
}
