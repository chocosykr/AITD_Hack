'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreatePostModal from './CreatePostModal';

type Post = {
  id: string;
  title: string;
  location: string;
  description: string;
  timeItemLost: string;
  category: string;
  forum: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  images: string[];
};

type ForumGroup = {
  name: string;
  count: number;
};

type ForumWithPosts = ForumGroup & {
  posts: Post[];
};

type DashboardClientProps = {
  clerkUserId: string;
  clerkEmail: string;
  profileRow: {
    id: string;
    email: string;
    username: string | null;
    contactNumber: string | null;
  };
  initialPosts: Post[];
};

const baseForums: ForumGroup[] = [
  { name: 'Lost Items', count: 0 },
  { name: 'Found Items', count: 0 },
  { name: 'Community Alerts', count: 0 },
  { name: 'Help Desk', count: 0 },
];

const categories = [
  'Electronics',
  'Bags',
  'Accessories',
  'Documents',
  'Keys',
  'Other',
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function DashboardClient({
  clerkUserId,
  clerkEmail,
  profileRow,
  initialPosts,
}: DashboardClientProps) {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [lostDate, setLostDate] = useState('');
  const [lostTime, setLostTime] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [forum, setForum] = useState('Lost Items');
  const [activeSidebar, setActiveSidebar] = useState<'posts' | 'forums'>('posts');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [postType, setPostType] = useState<'LOST' | 'FOUND'>('LOST');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredPosts = useMemo((): Post[] => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter(
      (post: Post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.location.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.forum.toLowerCase().includes(query)
    );
  }, [posts, search]);

  const forums = useMemo((): ForumGroup[] => {
    return baseForums.map((forumItem: ForumGroup) => ({
      ...forumItem,
      count: posts.filter((post: Post) => post.forum === forumItem.name).length,
    }));
  }, [posts]);

  const postsByForum = useMemo((): ForumWithPosts[] => {
    return forums.map((forumItem: ForumGroup) => ({
      ...forumItem,
      posts: posts.filter((post: Post) => post.forum === forumItem.name),
    }));
  }, [forums, posts]);

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setLostDate('');
    setLostTime('');
    setCategory('Electronics');
    setForum('Lost Items');
    setImageFiles([]);
    setImageNames([]);
    setFormError('');
  };

  const validateImageCount = (count: number) => {
    if (count === 0) {
      setFormError('');
      return;
    }
    if (count > 5) {
      setFormError('You can upload at most 5 images.');
      return;
    }
    setFormError('');
  };

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;

    const incomingFiles = Array.from(files);

    setImageFiles((current) => {
      const merged = [...current];
      for (const file of incomingFiles) {
        const exists = merged.some((item) => item.name === file.name);
        if (!exists && merged.length < 5) {
          merged.push(file);
        }
      }
      validateImageCount(merged.length);
      return merged;
    });

    setImageNames((current: string[]) => {
      const merged = [...current];
      for (const file of incomingFiles) {
        if (!merged.includes(file.name) && merged.length < 5) {
          merged.push(file.name);
        }
      }
      return merged;
    });
  };

  const handleRemoveImage = (name: string) => {
    setImageFiles((current) => current.filter((file) => file.name !== name));
    setImageNames((current: string[]) => {
      const next = current.filter((item: string) => item !== name);
      validateImageCount(next.length);
      return next;
    });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim()) return setFormError('Please enter a post title.');
  if (!location.trim()) return setFormError('Please enter the location.');
  if (!description.trim()) return setFormError('Please enter a description.');
  if (!lostDate) return setFormError('Please select the lost date.');
  if (!lostTime) return setFormError('Please select the lost time.');
  if (!category) return setFormError('Please select a category.');
  if (imageFiles.length < 1) return setFormError('Please add at least 1 image.');
  if (imageFiles.length > 5) return setFormError('You can upload at most 5 images.');

  try {
    setSubmitting(true);
    setFormError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    formData.append('description', description);
    formData.append('lostDate', lostDate);
    formData.append('lostTime', lostTime);
    formData.append('category', category);
    formData.append('type', postType);

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

   const res = await fetch('/api/items', {
  method: 'POST',
  body: formData,
});

const data = await res.json();
console.log('API response:', data);

if (!res.ok) {
  setFormError(data.error ?? 'Failed to create post');
  return;
}

    const created = data.item;

    const newPost: Post = {
      id: created.id,
      title: created.title,
      location: created.locationName ?? '',
      description: created.description ?? '',
      timeItemLost: `${created.lostDate ?? ''} ${created.lostTime ?? ''}`,
      category: created.category,
      forum: postType === 'FOUND' ? 'Found Items' : 'Lost Items',
      author: 'You',
      createdAt: created.createdAt,
      likes: 0,
      comments: 0,
      images: created.images?.map((img: { url: string }) => img.url) ?? [],
    };

    setPosts((current) => [newPost, ...current]);

    resetForm();
    setCreateOpen(false);
  } catch (err) {
    console.error(err);
    setFormError('Something went wrong. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-white">
        <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
          <aside className="border-b border-white/10 bg-neutral-900/90 p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/20">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7.5C4 6.12 5.12 5 6.5 5h11C18.88 5 20 6.12 20 7.5v6C20 14.88 18.88 16 17.5 16H9l-5 3v-3.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">Community</p>
                <h1 className="text-lg font-semibold">Lost & Found Forum</h1>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
              <p>User ID: {clerkUserId}</p>
              <p className="mt-1">Email: {clerkEmail}</p>
              <p className="mt-1">Profile: {profileRow.id}</p>
            </div>

            <nav className="mt-8 space-y-2">
              <button
                onClick={() => setActiveSidebar('posts')}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeSidebar === 'posts'
                    ? 'bg-cyan-500 text-neutral-950'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                <span>Your Posts</span>
                <span className="rounded-full bg-black/15 px-2 py-1 text-xs">{posts.length}</span>
              </button>

              <button
                onClick={() => setActiveSidebar('forums')}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  activeSidebar === 'forums'
                    ? 'bg-cyan-500 text-neutral-950'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                <span>View Forums</span>
                <span className="rounded-full bg-black/15 px-2 py-1 text-xs">{forums.length}</span>
              </button>

              <Link
                href="/browse"
                id="sidebar-browse-all"
                className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-4 py-3 text-left text-sm font-medium text-white/80 ring-1 ring-white/10 transition hover:from-cyan-500/20 hover:to-emerald-500/20 hover:text-white"
              >
                <span>🌐 Browse All Items</span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{posts.length}</span>
              </Link>

              <Link
                href="/my-items"
                id="sidebar-my-items"
                className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 px-4 py-3 text-left text-sm font-medium text-white/80 ring-1 ring-white/10 transition hover:from-purple-500/20 hover:to-cyan-500/20 hover:text-white"
              >
                <span>✨ My Items + AI Matches</span>
              </Link>
            </nav>
          </aside>

          <main className="bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.02),_rgba(255,255,255,0))] p-4 sm:p-6 lg:p-8">
            <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Lost & found</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Your actual dashboard</h2>
                    <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
                      Posts below are loaded from your Supabase Postgres Item table through Prisma.
                    </p>
                  </div>

                  <div className="w-full max-w-md">
                    <label className="mb-2 block text-sm text-white/60">Search posts</label>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search title, location, category, or forum"
                      className="h-12 w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 text-sm outline-none placeholder:text-white/30 focus:border-cyan-400/50"
                    />
                  </div>
                </div>
              </div>

              {activeSidebar === 'posts' ? (
                <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">Your Posts</h3>
                      <p className="mt-1 text-sm text-white/50">Create a post and it gets stored in Supabase.</p>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                      {filteredPosts.length} visible
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <button
                      onClick={() => {
                        setFormError('');
                        setPostType('LOST');
                        setCreateOpen(true);
                      }}
                      className="group min-h-[320px] rounded-[28px] border border-dashed border-cyan-400/35 bg-cyan-400/6 p-6 text-left transition hover:border-cyan-300 hover:bg-cyan-400/10"
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-3xl font-light text-neutral-950 shadow-lg shadow-cyan-500/20">
                          +
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">Report Lost Item</h4>
                          <p className="mt-2 text-sm leading-6 text-white/60">
                            Open the modal and save a lost item post into your database.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setFormError('');
                        setPostType('FOUND');
                        setCreateOpen(true);
                      }}
                      className="group min-h-[320px] rounded-[28px] border border-dashed border-emerald-400/35 bg-emerald-400/6 p-6 text-left transition hover:border-emerald-300 hover:bg-emerald-400/10"
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 text-3xl font-light text-neutral-950 shadow-lg shadow-emerald-500/20">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">Report Found Item</h4>
                          <p className="mt-2 text-sm leading-6 text-white/60">
                            Open the modal and save a found item post into your database.
                          </p>
                        </div>
                      </div>
                    </button>

                    {filteredPosts.map((post: Post) => (
                      <article
                        key={post.id}
                        onClick={() => router.push(`/dashboard/posts/${post.id}`)}
                        className="min-h-[320px] rounded-[28px] border border-white/10 bg-neutral-950/50 p-5 transition hover:border-cyan-400/30 hover:bg-neutral-950/65"
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-300">{post.category}</span>
                              <span>{formatCreatedAt(post.createdAt)}</span>
                            </div>
                            <h4 className="mt-4 text-lg font-semibold text-white">{post.title}</h4>
                            <p className="mt-2 text-sm text-white/55">{post.location}</p>
                            <p className="mt-3 text-sm leading-6 text-white/65">{post.description}</p>
                          </div>

                          <div className="mt-5 space-y-3">
                            <div className="flex flex-wrap gap-2 text-xs text-white/55">
                              <span className="rounded-full bg-white/6 px-3 py-1">{post.forum}</span>
                              <span className="rounded-full bg-white/6 px-3 py-1">{post.images.length} images</span>
                            </div>
                            <div className="text-xs text-white/45">
                              {post.timeItemLost ? `Lost at: ${post.timeItemLost}` : 'Lost time not stored in DB yet'}
                            </div>
                            <div className="flex items-center justify-between text-sm text-white/45">
                              <span>♥ {post.likes}</span>
                              <span>💬 {post.comments}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : (
                <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
                  <div className="mb-5">
                    <h3 className="text-xl font-semibold">View Forums</h3>
                    <p className="mt-1 text-sm text-white/50">The same created post appears in its forum group below.</p>
                  </div>

                  <div className="space-y-6">
                    {postsByForum.map((forumItem: ForumWithPosts) => (
                      <div key={forumItem.name} className="rounded-[28px] border border-white/10 bg-neutral-950/35 p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{forumItem.name}</h4>
                            <p className="mt-1 text-sm text-white/50">{forumItem.posts.length} posts in this forum</p>
                          </div>
                        </div>

                        {forumItem.posts.length > 0 ? (
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {forumItem.posts.map((post: Post) => (
                              <article key={post.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-300">{post.category}</span>
                                  <span>{post.location}</span>
                                </div>
                                <h5 className="mt-3 text-base font-semibold text-white">{post.title}</h5>
                                <p className="mt-2 line-clamp-3 text-sm text-white/60">{post.description}</p>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
                                  <span>{post.images.length} images</span>
                                  <span>•</span>
                                  <span>{formatCreatedAt(post.createdAt)}</span>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center text-sm text-white/50">
                            No posts in this forum yet.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </section>
          </main>
        </div>
      </div>

      <CreatePostModal
        open={createOpen}
        postType={postType}
        title={title}
        location={location}
        description={description}
        lostDate={lostDate}
        lostTime={lostTime}
        category={category}
        categories={categories}
        imageNames={imageNames}
        error={formError || (submitting ? 'Creating post...' : '')}
        onClose={() => !submitting && setCreateOpen(false)}
        onTitleChange={setTitle}
        onLocationChange={setLocation}
        onDescriptionChange={setDescription}
        onLostDateChange={setLostDate}
        onLostTimeChange={setLostTime}
        onCategoryChange={setCategory}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        onSubmit={handleCreatePost}
      />
    </>
  );
}