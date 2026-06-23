import React, { useRef } from 'react';
import { VimMode } from './VimStatusLine';

interface FloatingControlsProps {
  theme: 'dark' | 'light';
  vimMode?: VimMode;
  onToggleTheme: () => void;
  onOpenPlayground: () => void;
}

export default function FloatingControls({ theme, vimMode = 'normal', onToggleTheme, onOpenPlayground }: FloatingControlsProps) {
  
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
    elem.style.transition = 'transform 0.6s var(--ease-spring), border-color 0.3s, background-color 0.3s, box-shadow 0.3s';
    elem.style.transform = '';
  };

  // Get current accent color for hover shadows
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
    <div className="top-right-controls fixed top-6 right-6 flex items-center gap-3.5 z-40 select-none">
      {/* Celestial Theme Toggle Button */}
      <button
        id="theme-toggle"
        className="celestial-toggle cursor-pointer"
        aria-label="Toggle visual theme"
        onClick={onToggleTheme}
        onMouseMove={handleMagneticMove}
        onMouseLeave={handleMagneticLeave}
        style={{
          '--neon-indigo': modeColor
        } as React.CSSProperties}
      >
        <svg className="orbital-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" className="orbit-ring outer" />
          <circle cx="50" cy="50" r="26" className="orbit-ring inner" />
          <line 
            x1="50" 
            y1="8" 
            x2="50" 
            y2="92" 
            className="axial-line" 
            style={{
              transform: `rotate(${theme === 'light' ? 180 : 0}deg)`,
              transformOrigin: '50px 50px'
            }}
          />
          <circle 
            cx="50" 
            cy="8" 
            r="6" 
            className="celestial-body sun" 
            style={{
              transform: `rotate(${theme === 'light' ? 180 : 0}deg)`,
              transformOrigin: '50px 50px'
            }}
          />
          <circle 
            cx="50" 
            cy="92" 
            r="5" 
            className="celestial-body moon" 
            style={{
              transform: `rotate(${theme === 'light' ? 180 : 0}deg)`,
              transformOrigin: '50px 50px'
            }}
          />
        </svg>
      </button>
    </div>
  );
}

