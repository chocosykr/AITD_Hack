'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MyItem, Match } from '@/app/my-items/page';

type Props = { items: MyItem[] };

function pad(n: number) {
  return n.toString().padStart(2, '0');
}
function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function SimilarityBar({ pct }: { pct: number }) {
  const color =
    pct >= 90 ? 'bg-emerald-400' : pct >= 75 ? 'bg-cyan-400' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs font-semibold text-white/70">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function MatchCard({ match, router }: { match: Match; router: ReturnType<typeof useRouter> }) {
  return (
    <div
      onClick={() => router.push(`/dashboard/posts/${match.id}`)}
      className="group flex cursor-pointer gap-3 rounded-2xl border border-white/8 bg-white/3 p-3 transition hover:border-cyan-400/30 hover:bg-white/6"
    >
      {/* Thumbnail */}
      {match.imageUrl ? (
        <img
          src={match.imageUrl}
          alt={match.title}
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/5">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
              match.type === 'FOUND'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {match.type}
          </span>
          <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] text-white/40">
            {match.category}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-white">{match.title}</p>
        {match.location && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-white/40">
            <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21c-4-4-7-7.5-7-11a7 7 0 0 1 14 0c0 3.5-3 7-7 11z" />
              <circle cx="12" cy="10" r="2" />
            </svg>
            {match.location}
          </p>
        )}
        <div className="mt-2">
          <SimilarityBar pct={match.similarity} />
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item, router }: { item: MyItem; router: ReturnType<typeof useRouter> }) {
  const [expanded, setExpanded] = useState(false);
  const hasMatches = item.matches.length > 0;

  return (
    <div
      className={`overflow-hidden rounded-[24px] border transition-all duration-200 ${
        item.type === 'LOST'
          ? 'border-red-400/15 bg-neutral-900/80'
          : 'border-emerald-400/15 bg-neutral-900/80'
      }`}
    >
      {/* Item header — clickable to go to detail */}
      <div
        onClick={() => router.push(`/dashboard/posts/${item.id}`)}
        className="flex cursor-pointer gap-4 p-4 transition hover:bg-white/3"
      >
        {/* Image */}
        {item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/4">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                item.type === 'LOST'
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {item.type}
            </span>
            <span className="rounded-full bg-white/6 px-2.5 py-0.5 text-[10px] text-white/45">
              {item.category}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] ${
              item.status === 'ACTIVE'
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'bg-white/8 text-white/40'
            }`}>
              {item.status}
            </span>
            {!item.hasEmbedding && (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] text-amber-300">
                No AI data
              </span>
            )}
          </div>

          <h3 className="mt-2 text-base font-semibold text-white leading-snug">{item.title}</h3>

          <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/40">
            {item.location && (
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21c-4-4-7-7.5-7-11a7 7 0 0 1 14 0c0 3.5-3 7-7 11z" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
                {item.location}
              </span>
            )}
            <span>{formatDate(item.lostDate || item.createdAt)}</span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{item.description}</p>
        </div>
      </div>

      {/* AI Matches section */}
      <div className={`border-t border-white/6 ${hasMatches ? '' : 'opacity-60'}`}>
        <button
          onClick={() => setExpanded((v) => !v)}
          disabled={!hasMatches && item.hasEmbedding}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-white/3"
        >
          <div className="flex items-center gap-2">
            {/* Sparkle icon */}
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <span className="text-sm font-medium text-white/80">AI Matches</span>
            {hasMatches ? (
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                {item.matches.length} found &gt;60%
              </span>
            ) : item.hasEmbedding ? (
              <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-[10px] text-white/40">
                No matches above 60%
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] text-amber-300/70">
                Requires AI embedding
              </span>
            )}
          </div>

          {hasMatches && (
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 text-white/40 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </button>

        {expanded && hasMatches && (
          <div className="space-y-2 px-4 pb-4">
            <p className="mb-2 text-[11px] text-white/30">
              Sorted by visual similarity — closest match first
            </p>
            {item.matches.map((match) => (
              <MatchCard key={match.id} match={match} router={router} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyItemsClient({ items }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'LOST' | 'FOUND'>('LOST');

  const lostItems = items.filter((i) => i.type === 'LOST');
  const foundItems = items.filter((i) => i.type === 'FOUND');
  const displayed = tab === 'LOST' ? lostItems : foundItems;

  const totalMatches = items.reduce((acc, i) => acc + i.matches.length, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/8 bg-neutral-950/80 px-5 py-4 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold">My Items</h1>
            <p className="text-[11px] text-white/40">Your reports + AI match suggestions</p>
          </div>
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

      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        {/* Stats banner */}
        <div className="mb-8 rounded-[24px] border border-white/8 bg-gradient-to-r from-cyan-500/8 to-emerald-500/8 p-5">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-white/40">Lost Items</p>
              <p className="text-2xl font-bold text-red-300">{lostItems.length}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Found Items</p>
              <p className="text-2xl font-bold text-emerald-300">{foundItems.length}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">AI Matches Found</p>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
                <p className="text-2xl font-bold text-cyan-300">{totalMatches}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-white/40">Threshold</p>
              <p className="text-2xl font-bold text-white/60">&gt;60%</p>
            </div>
          </div>
          {totalMatches > 0 && (
            <p className="mt-3 text-xs text-cyan-300/60">
              ✨ AI found potential matches based on visual similarity of your items&apos; images (DINOv2 embeddings).
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/4 p-1">
          <button
            id="my-items-tab-lost"
            onClick={() => setTab('LOST')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
              tab === 'LOST'
                ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/30'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Lost Items
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{lostItems.length}</span>
          </button>
          <button
            id="my-items-tab-found"
            onClick={() => setTab('FOUND')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
              tab === 'FOUND'
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Found Items
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{foundItems.length}</span>
          </button>
        </div>

        {/* Item list */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/3 py-16 text-center">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-white/15" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M9 9h6M9 12h6M9 15h4" />
            </svg>
            <p className="mt-4 text-sm text-white/40">
              No {tab.toLowerCase()} items yet.
            </p>
            <Link
              href="/dashboard"
              className="mt-3 text-xs text-cyan-400 underline hover:no-underline"
            >
              Report one from the dashboard →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((item) => (
              <ItemCard key={item.id} item={item} router={router} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
