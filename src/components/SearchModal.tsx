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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-gray-200 px-4">
          <span id="search-dialog-title" className="sr-only">Search projects</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects..."
            className="flex-1 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset"
            aria-label="Search projects"
            autoComplete="off"
          />
          <kbd className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600" aria-hidden>Esc</kbd>
        </div>
        <ul ref={listRef} className="max-h-80 overflow-auto py-2" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-gray-600" role="option" aria-selected="false">
              No projects found matching &quot;{query}&quot;. Try adjusting your filters.
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
                  className={`flex w-full flex-col gap-0.5 px-4 py-2 text-left focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset ${
                    i === selected ? 'bg-secondary/10' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium text-primary">{p.title}</span>
                  <span className="text-xs text-gray-500">
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
