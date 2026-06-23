import React, { useEffect, useState, useRef } from 'react';

interface TerminalLandingProps {
  onExplore: () => void;
  onContribute: () => void;
  theme: 'dark' | 'light';
}

export default function TerminalLanding({ onExplore, onContribute, theme }: TerminalLandingProps) {
  const [scrollHintVisible, setScrollHintVisible] = useState(false);
  const gridOverlayRef = useRef<HTMLDivElement>(null);
  const exploreBtnRef = useRef<HTMLButtonElement>(null);
  const contributeBtnRef = useRef<HTMLButtonElement>(null);

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

    const maxPull = 10;
    const pullX = (dx / (rect.width / 2)) * maxPull;
    const pullY = (dy / (rect.height / 2)) * maxPull;

    elem.style.transition = 'none';
    elem.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(1.05)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const elem = e.currentTarget;
    rectRef.current = null;
    elem.style.transition = 'transform 0.6s var(--ease-inertial)';
    elem.style.transform = '';
  };

  return (
    <div className="relative select-none w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-transparent text-[var(--text-secondary)]">
      
      {/* Cinematic Fading Grid Overlay using var(--border-subtle) */}
      <div 
        ref={gridOverlayRef} 
        className="absolute inset-0 bg-[linear-gradient(var(--border-subtle)_1px,transparent_1px),linear-gradient(90deg,var(--border-subtle)_1px,transparent_1px)] bg-[size:80px_80px] bg-center opacity-80 pointer-events-none [mask-image:radial-gradient(circle,black_30%,transparent_70%)] [webkit-mask-image:radial-gradient(circle,black_30%,transparent_70%)]" 
      />
      
      {/* Expanding horizontal entrance line matching layout.css */}
      <div className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-transparent via-[var(--neon-indigo)] via-[var(--neon-teal)] to-transparent pointer-events-none [transform:translate(-50%,-50%)] animate-[expandLine_1.4s_var(--ease-inertial)_forwards]" />

      {/* Main content layer */}
      <div className="relative z-10 px-6 max-w-4xl text-center flex flex-col items-center gap-6">
        
        {/* Cinematic Header with gradient and entry reveal animation */}
        <h1 className="landing-title text-5xl md:text-8xl font-black font-display tracking-tight text-[var(--text-primary)] mb-2 leading-none animate-cinema-reveal">
          nvim://<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--neon-indigo)] to-[var(--neon-teal)]">reference</span>
        </h1>

        {/* Monospaced Subtitle */}
        <p className="landing-subtitle font-mono text-sm md:text-base text-[var(--text-secondary)] tracking-[0.2em] uppercase font-bold animate-fade-in-up-blur">
          One reference to rule them all
        </p>

        {/* Clear Description Paragraph */}
        <p className="landing-description text-xs md:text-sm leading-relaxed max-w-2xl text-[var(--text-secondary)] mt-2 mb-6 animate-fade-in-up">
          Master the modal editing paradigm. Construct high-contrast visual environments, design modular Lua configuration layers, compile Tree-sitter parsers, and synthesize native autocomplete engines under Windows Terminal.
        </p>

        {/* Landing actions */}
        <div className="landing-actions flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up-scale">
          <button
            ref={exploreBtnRef}
            onClick={(e) => {
              e.stopPropagation();
              onExplore();
            }}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="landing-btn primary-btn cursor-pointer px-[2.2rem] py-[0.85rem] font-mono text-[0.85rem] font-semibold tracking-[0.05em] rounded-lg bg-[var(--neon-indigo)] text-[#f8fafc] hover:bg-transparent hover:text-[var(--neon-indigo)] shadow-[0_8px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)] transition-colors duration-300 border border-[var(--neon-indigo)] active:scale-95"
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
            className="landing-btn secondary-btn cursor-pointer px-[2.2rem] py-[0.85rem] font-mono text-[0.85rem] font-semibold tracking-[0.05em] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--border-glow)] hover:border-[var(--border-active)] transition-colors duration-300 active:scale-95"
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
