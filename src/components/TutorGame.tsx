import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, RefreshCw, Share2, Check } from 'lucide-react';

const COLS = 12;
const ROWS = 7;
const TOTAL_TARGETS = 5;

interface TutorGameProps {
  open: boolean;
  onClose: () => void;
}

/* ── :Tutor — hjkl motion golf ──
   Catch the $ with the block cursor in as few keystrokes as possible.
   Par = sum of Manhattan distances; beat it and you golf like a wizard. */
export default function TutorGame({ open, onClose }: TutorGameProps) {
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 6, y: 3 });
  const [strokes, setStrokes] = useState(0);
  const [par, setPar] = useState(0);
  const [caught, setCaught] = useState(0);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shared, setShared] = useState(false);
  const playerRef = useRef(player);
  playerRef.current = player;

  const spawnTarget = useCallback((from: { x: number; y: number }) => {
    let next = from;
    while (next.x === from.x && next.y === from.y) {
      next = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    }
    setTarget(next);
    setPar((p) => p + Math.abs(next.x - from.x) + Math.abs(next.y - from.y));
    return next;
  }, []);

  const resetGame = useCallback(() => {
    const start = { x: 0, y: 0 };
    setPlayer(start);
    setStrokes(0);
    setPar(0);
    setCaught(0);
    setFinished(false);
    spawnTarget(start);
  }, [spawnTarget]);

  useEffect(() => {
    if (open) resetGame();
  }, [open, resetGame]);

  useEffect(() => {
    if (!open) return;

    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (finished) {
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          e.stopPropagation();
          resetGame();
        }
        return;
      }
      const moves: Record<string, { dx: number; dy: number }> = {
        h: { dx: -1, dy: 0 },
        j: { dx: 0, dy: 1 },
        k: { dx: 0, dy: -1 },
        l: { dx: 1, dy: 0 }
      };
      const move = moves[e.key];
      if (!move) return;
      e.preventDefault();
      e.stopPropagation();

      setStrokes((s) => s + 1);
      setPlayer((prev) => {
        const next = {
          x: Math.max(0, Math.min(COLS - 1, prev.x + move.dx)),
          y: Math.max(0, Math.min(ROWS - 1, prev.y + move.dy))
        };
        return next;
      });
    };

    window.addEventListener('keydown', handleKeys, true);
    return () => window.removeEventListener('keydown', handleKeys, true);
  }, [open, finished, onClose, resetGame]);

  // Catch detection
  useEffect(() => {
    if (!open || finished) return;
    if (player.x === target.x && player.y === target.y) {
      setFlash(true);
      setTimeout(() => setFlash(false), 220);
      const nextCaught = caught + 1;
      setCaught(nextCaught);
      if (nextCaught >= TOTAL_TARGETS) {
        setFinished(true);
      } else {
        spawnTarget(player);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, open]);

  const copyScorecard = () => {
    const card = [
      `nvim://tutor — motion golf`,
      `⛳ ${strokes} strokes · par ${par} · ${verdict.label}`,
      `hjkl or it didn&apos;t happen → ${window.location.origin}`
    ].join(String.fromCharCode(10)).replace(/&apos;/g, String.fromCharCode(39));
    navigator.clipboard.writeText(card);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const verdict =
    strokes <= par
      ? { label: 'PERFECT GOLF', detail: 'Flawless motions. Your fingers are already Vim.', color: 'text-emerald-500 dark:text-emerald-400' }
      : strokes <= Math.ceil(par * 1.3)
        ? { label: 'EFFICIENT', detail: 'Sharp. A few wasted motions — count your jumps.', color: 'text-sky-500 dark:text-sky-400' }
        : { label: 'KEEP DRILLING', detail: 'hjkl wants to be muscle memory. Run it again.', color: 'text-amber-500 dark:text-amber-400' };

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="tutor-game" className="fixed inset-0 z-[60] flex items-center justify-center p-4 vt-overlay-exclude">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/70"
          />

          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="relative w-full max-w-xl rounded-2xl border border-zinc-200/60 dark:border-zinc-800/90 bg-white/98 dark:bg-zinc-950/98 shadow-2xl overflow-hidden font-mono select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200/60 dark:border-zinc-800/70 text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 text-[var(--phosphor)]" />
                <span>nvim://tutor — motion golf</span>
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px]">esc quits</kbd>
            </div>

            {/* Board */}
            <div className={`p-5 bg-zinc-50/50 dark:bg-black/40 transition-colors duration-200 ${flash ? 'bg-emerald-500/10 dark:bg-emerald-500/10' : ''}`}>
              {finished ? (
                <div className="h-[238px] flex flex-col items-center justify-center gap-3 text-center">
                  <div className={`text-2xl font-black tracking-widest ${verdict.color}`}>{verdict.label}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[36ch]">{verdict.detail}</div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-200 font-bold mt-2">
                    {strokes} keystrokes · par {par}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={resetGame}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-void)] text-xs font-bold cursor-pointer active:scale-95 transition-transform"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>replay (r)</span>
                    </button>
                    <button
                      onClick={copyScorecard}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:border-[var(--phosphor)] cursor-pointer transition-colors"
                    >
                      {shared ? <Check className="w-3.5 h-3.5 text-[var(--phosphor)]" /> : <Share2 className="w-3.5 h-3.5" />}
                      <span>{shared ? 'copied!' : 'share scorecard'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="grid gap-[3px] mx-auto w-fit"
                  style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: ROWS * COLS }).map((_, i) => {
                    const x = i % COLS;
                    const y = Math.floor(i / COLS);
                    const isPlayer = player.x === x && player.y === y;
                    const isTarget = target.x === x && target.y === y;
                    return (
                      <div
                        key={i}
                        className={`w-8 h-7 sm:w-9 sm:h-8 rounded-[3px] flex items-center justify-center text-sm font-black transition-colors duration-75 ${
                          isPlayer
                            ? 'bg-[var(--phosphor)] text-zinc-950 shadow-[0_0_14px_var(--phosphor)]'
                            : isTarget
                              ? 'bg-amber-400/15 text-amber-500 dark:text-amber-400 border border-amber-500/40'
                              : 'bg-zinc-200/40 dark:bg-zinc-900/60'
                        }`}
                      >
                        {isTarget && !isPlayer ? '$' : isPlayer ? '█' : ''}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Statusline */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-200/60 dark:border-zinc-800/70 text-[11px] font-bold">
              <span className="text-zinc-500 dark:text-zinc-400">
                move <kbd className="text-[var(--phosphor)]">h j k l</kbd> — catch the <span className="text-amber-500">$</span>
              </span>
              <span className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                <span>{caught}/{TOTAL_TARGETS} caught</span>
                <span>{strokes} strokes</span>
                <span className="opacity-60">par {par}</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
