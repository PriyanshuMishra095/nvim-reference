import React, { useEffect, useRef } from 'react';

interface CustomCursorProps {
  vimMode?: 'normal' | 'insert' | 'visual' | 'command';
}

export default function CustomCursor({ vimMode = 'normal' }: CustomCursorProps) {
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  // Mouse & Physics Position
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastMouseMoveTimeRef = useRef(Date.now());
  const dotOpacityRef = useRef(1);

  // Custom cursor follower position and dimensions
  const cursorRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    w: 32,
    h: 32,
    r: 16
  });

  // Physics velocities
  const velRef = useRef({ x: 0, y: 0, w: 0, h: 0, r: 0 });

  // Interactive targets and input tracking refs
  // Interactive targets and input tracking refs
  const lockedElementRef = useRef<HTMLElement | null>(null);
  const isOverInputRef = useRef(false);
  const isOverCodeRef = useRef(false);
  const isOverClickableRef = useRef(false);
  const isOverChecklistRef = useRef(false);
  const isChecklistCheckedRef = useRef(false);
  const isOverTitleRef = useRef(false);
  const titleHeightRef = useRef(80);

  useEffect(() => {
    // 1. Skip on touch screen / coarse pointers
    const coarseMedia = window.matchMedia("(pointer: coarse)");
    if (coarseMedia.matches) return;

    // Set initial mouse position
    mouseRef.current.x = window.innerWidth / 2;
    mouseRef.current.y = window.innerHeight / 2;
    cursorRef.current.x = window.innerWidth / 2;
    cursorRef.current.y = window.innerHeight / 2;

    const hoverQuery = "aside a, kbd, button, .copy-btn, .next-indicator, .vs-box, .chapter-num, .celestial-toggle, #search-input, #search-input-box, .custom-scroll-thumb, .landing-btn, .cursor-pointer";

    // Unified function to query elements under the cursor coordinates
    const updateHoverState = (x: number, y: number) => {
      const target = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!target) {
        isOverInputRef.current = false;
        isOverCodeRef.current = false;
        isOverClickableRef.current = false;
        isOverChecklistRef.current = false;
        isChecklistCheckedRef.current = false;
        isOverTitleRef.current = false;
        lockedElementRef.current = null;
        return;
      }

      const isTitle = target.closest(".landing-title, .landing-title-input") as HTMLElement | null;
      isOverTitleRef.current = !!isTitle;
      if (isTitle) {
        let fs = 64;
        try {
          const style = window.getComputedStyle(isTitle);
          fs = parseFloat(style.fontSize) || 64;
        } catch (e) {}
        titleHeightRef.current = fs;
      }

      const isInput = target.closest("input, textarea, [contenteditable]");
      isOverInputRef.current = !!isInput && !isOverTitleRef.current;
      
      const isClickable = target.closest("a, button, kbd, .copy-btn, .next-indicator, .vs-box, .chapter-num, .celestial-toggle, .landing-btn, .custom-scroll-thumb, .cursor-pointer, [class*='btn']");
      isOverClickableRef.current = !!isClickable && !isOverTitleRef.current;

      // Clickable items inside code block should show hand icon, not green block caret
      const isCode = target.closest("code, pre, .term-code, .term-input, [class*='code']");
      isOverCodeRef.current = !!isCode && !isOverClickableRef.current && !isOverTitleRef.current;

      const checklistCard = target.closest("[data-checklist-card]") as HTMLElement | null;
      isOverChecklistRef.current = !!checklistCard;
      isChecklistCheckedRef.current = checklistCard ? checklistCard.getAttribute("data-checked") === "true" : false;

      // If over checklist card, override standard clickable/code states
      if (isOverChecklistRef.current) {
        isOverCodeRef.current = false;
      }

      const match = target.closest(hoverQuery) as HTMLElement | null;
      lockedElementRef.current = isOverTitleRef.current ? null : match;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      lastMouseMoveTimeRef.current = Date.now();
      dotOpacityRef.current = 1;

      updateHoverState(e.clientX, e.clientY);
    };

    // Update hover state dynamically on scroll as well
    const handleScroll = () => {
      updateHoverState(mouseRef.current.x, mouseRef.current.y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    let frameId: number;

    // 2. Physics animation loop
    const lensAnimationLoop = () => {
      const reticle = reticleRef.current;
      const dot = dotRef.current;
      
      if (!reticle) {
        frameId = requestAnimationFrame(lensAnimationLoop);
        return;
      }

      // Always update hover state on every frame to ensure perfect sync during scroll/animations
      updateHoverState(mouseRef.current.x, mouseRef.current.y);

      // Spring physics constants matching reference
      const spring = 0.12;
      const friction = 0.55;

      // Target dimensions and position
      let targetX = mouseRef.current.x;
      let targetY = mouseRef.current.y;
      let targetW = 32;
      let targetH = 32;
      let targetR = 16;
      let targetBg = "var(--cursor-bg)";
      let targetBorder = "var(--cursor-border)";

      let activeLockElement = lockedElementRef.current;

      // Proximity snap check to scrollbar thumb
      const thumbEl = document.querySelector(".custom-scroll-thumb") as HTMLElement | null;
      let snapInfluence = 0;
      let thumbCenterX = 0;
      let thumbCenterY = 0;
      let thumbW = 32;
      let thumbH = 32;
      let thumbR = 16;

      if (thumbEl && !activeLockElement) {
        const thumbRect = thumbEl.getBoundingClientRect();
        thumbCenterX = thumbRect.left + thumbRect.width / 2;
        thumbCenterY = thumbRect.top + thumbRect.height / 2;
        const dx = mouseRef.current.x - thumbCenterX;
        const dy = mouseRef.current.y - thumbCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const maxDist = 80;  // Starts detecting morphing from 80px away (tighter and less grabby)
        const snapDist = 24;  // Lock snap from 24px
        
        if (dist < maxDist) {
          const k = Math.max(0, Math.min(1, (maxDist - dist) / (maxDist - snapDist)));
          snapInfluence = k * k * (3 - 2 * k); // Smoothstep curve
          
          thumbW = thumbRect.width;
          thumbH = thumbRect.height;
          
          let br = 0;
          try {
            const style = window.getComputedStyle(thumbEl);
            br = parseFloat(style.borderRadius) || 0;
          } catch (e) {}
          thumbR = br;
        }
      }

      // Scrollbar dragging lock overrides
      if (document.body.classList.contains("scrollbar-dragging")) {
        snapInfluence = 1;
        const scrollThumb = document.querySelector(".custom-scroll-thumb") as HTMLElement | null;
        if (scrollThumb) {
          const thumbRect = scrollThumb.getBoundingClientRect();
          thumbCenterX = thumbRect.left + thumbRect.width / 2;
          thumbCenterY = thumbRect.top + thumbRect.height / 2;
          thumbW = thumbRect.width;
          thumbH = thumbRect.height;
          let br = 0;
          try {
            const style = window.getComputedStyle(scrollThumb);
            br = parseFloat(style.borderRadius) || 0;
          } catch (e) {}
          thumbR = br;
        }
      }

      // Snapping size calculation
      if (snapInfluence > 0) {
        // In-between morphing state when approaching the scrollbar thumb
        targetX = (1 - snapInfluence) * mouseRef.current.x + snapInfluence * thumbCenterX;
        targetY = (1 - snapInfluence) * mouseRef.current.y + snapInfluence * thumbCenterY;
        targetW = (1 - snapInfluence) * 32 + snapInfluence * thumbW;
        targetH = (1 - snapInfluence) * 32 + snapInfluence * thumbH;
        targetR = (1 - snapInfluence) * 16 + snapInfluence * thumbR;

        // Visual transition: Background color fades into purple/neon-indigo
        targetBg = `rgba(99, 102, 241, ${snapInfluence})`;
        
        // Border: fades away as snap completes
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const borderOpacity = 0.35 * (1 - snapInfluence);
        targetBorder = isDark ? `rgba(255, 255, 255, ${borderOpacity})` : `rgba(79, 70, 229, ${borderOpacity})`;
      } else if (activeLockElement) {
        const rect = activeLockElement.getBoundingClientRect();
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;

        let padding = 10;

        if ((activeLockElement.tagName === "A" || activeLockElement.tagName === "BUTTON") && activeLockElement.closest("aside")) {
          padding = -2; // snug fit inside sidebar rounded links and buttons
        } else if (activeLockElement.id === "search-input" || activeLockElement.id === "search-input-box") {
          padding = 4; // snug fit around search bar border
        } else if (activeLockElement.classList.contains("landing-btn")) {
          padding = 0; // snug fit on landing buttons
        }
        targetBg = "var(--cursor-snap-bg)";
        targetBorder = "var(--cursor-snap-border)";

        targetW = rect.width + padding;
        targetH = rect.height + padding;

        // Get snapped target border radius
        let br = 0;
        try {
          const style = window.getComputedStyle(activeLockElement);
          br = parseFloat(style.borderRadius) || 0;
        } catch (e) {}
        targetR = br + (padding / 2);
      }

      // Update position and dimensions via spring physics
      if (document.body.classList.contains("scrollbar-dragging")) {
        cursorRef.current.x = targetX;
        cursorRef.current.y = targetY;
        cursorRef.current.w = targetW;
        cursorRef.current.h = targetH;
        cursorRef.current.r = targetR;
        velRef.current = { x: 0, y: 0, w: 0, h: 0, r: 0 };
      } else {
        velRef.current.x += (targetX - cursorRef.current.x) * spring;
        velRef.current.y += (targetY - cursorRef.current.y) * spring;
        velRef.current.x *= friction;
        velRef.current.y *= friction;
        cursorRef.current.x += velRef.current.x;
        cursorRef.current.y += velRef.current.y;

        velRef.current.w += (targetW - cursorRef.current.w) * spring;
        velRef.current.h += (targetH - cursorRef.current.h) * spring;
        velRef.current.r += (targetR - cursorRef.current.r) * spring;
        velRef.current.w *= friction;
        velRef.current.h *= friction;
        velRef.current.r *= friction;
        cursorRef.current.w += velRef.current.w;
        cursorRef.current.h += velRef.current.h;
        cursorRef.current.r += velRef.current.r;
      }

      // Render follower reticle DOM styles
      reticle.style.width = `${cursorRef.current.w}px`;
      reticle.style.height = `${cursorRef.current.h}px`;
      reticle.style.borderRadius = `${cursorRef.current.r}px`;
      reticle.style.backgroundColor = targetBg;
      reticle.style.borderColor = targetBorder;
      reticle.style.transform = `translate3d(${cursorRef.current.x}px, ${cursorRef.current.y}px, 0) translate(-50%, -50%)`;

      // Hiding circle follower only when active text input is focused OR when hovering code blocks OR hovering the title
      if ((isOverInputRef.current && document.activeElement === activeLockElement) || isOverCodeRef.current || isOverTitleRef.current) {
        reticle.style.opacity = "0";
      } else {
        reticle.style.opacity = "";
      }

      // Precise dot positions and inactivity fading
      if (dot) {
        const now = Date.now();
        const timeSinceLastMove = now - lastMouseMoveTimeRef.current;
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";

        if (timeSinceLastMove > 800) {
          dotOpacityRef.current = Math.max(0, dotOpacityRef.current - 0.08);
        } else {
          dotOpacityRef.current = 1;
        }

        dot.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0) translate(-50%, -50%)`;
        dot.style.opacity = (isOverInputRef.current || isOverCodeRef.current || isOverChecklistRef.current || isOverTitleRef.current) ? "1" : dotOpacityRef.current.toString();

        const tickSvg = document.getElementById("custom-cursor-tick-svg") as HTMLElement | null;
        const xSvg = document.getElementById("custom-cursor-x-svg") as HTMLElement | null;

        if (isOverTitleRef.current) {
          // Title Caret: huge vertical text cursor matching title height
          const caretHeight = titleHeightRef.current;
          dot.style.width = "1.5px";
          dot.style.height = `${caretHeight}px`;
          dot.style.borderRadius = "0px";
          dot.style.backgroundColor = isDark ? "#ffffff" : "var(--neon-indigo)";
          dot.className = "fixed top-0 left-0 pointer-events-none transition-all duration-150 will-change-transform z-[100000000] flex items-center justify-center";
          if (tickSvg) tickSvg.style.opacity = "0";
          if (xSvg) xSvg.style.opacity = "0";
        } else if (isOverInputRef.current) {
          // Input Caret: thin vertical I-beam line
          dot.style.width = "2px";
          dot.style.height = "16px";
          dot.style.borderRadius = "1px";
          dot.style.backgroundColor = isDark ? "#ffffff" : "var(--neon-indigo)";
          dot.className = "fixed top-0 left-0 pointer-events-none transition-opacity duration-200 will-change-transform z-[100000000] flex items-center justify-center";
          if (tickSvg) tickSvg.style.opacity = "0";
          if (xSvg) xSvg.style.opacity = "0";
        } else if (isOverCodeRef.current) {
          // Code Caret: blinking green text block caret
          dot.style.width = "8px";
          dot.style.height = "15px";
          dot.style.borderRadius = "0px";
          dot.style.backgroundColor = "#22c55e";
          dot.className = "fixed top-0 left-0 pointer-events-none transition-opacity duration-200 will-change-transform z-[100000000] flex items-center justify-center ai-cursor-blink";
          if (tickSvg) tickSvg.style.opacity = "0";
          if (xSvg) xSvg.style.opacity = "0";
        } else if (isOverChecklistRef.current) {
          // Checklist hover: Green check mark or red X (a bit larger: 26px container)
          dot.style.width = "26px";
          dot.style.height = "26px";
          dot.style.borderRadius = "0px";
          dot.style.backgroundColor = "transparent";
          dot.className = "fixed top-0 left-0 pointer-events-none transition-opacity duration-200 will-change-transform z-[100000000] flex items-center justify-center";
          
          if (isChecklistCheckedRef.current) {
            // Already checked -> Show red X
            dot.style.color = "#ef4444"; // Red color
            if (xSvg) xSvg.style.opacity = "1";
            if (tickSvg) tickSvg.style.opacity = "0";
          } else {
            // Unchecked -> Show green tick
            dot.style.color = "#22c55e"; // Green color
            if (xSvg) xSvg.style.opacity = "0";
            if (tickSvg) tickSvg.style.opacity = "1";
          }
        } else {
          // Default Dot: small circle (used for both background and standard clickables, since hand morph is disabled)
          dot.style.width = "6px";
          dot.style.height = "6px";
          dot.style.borderRadius = "50%";
          dot.style.backgroundColor = isDark ? "#ffffff" : "var(--neon-indigo)";
          dot.className = "fixed top-0 left-0 pointer-events-none transition-opacity duration-200 will-change-transform z-[100000000] flex items-center justify-center";
          if (tickSvg) tickSvg.style.opacity = "0";
          if (xSvg) xSvg.style.opacity = "0";
        }
      }

      frameId = requestAnimationFrame(lensAnimationLoop);
    };

    lensAnimationLoop();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <div ref={reticleRef} id="custom-cursor-follower" />
      <div
        ref={dotRef}
        id="custom-cursor-dot"
        className="fixed top-0 left-0 pointer-events-none transition-opacity duration-200 will-change-transform z-[100000000] flex items-center justify-center"
      >
        {/* Green Tick SVG */}
        <svg
          id="custom-cursor-tick-svg"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: 'absolute',
            opacity: 0,
            transition: 'opacity 0.15s ease',
            color: 'currentColor'
          }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>

        {/* Red X SVG */}
        <svg
          id="custom-cursor-x-svg"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: 'absolute',
            opacity: 0,
            transition: 'opacity 0.15s ease',
            color: 'currentColor'
          }}
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    </>
  );
}
