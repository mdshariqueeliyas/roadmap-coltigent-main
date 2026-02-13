'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Fuse from 'fuse.js';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import type { Project } from '@/lib/types';

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useData();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const fuse = useMemo(() => {
    if (!data?.projects?.length) return null;
    return new Fuse(data.projects, {
      keys: [
        { name: 'title', weight: 1.0 },
        { name: 'id', weight: 0.8 },
        { name: 'tags', weight: 0.6 },
        { name: 'owner', weight: 0.4 },
        { name: 'body', weight: 0.2 },
      ],
      threshold: 0.3,
    });
  }, [data?.projects]);

  const results = useMemo(() => {
    if (!query.trim() || !fuse) return data?.projects?.slice(0, 8) ?? [];
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, data?.projects]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const child = el.children[selected] as HTMLElement;
    child?.scrollIntoView({ block: 'nearest' });
  }, [selected, results.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter' && results[selected]) {
        e.preventDefault();
        router.push(`/projects/${results[selected].slug}/`);
        onClose();
      }
    },
    [onClose, results, selected, router]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-dialog-title"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 backdrop-blur-sm pt-[18vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-elevated overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <span id="search-dialog-title" className="sr-only">Search projects</span>
          <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects..."
            className="flex-1 bg-transparent py-2 text-base font-medium text-slate-800 placeholder:text-slate-400 outline-none focus-visible:ring-0"
            aria-label="Search projects"
            autoComplete="off"
          />
          <kbd className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono text-slate-500" aria-hidden>Esc</kbd>
        </div>
        <ul ref={listRef} className="max-h-80 overflow-auto py-2" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-slate-500" role="option" aria-selected="false">
              No projects found matching &quot;{query}&quot;. Try adjusting your search.
            </li>
          ) : (
            results.map((p: Project, i: number) => (
              <li key={p.id} role="option" aria-selected={i === selected}>
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/projects/${p.slug}/`);
                    onClose();
                  }}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex w-full flex-col gap-0.5 px-5 py-3 text-left transition-colors ${
                    i === selected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold text-slate-800">{p.title}</span>
                  <span className="text-xs text-slate-500">
                    {p.id} · {p.matrix?.quadrant ?? p.status}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
