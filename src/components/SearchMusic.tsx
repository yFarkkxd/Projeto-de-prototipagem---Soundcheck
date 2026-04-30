import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, History, X, Trash2 } from 'lucide-react';
import { searchMusic } from '../services/gemini';
import { Album } from '../types';
import { cn } from '../lib/utils';

interface SearchMusicProps {
  onResults: (results: Album[]) => void;
}

export function SearchMusic({ onResults }: SearchMusicProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('soundcheck_search_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('soundcheck_search_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToHistory = (newQuery: string) => {
    const trimmed = newQuery.trim();
    if (!trimmed) return;

    const newHistory = [
      trimmed,
      ...history.filter(h => h.toLowerCase() !== trimmed.toLowerCase())
    ].slice(0, 10);

    setHistory(newHistory);
  };

  const handleSearch = async (e?: React.FormEvent, searchOverride?: string) => {
    if (e) e.preventDefault();
    const searchQuery = searchOverride || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowHistory(false);
    saveToHistory(searchQuery);
    
    try {
      const results = await searchMusic(searchQuery);
      onResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromHistory = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== item);
    setHistory(newHistory);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={(e) => handleSearch(e)} className="relative">
        <div className="group relative flex items-center">
          <div className="absolute left-4 text-white/40 transition-colors group-focus-within:text-white">
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            placeholder="O que você quer ouvir?"
            className="h-12 w-full rounded-full bg-white/10 pl-12 pr-4 text-sm font-medium text-white outline-none ring-1 ring-transparent transition-all placeholder:text-white/40 hover:bg-white/15 focus:bg-white/20 focus:ring-white/20"
          />
        </div>
      </form>

      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-2 backdrop-blur-xl shadow-2xl">
          <div className="mb-2 flex items-center justify-between px-3 py-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Buscas Recentes</span>
            <button 
              onClick={clearHistory}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-purple-500 hover:text-purple-400"
            >
              <Trash2 size={10} /> Limpar
            </button>
          </div>
          <div className="space-y-1">
            {history.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  setQuery(item);
                  handleSearch(undefined, item);
                }}
                className="group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-3 text-white/60 group-hover:text-white">
                  <History size={16} className="text-white/20" />
                  <span className="text-sm">{item}</span>
                </div>
                <button
                  onClick={(e) => removeFromHistory(e, item)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 text-white/20 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
