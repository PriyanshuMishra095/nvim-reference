import React, { useEffect, useRef } from 'react';

interface BackgroundCanvasProps {
  theme: 'dark' | 'light';
  vimMode?: 'normal' | 'insert' | 'visual' | 'command';
  onLanding?: boolean;
}

export default function BackgroundCanvas({ theme, vimMode = 'normal', onLanding = true }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onLandingRef = useRef(onLanding);
  const themeRef = useRef(theme);
  const vimModeRef = useRef(vimMode);

  useEffect(() => {
    onLandingRef.current = onLanding;
  }, [onLanding]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    vimModeRef.current = vimMode;
  }, [vimMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let mouse = { x: width / 2, y: height / 2, active: false };
    let particles: CosmicDust[] = [];
    let orbs: AuroraOrb[] = [];
    
    const RIPPLE_POOL_SIZE = 15;
    const ripplesPool: Ripple[] = [];
    let scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Helper functions
    const handleScroll = () => {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initBackgroundElements(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      const ripple = ripplesPool.find(r => !r.active);
      if (ripple) {
        ripple.activate(e.clientX, e.clientY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Color Helpers
    function getThemeColors() {
      const isDark = themeRef.current === 'dark';
      
      // Celestial default accents from variables.css
      return {
        primary: isDark ? { r: 99, g: 102, b: 241 } : { r: 79, g: 70, b: 229 },    // Neon Indigo
        secondary: isDark ? { r: 125, g: 211, b: 252 } : { r: 2, g: 132, b: 198 }, // Neon Teal
        accent: isDark ? { r: 110, g: 231, b: 183 } : { r: 5, g: 150, b: 105 }     // Neon Emerald
      };
    }

    function lerp(start: number, end: number, amt: number) {
      return (1 - amt) * start + amt * end;
    }

    class Ripple {
      x = 0;
      y = 0;
      radius = 0;
      maxRadius = 280;
      alpha = 0.45;
      progress = 0;
      active = false;

      activate(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.alpha = 0.45;
        this.progress = 0;
        this.active = true;
      }

      update() {
        if (!this.active) return false;
        
        // Increased speed for dynamic and responsive click response
        this.progress += 0.024;
        
        if (this.progress >= 1) {
          this.active = false;
          this.progress = 1;
        }

        // Cubic ease-in: starts slow, accelerates rapidly as it goes further
        const ease = this.progress * this.progress * this.progress;
        this.radius = this.maxRadius * ease;
        
        // Higher starting alpha for increased visibility
        this.alpha = 0.85 * (1 - this.progress);
        
        return this.active;
      }

      draw() {
        if (!this.active) return;
        const isDark = themeRef.current === 'dark';
        // Brighter neon indigo in dark mode, royal indigo in light mode
        const color = isDark ? "165, 180, 252" : "79, 70, 229";

        ctx.save();
        // High visibility alpha factor
        ctx.strokeStyle = `rgba(${color}, ${this.alpha * 0.75})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Allocate ripple pool
    for (let i = 0; i < RIPPLE_POOL_SIZE; i++) {
      ripplesPool.push(new Ripple());
    }

    class AuroraOrb {
      x: number;
      y: number;
      radius: number;
      currentRgb: { r: number; g: number; b: number };
      targetRgb: { r: number; g: number; b: number };
      vx: number;
      vy: number;
      index: number;

      constructor(colorRgb: { r: number; g: number; b: number }, index: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 300 + 250;
        this.currentRgb = { ...colorRgb };
        this.targetRgb = { ...colorRgb };
        this.vx = Math.random() * 0.4 - 0.2;
        this.vy = Math.random() * 0.4 - 0.2;
        this.index = index;
      }

      updateColors(newColorRgb: { r: number; g: number; b: number }) {
        this.targetRgb = { ...newColorRgb };
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        this.currentRgb.r = lerp(this.currentRgb.r, this.targetRgb.r, 0.05);
        this.currentRgb.g = lerp(this.currentRgb.g, this.targetRgb.g, 0.05);
        this.currentRgb.b = lerp(this.currentRgb.b, this.targetRgb.b, 0.05);

        if (this.x < -this.radius) this.x = width + this.radius;
        if (this.x > width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = height + this.radius;
        if (this.y > height + this.radius) this.y = -this.radius;
      }

      draw() {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        
        const r = Math.round(this.currentRgb.r);
        const g = Math.round(this.currentRgb.g);
        const b = Math.round(this.currentRgb.b);

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.save();
        const isDark = themeRef.current === 'dark';
        const landing = onLandingRef.current;
        ctx.globalCompositeOperation = isDark ? "screen" : "multiply";
        
        const baseAlpha = isDark ? 0.08 : 0.04;
        ctx.globalAlpha = landing ? baseAlpha * 2.5 : baseAlpha;

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class CosmicDust {
      x: number;
      y: number;
      twinklePhase: number;
      twinkleSpeed: number;
      radius: number;
      depth: number;
      alpha: number;
      vx: number;
      vy: number;
      extraVx = 0;
      extraVy = 0;
      renderY = 0;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.01 + 0.005; // Slower organic twinkling
        
        const rand = Math.random();
        // Star Size Distribution: 10% Large, 25% Medium, 65% Small
        if (rand > 0.90) {
          this.radius = Math.random() * 2.0 + 4.0; // 4px to 6px
        } else if (rand > 0.65) {
          this.radius = Math.random() * 1.5 + 2.0; // 2px to 3.5px
        } else {
          this.radius = Math.random() * 1.0 + 1.0; // 1px to 2px
        }
        
        this.depth = this.radius * 0.07;
        this.alpha = Math.random() * 0.45 + 0.3;
        
        this.vx = Math.random() * 0.12 - 0.06;
        this.vy = Math.random() * 0.12 - 0.06;
      }

      update() {
        this.x += this.vx + this.extraVx;
        this.y += this.vy + this.extraVy;
        
        this.twinklePhase += this.twinkleSpeed;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        this.extraVx *= 0.93;
        this.extraVy *= 0.93;

        // Pre-calculate rendering Y coordinates with parallax scroll offsets
        this.renderY = (this.y - scrollY * this.depth) % height;
        if (this.renderY < 0) this.renderY += height;

        // Mouse Repulsion Field (150px range, cubic curve falloff)
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.renderY; // Corrected: Compare against scroll-aware renderY position
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            const force = Math.pow(1 - dist / 150, 3) * 1.5;
            this.extraVx -= (dx / dist) * force;
            this.extraVy -= (dy / dist) * force;
          }
        }

        // Ripple acceleration logic
        for (let r = 0; r < ripplesPool.length; r++) {
          const ripple = ripplesPool[r];
          if (!ripple.active) continue;

          const dx = this.x - ripple.x;
          const dy = this.renderY - ripple.y; // Corrected: Compare against scroll-aware renderY position
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (Math.abs(dist - ripple.radius) < 20) {
            const force = (1 - dist / ripple.maxRadius) * 3;
            this.extraVx += (dx / dist) * force;
            this.extraVy += (dy / dist) * force;
          }
        }
      }

      draw() {
        const isDark = themeRef.current === 'dark';
        const renderY = this.renderY;
        const currentAlpha = this.alpha * (0.3 + Math.sin(this.twinklePhase) * 0.7);

        const landingHeight = height * 0.85;
        const scrollFactor = Math.min(1, scrollY / landingHeight);
        const scale = 1 - scrollFactor * 0.35; // Shrink particles up to 35% on scroll

        const renderRadius = ((isDark ? this.radius : this.radius * 1.2) * scale);
        const finalAlpha = Math.max(0.08, isDark ? currentAlpha : currentAlpha * 1.85);

        ctx.save();
        ctx.fillStyle = isDark 
          ? `rgba(255, 255, 255, ${finalAlpha})` 
          : `rgba(79, 70, 229, ${finalAlpha})`;
        
        if (this.radius >= 2.0) {
          ctx.shadowBlur = (isDark ? 8 : 4) * scale;
          ctx.shadowColor = isDark ? "#ffffff" : "rgba(79, 70, 229, 0.4)";
        }

        ctx.beginPath();
        ctx.arc(this.x, renderY, renderRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const initBackgroundElements = (recreateParticles = true) => {
      const colors = getThemeColors();

      if (orbs.length === 0) {
        orbs.push(new AuroraOrb(colors.primary, 0));
        orbs.push(new AuroraOrb(colors.secondary, 1));
        orbs.push(new AuroraOrb(colors.accent, 2));
      } else {
        if (orbs[0]) orbs[0].updateColors(colors.primary);
        if (orbs[1]) orbs[1].updateColors(colors.secondary);
        if (orbs[2]) orbs[2].updateColors(colors.accent);
      }

      if (recreateParticles) {
        particles = [];
        const count = Math.min(Math.floor((width * height) / 16000), 100);
        for (let i = 0; i < count; i++) {
          particles.push(new CosmicDust());
        }
      }
    };

    function drawConnections(landing: boolean) {
      if (!mouse.active) return;
      
      const isDark = themeRef.current === 'dark';
      const baseColor = isDark ? "129, 140, 248" : "79, 70, 229";

      const maxMouseDist = landing ? 240 : 160;
      const maxMouseDistSq = maxMouseDist * maxMouseDist;
      const maxStarDist = landing ? 140 : 80;
      const maxStarDistSq = maxStarDist * maxStarDist;

      ctx.save();
      ctx.lineWidth = 0.55;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const p1Y = p1.renderY;

        const dxMouse = mouse.x - p1.x;
        const dyMouse = mouse.y - p1Y;
        const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;

        if (distMouseSq < maxMouseDistSq) {
          const distMouse = Math.sqrt(distMouseSq);
          
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const p2Y = p2.renderY;

            const dxP = p2.x - p1.x;
            if (Math.abs(dxP) >= maxStarDist) continue;
            
            const dyP = p2Y - p1Y;
            if (Math.abs(dyP) >= maxStarDist) continue;

            const distPSq = dxP * dxP + dyP * dyP;

            if (distPSq < maxStarDistSq) {
              const dx2Mouse = mouse.x - p2.x;
              const dy2Mouse = mouse.y - p2Y;
              const dist2MouseSq = dx2Mouse * dx2Mouse + dy2Mouse * dy2Mouse;

              if (dist2MouseSq < maxMouseDistSq) {
                const dist2Mouse = Math.sqrt(dist2MouseSq);
                const distP = Math.sqrt(distPSq);
                const alpha = (1 - distP / maxStarDist) * (1 - Math.max(distMouse, dist2Mouse) / maxMouseDist) * 0.18;
                ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1Y);
                ctx.lineTo(p2.x, p2Y);
                ctx.stroke();
              }
            }
          }
        }
      }
      ctx.restore();
    }

    function drawGlobalConstellations(landing: boolean) {
      const isDark = themeRef.current === 'dark';
      const baseColor = isDark ? "129, 140, 248" : "79, 70, 229";

      const maxLineOpacity = landing ? 0.08 : 0.025;
      const maxDist = landing ? 320 : 150;
      const maxDistSq = maxDist * maxDist;
   
      ctx.save();
      ctx.lineWidth = 0.45;
   
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const p1Y = p1.renderY;
   
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const p2Y = p2.renderY;
   
          const dx = p2.x - p1.x;
          if (Math.abs(dx) >= maxDist) continue;
          
          const dy = p2Y - p1Y;
          if (Math.abs(dy) >= maxDist) continue;
   
          const distSq = dx * dx + dy * dy;
   
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * maxLineOpacity;
            ctx.strokeStyle = `rgba(${baseColor}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1Y);
            ctx.lineTo(p2.x, p2Y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    let animationFrameId: number;

    const animBackgroundLoop = () => {
      ctx.clearRect(0, 0, width, height);

      const landing = onLandingRef.current;

      for (let i = 0; i < ripplesPool.length; i++) {
        const ripple = ripplesPool[i];
        if (ripple.active) {
          ripple.update();
          ripple.draw();
        }
      }

      for (let i = 0; i < orbs.length; i++) {
        orbs[i].update();
        orbs[i].draw();
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      drawConnections(landing);
      drawGlobalConstellations(landing);

      animationFrameId = requestAnimationFrame(animBackgroundLoop);
    };

    const observer = new MutationObserver(() => initBackgroundElements(false));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    initBackgroundElements(true);
    animBackgroundLoop();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="bg-animation-canvas"
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full block"
      style={{ backgroundColor: 'var(--bg-void)' }}
    />
  );
}
