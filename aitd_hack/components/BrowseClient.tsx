'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type BrowseItem = {
  id: string;
  title: string;
  location: string;
  description: string;
  category: string;
  type: 'LOST' | 'FOUND';
  status: string;
  createdAt: string;
  lostDate: string;
  lostTime: string;
  images: string[];
  author: string;
  isOwner: boolean;
};

type Props = {
  items: BrowseItem[];
  currentUserId: string;
};

const CATEGORIES = ['All', 'Electronics', 'Bags', 'Accessories', 'Documents', 'Keys', 'Other'];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function BrowseClient({ items }: Props) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (categoryFilter !== 'All' && item.category !== categoryFilter.toUpperCase()) return false;
      if (q) {
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, typeFilter, categoryFilter, search]);

  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const foundCount = items.filter((i) => i.type === 'FOUND').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/8 bg-neutral-950/80 px-5 py-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h1 className="text-base font-semibold">Browse All Items</h1>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Page title + stats */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Community</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Lost &amp; Found Board</h2>
          <p className="mt-2 text-sm text-white/50">
            Browse all items reported by the community. Filter by type or search by keyword.
          </p>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-white/70">{lostCount} Lost</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white/70">{foundCount} Found</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="text-white/70">{items.length} Total</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Type tabs */}
          <div className="flex rounded-2xl border border-white/10 bg-white/4 p-1">
            {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
              <button
                key={t}
                id={`browse-filter-${t.toLowerCase()}`}
                onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  typeFilter === t
                    ? t === 'LOST'
                      ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/30'
                      : t === 'FOUND'
                        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {t === 'LOST' && <span className="h-2 w-2 rounded-full bg-red-400" />}
                {t === 'FOUND' && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                {t === 'ALL' ? 'All Items' : t === 'LOST' ? 'Lost' : 'Found'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="browse-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, location, author…"
              className="h-11 w-full rounded-2xl border border-white/10 bg-neutral-900/60 pl-10 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`browse-cat-${cat.toLowerCase()}`}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                categoryFilter === cat
                  ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-300'
                  : 'border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count banner */}
        <div className="mb-4 flex items-center justify-between text-sm text-white/40">
          <span>
            Showing <span className="text-white/70 font-medium">{filtered.length}</span> item
            {filtered.length !== 1 ? 's' : ''}
            {typeFilter !== 'ALL' && (
              <span className={typeFilter === 'LOST' ? ' text-red-400' : ' text-emerald-400'}>
                {' '}({typeFilter})
              </span>
            )}
          </span>
          {(typeFilter !== 'ALL' || categoryFilter !== 'All' || search) && (
            <button
              onClick={() => { setTypeFilter('ALL'); setCategoryFilter('All'); setSearch(''); }}
              className="text-xs text-white/40 underline hover:text-white/70"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/3 py-20 text-center">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="mt-4 text-sm text-white/40">No items match your filters.</p>
            <button
              onClick={() => { setTypeFilter('ALL'); setCategoryFilter('All'); setSearch(''); }}
              className="mt-3 text-xs text-cyan-400 underline hover:no-underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <article
                key={item.id}
                id={`browse-item-${item.id}`}
                onClick={() => router.push(`/dashboard/posts/${item.id}`)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[24px] border transition-all duration-200 ${
                  item.type === 'LOST'
                    ? 'border-red-400/15 bg-neutral-900/70 hover:border-red-400/40 hover:bg-neutral-900'
                    : 'border-emerald-400/15 bg-neutral-900/70 hover:border-emerald-400/40 hover:bg-neutral-900'
                } ${hoveredId === item.id ? 'shadow-xl shadow-black/30' : ''}`}
              >
                {/* Image */}
                {item.images.length > 0 ? (
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />
                    {item.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white/70">
                        +{item.images.length - 1} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-white/3">
                    <svg viewBox="0 0 24 24" className="h-10 w-10 text-white/10" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}

                {/* Body */}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  {/* Type + Category badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        item.type === 'LOST'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="rounded-full bg-white/6 px-2.5 py-0.5 text-[10px] text-white/50">
                      {item.category}
                    </span>
                    {item.isOwner && (
                      <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] text-cyan-300">
                        Yours
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-sm font-semibold text-white leading-snug">
                    {item.title}
                  </h3>

                  {item.location && (
                    <p className="flex items-center gap-1 text-xs text-white/45">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21c-4-4-7-7.5-7-11a7 7 0 0 1 14 0c0 3.5-3 7-7 11z" />
                        <circle cx="12" cy="10" r="2" />
                      </svg>
                      {item.location}
                    </p>
                  )}

                  <p className="line-clamp-2 text-xs leading-5 text-white/45">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-white/35">
                    <span className="truncate max-w-[60%]">by {item.author}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
