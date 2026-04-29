'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CommentType = {
  id: string;
  content: string;
  createdAt: string;
  userName: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name: string) {
  return name
    .split(/[\s@._-]+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  'bg-cyan-500/20 text-cyan-300',
  'bg-violet-500/20 text-violet-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
];

function avatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function CommentSection({
  itemId,
  initialComments,
}: {
  itemId: string;
  initialComments: CommentType[];
}) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { setError('Please enter a comment.'); return; }

    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/items/${itemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to add comment.'); return; }
      setComments((cur) => [data.comment, ...cur]);
      setContent('');
      setFocused(false);
      router.refresh();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-xl font-semibold text-white">Comments</h2>
        {comments.length > 0 && (
          <span className="rounded-full bg-cyan-400/10 px-2.5 py-0.5 text-xs font-medium text-cyan-300">
            {comments.length}
          </span>
        )}
      </div>

      {/* Compose box */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div
          className={`relative rounded-[20px] border bg-neutral-950/60 transition-all duration-200 ${
            focused
              ? 'border-cyan-400/40 shadow-[0_0_0_4px_rgba(34,211,238,0.06)]'
              : 'border-white/10'
          }`}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={focused || content ? 4 : 2}
            placeholder="Add a comment…"
            className="w-full resize-none bg-transparent px-5 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none"
          />

          {/* Bottom bar — only visible when focused or has content */}
          {(focused || content) && (
            <div className="flex items-center justify-between border-t border-white/8 px-4 py-3">
              <span className="text-xs text-white/30">
                {content.length > 0 ? `${content.length} chars` : 'Be helpful & specific'}
              </span>
              <div className="flex items-center gap-2">
                {content && (
                  <button
                    type="button"
                    onClick={() => { setContent(''); setFocused(false); }}
                    className="rounded-xl px-3 py-1.5 text-xs text-white/50 transition hover:text-white/80"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-cyan-400 px-4 text-xs font-semibold text-neutral-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border border-neutral-800 border-t-transparent" />
                      Posting
                    </>
                  ) : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 px-1 text-xs text-rose-400">{error}</p>
        )}
      </form>

      {/* Comment list */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-white/10 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl">
            💬
          </div>
          <p className="text-sm text-white/40">No comments yet. Start the conversation.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {comments.map((comment, i) => (
            <li key={comment.id}>
              <div className="group flex gap-3 rounded-[20px] p-3 transition hover:bg-white/[0.03]">

                {/* Avatar */}
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(comment.userName)}`}
                >
                  {initials(comment.userName)}
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium text-white">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-white/35">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/65">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* Divider — skip after last */}
              {i < comments.length - 1 && (
                <div className="mx-3 border-t border-white/5" />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}