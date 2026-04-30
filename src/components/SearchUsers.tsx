import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, X } from 'lucide-react';
import { searchUsers } from '../services/gemini';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface SearchUsersProps {
  onResults: (results: UserProfile[]) => void;
}

export function SearchUsers({ onResults }: SearchUsersProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await searchUsers(query);
      onResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch} className="relative">
        <div className="group relative flex items-center">
          <div className="absolute left-4 text-white/40 transition-colors group-focus-within:text-white">
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <User size={20} />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar amigos pelo nome ou @..."
            className="h-12 w-full rounded-full bg-white/10 pl-12 pr-4 text-sm font-medium text-white outline-none ring-1 ring-transparent transition-all placeholder:text-white/40 hover:bg-white/15 focus:bg-white/20 focus:ring-white/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
