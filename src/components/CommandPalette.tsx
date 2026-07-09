import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, CornerDownLeft, BookOpen } from 'lucide-react';
import { Chapter } from '../types';

interface PaletteRecord {
  id: string;
  chapterId: string;
  chapterNum: number;
  chapterTitle: string;
  title: string;
  text: string;
  elementIdToScroll: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  chapters: Chapter[];
  onNavigateChapter: (chapterId: string) => void;
}

/* Subsequence fuzzy match à la Telescope: returns score + matched indices, or null.
   Consecutive hits and word-boundary hits score higher; earlier matches win ties. */
function fuzzyMatch(query: string, target: string): { score: number; indices: number[] } | null {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return { score: 0, indices: [] };

  const indices: number[] = [];
  let ti = 0;
  let score = 0;
  let streak = 0;

  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    let found = -1;
    while (ti < t.length) {
      if (t[ti] === ch) { found = ti; break; }
      ti++;
    }
    if (found === -1) return null;

    const prevChar = found > 0 ? t[found - 1] : ' ';
    const isBoundary = prevChar === ' ' || prevChar === '.' || prevChar === '-' || prevChar === '_' || prevChar === ':';
    streak = indices.length > 0 && indices[indices.length - 1] === found - 1 ? streak + 1 : 0;

    score += 10 + streak * 8 + (isBoundary ? 12 : 0) - Math.min(found, 40) * 0.15;
    indices.push(found);
    ti = found + 1;
  }
  return { score, indices };
}

function HighlightMatch({ text, indices, className }: { text: string; indices: number[]; className?: string }) {
  if (indices.length === 0) return <span className={className}>{text}</span>;
  const set = new Set(indices);
  return (
    <span className={className}>
      {text.split('').map((ch, i) =>
        set.has(i)
          ? <span key={i} className="text-[var(--phosphor)] font-bold">{ch}</span>
          : <span key={i}>{ch}</span>
      )}
    </span>
  );
}

export default function CommandPalette({ open, onClose, chapters, onNavigateChapter }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Flatten chapters + sections into searchable records once
  const records = useMemo<PaletteRecord[]>(() => {
    const list: PaletteRecord[] = [];
    chapters.forEach((ch) => {
      list.push({
        id: `ch-${ch.id}`,
        chapterId: ch.id,
        chapterNum: ch.num,
        chapterTitle: ch.title,
        title: ch.title,
        text: ch.description,
        elementIdToScroll: ch.id
      });
      ch.sections.forEach((sec) => {
        list.push({
          id: sec.id,
          chapterId: ch.id,
          chapterNum: ch.num,
          chapterTitle: ch.title,
          title: sec.title,
          text: (sec.content || sec.description || '').slice(0, 220),
          elementIdToScroll: sec.id
        });
      });
    });
    return list;
  }, [chapters]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) {
      // Empty query: chapter index, in order
      return records
        .filter((r) => r.id.startsWith('ch-'))
        .map((r) => ({ record: r, indices: [] as number[] }));
    }
    return records
      .map((r) => {
        const m = fuzzyMatch(q, r.title) || fuzzyMatch(q, `${r.chapterNum} ${r.chapterTitle} ${r.text}`);
        const titleMatch = fuzzyMatch(q, r.title);
        return m ? { record: r, score: m.score + (titleMatch ? 20 : 0), indices: titleMatch ? titleMatch.indices : [] } : null;
      })
      .filter((x): x is { record: PaletteRecord; score: number; indices: number[] } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [query, records]);

  const selected = results[Math.min(selectedIdx, results.length - 1)];

  // Reset + focus when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Escape must close the palette even if focus has wandered outside the panel
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape, true);
    return () => window.removeEventListener('keydown', closeOnEscape, true);
  }, [open, onClose]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Keep the active row scrolled into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx, results]);

  const jumpTo = (record: PaletteRecord) => {
    onClose();
    onNavigateChapter(record.chapterId);
    setTimeout(() => {
      const el = document.getElementById(record.elementIdToScroll);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('search-flash-highlight');
        setTimeout(() => el.classList.remove('search-flash-highlight'), 2200);
      }
    }, 80);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const down = e.key === 'ArrowDown' || (e.ctrlKey && (e.key === 'j' || e.key === 'n'));
    const up = e.key === 'ArrowUp' || (e.ctrlKey && (e.key === 'k' || e.key === 'p'));
    if (down) {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (up) {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selected) jumpTo(selected.record);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="command-palette"
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[14vh] px-4 vt-overlay-exclude"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
          />

          {/* Palette panel */}
          <motion.div
            initial={{ scale: 0.97, y: -12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: -12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            className="relative w-full max-w-3xl rounded-2xl border border-zinc-200/60 dark:border-zinc-800/90 bg-white/98 dark:bg-zinc-950/98 shadow-2xl overflow-hidden font-mono"
            onKeyDown={handleKeyDown}
          >
            {/* Header: telescope-style prompt */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/60 dark:border-zinc-800/70 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 select-none">
              <span>telescope://jump_to_chapter</span>
              <span className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px]">↑↓ / ^j ^k</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px]">↵ jump</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px]">esc</kbd>
              </span>
            </div>

            {/* Search input */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/70">
              <span className="text-[var(--phosphor)] font-black select-none">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Fuzzy find chapters, sections, concepts…"
                className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
                style={{ caretColor: 'var(--phosphor)' }}
              />
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] max-h-[46vh]">
              {/* Results list */}
              <div ref={listRef} className="overflow-y-auto no-scrollbar py-2">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
                    E486: Pattern not found: {query}
                  </div>
                ) : (
                  results.map((res, i) => {
                    const isActive = i === Math.min(selectedIdx, results.length - 1);
                    return (
                      <button
                        key={res.record.id}
                        data-active={isActive ? 'true' : 'false'}
                        onClick={() => jumpTo(res.record)}
                        onMouseEnter={() => setSelectedIdx(i)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-xs transition-colors duration-100 cursor-pointer ${
                          isActive
                            ? 'bg-zinc-100 dark:bg-zinc-900/80 text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        <span className={`shrink-0 w-1 self-stretch rounded ${isActive ? 'bg-[var(--phosphor)]' : 'bg-transparent'}`} />
                        <span className="shrink-0 text-[10px] font-bold opacity-60 w-10">ch.{String(res.record.chapterNum).padStart(2, '0')}</span>
                        <HighlightMatch
                          text={res.record.title}
                          indices={res.indices}
                          className="truncate flex-1 font-semibold"
                        />
                        {isActive && <CornerDownLeft className="w-3 h-3 shrink-0 opacity-50" />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Preview pane */}
              <div className="hidden md:block border-l border-zinc-200/60 dark:border-zinc-800/70 p-4 overflow-y-auto no-scrollbar bg-zinc-50/60 dark:bg-zinc-900/25">
                {selected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--phosphor)]" />
                      <span>Chapter {selected.record.chapterNum} — preview</span>
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug font-sans">
                      {selected.record.chapterTitle}
                    </div>
                    {selected.record.title !== selected.record.chapterTitle && (
                      <div className="text-xs font-bold text-[var(--phosphor)]">§ {selected.record.title}</div>
                    )}
                    <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-sans line-clamp-6">
                      {selected.record.text}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-600">
                    ~ empty preview ~
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
