'use client';

import React, { useRef } from 'react';

export type CreatePostModalProps = {
  open: boolean;
  postType?: 'LOST' | 'FOUND';
  title: string;
  location: string;
  description: string;
  lostDate: string;      // new
  lostTime: string;      // new
  category: string;
  categories: string[];
  imageNames: string[];
  error: string;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLostDateChange: (value: string) => void;  // new
  onLostTimeChange: (value: string) => void;  // new
  onCategoryChange: (value: string) => void;
  onImageChange: (files: FileList | null) => void;
  onRemoveImage: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function CreatePostModal({
  open,
  postType = 'LOST',
  title,
  location,
  description,
  lostDate,
  lostTime,
  category,
  categories,
  imageNames,
  error,
  onClose,
  onTitleChange,
  onLocationChange,
  onDescriptionChange,
  onLostDateChange,
  onLostTimeChange,
  onCategoryChange,
  onImageChange,
  onRemoveImage,
  onSubmit,
}: CreatePostModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/10 bg-neutral-900 shadow-2xl shadow-cyan-950/30">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-neutral-900/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
              Create post
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {postType === 'FOUND' ? 'Found item report' : 'Lost item report'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close create post modal"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          {/* Title + Location */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Post title
              </label>
              <input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={postType === 'FOUND' ? 'Ex: Found black backpack near station' : 'Ex: Lost black backpack near station'}
                className="h-12 w-full rounded-2xl border border-white/10 bg-neutral-950/70 px-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder={postType === 'FOUND' ? 'Where was it found?' : 'Where was it lost?'}
                className="h-12 w-full rounded-2xl border border-white/10 bg-neutral-950/70 px-4 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Lost date + Lost time + Category */}
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-white/60">
                {postType === 'FOUND' ? 'Found date' : 'Lost date'}
              </label>
              <input
                type="date"
                value={lostDate}
                onChange={(e) => onLostDateChange(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-neutral-950/70 px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">
                {postType === 'FOUND' ? 'Found time' : 'Lost time'}
              </label>
              <input
                type="time"
                value={lostTime}
                onChange={(e) => onLostTimeChange(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-neutral-950/70 px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-neutral-950/70 px-4 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-neutral-900 text-white"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm text-white/60">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={6}
              placeholder={`Describe the ${postType === 'FOUND' ? 'found' : 'lost'} item clearly so others can identify it`}
              className="w-full rounded-2xl border border-white/10 bg-neutral-950/70 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>

          {/* Images: 1 to 5 allowed */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm text-white/60">
                Image upload (1 to 5 images)
              </label>
              <span className="text-xs text-white/45">
                {imageNames.length}/5 selected
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[140px] flex-col items-center justify-center rounded-[28px] border border-dashed border-cyan-400/35 bg-cyan-400/5 px-4 text-center transition hover:bg-cyan-400/10"
              >
                <span className="text-4xl text-cyan-300">+</span>
                <span className="mt-3 text-sm font-medium text-white">
                  Add images
                </span>
                <span className="mt-1 text-xs text-white/50">
                  You can add files multiple times up to 5
                </span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 rounded-2xl border border-white/10 px-4 text-sm text-white/75 transition hover:bg-white/5 hover:text-white sm:self-end"
              >
                Browse
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onImageChange(e.target.files);
                e.currentTarget.value = '';
              }}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {imageNames.length > 0 ? (
                imageNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onRemoveImage(name)}
                    className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    {name} ×
                  </button>
                ))
              ) : (
                <span className="text-xs text-white/45">
                  No images selected yet.
                </span>
              )}
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 px-5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-300"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
