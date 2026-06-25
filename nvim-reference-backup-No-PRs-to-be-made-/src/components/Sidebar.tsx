import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Layers, Cpu, Terminal, X, ArrowUpRight } from 'lucide-react';
import { Chapter, SearchRecord } from '../types';
import { VimMode } from './VimStatusLine';

interface SidebarProps {
  chapters: Chapter[];
  activeChapterId: string;
  onNavigateChapter: (chapterId: string) => void;
  vimMode?: VimMode;
  setVimMode?: (mode: VimMode) => void;
  siteTitle?: string;
}

export default function Sidebar({ chapters, activeChapterId, onNavigateChapter, vimMode = 'normal', setVimMode, siteTitle = 'nvim://reference' }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Parse sections beautifully for sidebar branding
  const sections = useMemo(() => {
    return [
      { title: '01. Cognitive Onboarding', start: 1, end: 3, icon: BookOpen },
      { title: '02. Environmental Setup', start: 4, end: 7, icon: Cpu },
      { title: '03. Core Mechanics', start: 8, end: 15, icon: Layers },
      { title: '04. IDE Synthesis', start: 16, end: 22, icon: Terminal },
    ];
  }, []);

  // Build client-side index for fast fuzzy text searching
  const searchIndex = useMemo(() => {
    const list: SearchRecord[] = [];
    chapters.forEach((ch) => {
      // Add Chapter title itself
      list.push({
        id: `ch-${ch.id}`,
        chapterId: ch.id,
        chapterNum: ch.num,
        chapterTitle: ch.title,
        title: `Chapter ${ch.num}`,
        text: ch.title + ' ' + ch.description,
        elementIdToScroll: ch.id
      });

      // Add sub section contents
      ch.sections.forEach((sec) => {
        list.push({
          id: sec.id,
          chapterId: ch.id,
          chapterNum: ch.num,
          chapterTitle: ch.title,
          title: sec.title,
          text: (sec.content || '') + ' ' + (sec.extraData ? JSON.stringify(sec.extraData) : ''),
          elementIdToScroll: sec.id
        });
      });
    });
    return list;
  }, [chapters]);

  // Handle fuzzy searching
  const filteredResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return searchIndex
      .filter((item) => item.text.toLowerCase().includes(query) || item.title.toLowerCase().includes(query))
      .slice(0, 5);
  }, [searchQuery, searchIndex]);

  const handleResultClick = (targetId: string, elementIdToScroll: string) => {
    onNavigateChapter(targetId);
    setShowResults(false);
    setSearchQuery('');

    // Smooth scroll with small delay to ensure rendering completion
    setTimeout(() => {
      const el = document.getElementById(elementIdToScroll);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Trigger highlight flash
        el.classList.add('search-flash-highlight');
        setTimeout(() => {
          el.classList.remove('search-flash-highlight');
        }, 2200);
      }
    }, 100);
  };

  // Auto scroll active chapter button into view inside sidebar
  useEffect(() => {
    const activeButton = document.getElementById(`sidebar-ch-${activeChapterId}`);
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeChapterId]);

  // Keyboard binding inside searching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input-box');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mode Color helper
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
    <aside className="w-full h-full flex flex-col overflow-hidden select-none bg-transparent">
      
      {/* Brand logo header with mobile top-padding buffer */}
      <div className="p-6 pt-12 xl:pt-6 border-b border-zinc-200/50 dark:border-zinc-800/50 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div>
            <span className="font-mono font-black tracking-tighter text-zinc-900 dark:text-zinc-50 text-lg md:text-[1.25rem]">
              {(() => {
                const idx = siteTitle.indexOf('://');
                if (idx !== -1) {
                  return (
                    <>
                      {siteTitle.slice(0, idx + 3)}
                      <span className="transition-colors duration-300" style={{ color: modeColor }}>
                        {siteTitle.slice(idx + 3)}
                      </span>
                    </>
                  );
                }
                return <span className="transition-colors duration-300" style={{ color: modeColor }}>{siteTitle}</span>;
              })()}
            </span>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 tracking-wider font-semibold mt-0.5">One reference to rule them all</div>
          </div>
        </div>

        {/* Searching Interface */}
        <div className="relative mt-2">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="search-input-box"
            type="text"
            placeholder="/"
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onChange={(e) => {
              const val = e.target.value;
              if (val.endsWith('jk')) {
                if (setVimMode) setVimMode('normal');
                setSearchQuery('');
                setShowResults(false);
                document.getElementById('search-input-box')?.blur();
              } else {
                setSearchQuery(val);
                setShowResults(true);
              }
            }}
            className="w-full pl-9 pr-8 py-2 font-mono text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/30 dark:border-zinc-800 rounded-lg outline-none transition-all duration-300"
            style={{
              borderColor: isFocused ? modeColor : '',
              boxShadow: isFocused ? `${modeColor}20 0 0 0 3px` : '',
              caretColor: '#22c55e'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Fuzzy overlay panels results */}
          {showResults && searchQuery && (
            <div className="absolute top-[110%] left-0 w-full rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xl p-2 z-40 max-h-[300px] overflow-y-auto space-y-1 text-xs">
              {filteredResults.length === 0 ? (
                <div className="p-3 text-zinc-400 dark:text-zinc-500 font-mono text-center">
                  No structures found.
                </div>
              ) : (
                filteredResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleResultClick(item.chapterId, item.elementIdToScroll)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:border-indigo-500/20 group transition-all"
                  >
                    <div className="text-[10px] font-mono flex items-center justify-between" style={{ color: modeColor }}>
                      <span>CHAPTER {item.chapterNum}</span>
                      <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{item.title}</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-500 line-clamp-1 mt-0.5">{item.text}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table of contents indices links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar xl:max-h-[calc(100vh-210px)]">
        {sections.map((sect) => (
          <div key={sect.title} className="space-y-2">
            <div className="flex items-center gap-1.5 px-3.5 mb-1.5">
              <sect.icon className="w-3.5 h-3.5 transition-colors duration-300" style={{ color: modeColor }} />
              <span className="text-xs font-mono font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest">{sect.title}</span>
            </div>
            <ul className="space-y-0.5">
              {chapters
                .filter((ch) => ch.num >= sect.start && ch.num <= sect.end)
                .map((ch) => {
                  const isActive = activeChapterId === ch.id;
                  
                  // Dynamic Vim Mode styles for active items
                  const activeClassMap = {
                    normal: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold shadow-md shadow-indigo-500/5',
                    insert: 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300 font-bold shadow-md shadow-amber-500/5',
                    visual: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold shadow-md shadow-emerald-500/5',
                    command: 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300 font-bold shadow-md shadow-rose-500/5'
                  };

                  const activeClass = activeClassMap[vimMode] || activeClassMap.normal;

                  return (
                    <li key={ch.id}>
                      <button
                        id={`sidebar-ch-${ch.id}`}
                        onClick={() => {
                          onNavigateChapter(ch.id);
                          const el = document.getElementById(ch.id);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`w-full text-left px-3.5 py-2 rounded-lg flex items-center gap-2.5 font-mono text-sm transition-all duration-300 border hover:translate-x-[2px] transform ${
                          isActive
                            ? activeClass
                            : 'hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
                        }`}
                      >
                        <span className="opacity-45">ch.{String(ch.num).padStart(2, '0')}</span>
                        <span className="truncate">{ch.title.split(':')[0]}</span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

    </aside>
  );
}
