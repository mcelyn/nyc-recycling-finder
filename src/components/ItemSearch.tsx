'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { RecyclingItem } from '@/types/recycling';
import { Search, X, Sparkles, ChevronRight } from 'lucide-react';

interface ItemSearchProps {
  items: RecyclingItem[];
  selectedItem: RecyclingItem | null;
  onSelectItem: (item: RecyclingItem | null) => void;
  embedded?: boolean;
}

export default function ItemSearch({
  items,
  selectedItem,
  onSelectItem,
  embedded = false,
}: ItemSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: ['name', 'aliases', 'category', 'disposalSummary'],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [items]);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return items.slice(0, 6); // Popular default suggestions
    }
    return fuse.search(query).map((res) => res.item);
  }, [query, fuse, items]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: RecyclingItem) => {
    onSelectItem(item);
    setQuery(item.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onSelectItem(null);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${embedded ? '' : 'max-w-2xl'}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search everyday items (e.g., nail polish, battery, laptop, paint)..."
          className={`w-full pl-10 pr-9 py-3 text-slate-800 placeholder-slate-400 text-sm focus:outline-none transition-all ${
            embedded
              ? 'bg-transparent'
              : 'bg-white border border-slate-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent py-3.5 pl-12 pr-10'
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              {query.trim()
                ? `Results for "${query}"`
                : 'Commonly Searched Household Items'}
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
              Everyday Language
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-3 text-left hover:bg-emerald-50/60 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-800 group-hover:text-emerald-900">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {item.disposalSummary}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0 ml-2" />
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                No matching item found. Try searching for a broader term like &quot;electronics&quot;, &quot;battery&quot;, or &quot;paint&quot;.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
