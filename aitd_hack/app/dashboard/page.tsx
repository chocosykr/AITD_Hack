'use client';

import React, { useMemo, useState } from 'react';
import CreatePostModal from '../../components/CreatePostModal';

type Post = {
  id: number;
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

const baseForums: ForumGroup[] = [
  { name: 'Lost Items', count: 0 },
  { name: 'Found Items', count: 0 },
  { name: 'Community Alerts', count: 0 },
  { name: 'Help Desk', count: 0 },
];

const categories = ['Electronics', 'Bags', 'Accessories', 'Documents', 'Keys', 'Other'];

const initialPosts: Post[] = [
  {
    id: 1,
    title: 'Lost black backpack near station exit',
    location: 'Andheri Station Exit 2',
    description:
      'Black backpack with a laptop sleeve and small tripod inside. Lost while changing platforms in the evening rush.',
    timeItemLost: '2026-04-29T18:30',
    category: 'Bags',
    forum: 'Lost Items',
    author: 'You',
    createdAt: '2h ago',
    likes: 14,
    comments: 6,
    images: ['bag_front.jpg', 'bag_side.jpg', 'zipper_closeup.jpg'],
  },
  {
    id: 2,
    title: 'Looking for silver watch',
    location: 'Powai Lake walkway',
    description:
      'Silver analog watch with a dark strap. It may have fallen off during a walk in the late afternoon.',
    timeItemLost: '2026-04-28T17:15',
    category: 'Accessories',
    forum: 'Lost Items',
    author: 'You',
    createdAt: 'Yesterday',
    likes: 9,
    comments: 3,
    images: ['watch_front.jpg', 'watch_strap.jpg', 'watch_dial.jpg'],
  },
];

export default function ForumPostsPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
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
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

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

    const incoming = Array.from(files).map((file: File) => file.name);
    setImageNames((current: string[]) => {
      const merged = [...current];
      for (const name of incoming) {
        if (!merged.includes(name) && merged.length < 5) {
          merged.push(name);
        }
      }
      validateImageCount(merged.length);
      return merged;
    });
  };

  const handleRemoveImage = (name: string) => {
    setImageNames((current: string[]) => {
      const next = current.filter((item: string) => item !== name);
      validateImageCount(next.length);
      return next;
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return setFormError('Please enter a post title.');
    if (!location.trim()) return setFormError('Please enter the location.');
    if (!description.trim()) return setFormError('Please enter a description.');
    if (!lostDate) return setFormError('Please select the lost date.');
    if (!lostTime) return setFormError('Please select the lost time.');
    if (!category) return setFormError('Please select a category.');
    if (imageNames.length < 1) return setFormError('Please add at least 1 image.');
    if (imageNames.length > 5) return setFormError('You can upload at most 5 images.');

    const timeItemLost = `${lostDate}T${lostTime}`;

    const newPost: Post = {
      id: Date.now(),
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
      timeItemLost,
      category,
      forum,
      author: 'You',
      createdAt: 'Just now',
      likes: 0,
      comments: 0,
      images: imageNames,
    };

    setPosts((current: Post[]) => [newPost, ...current]);
    setActiveSidebar('posts');
    resetForm();
    setCreateOpen(false);
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
            </nav>
          </aside>

          <main className="bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.02),_rgba(255,255,255,0))] p-4 sm:p-6 lg:p-8">
            <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">Lost & found</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Create post as separate component</h2>
                    <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
                      The page now uses separate lost date and lost time fields, and image upload supports 1 to 5 files.
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
                      <p className="mt-1 text-sm text-white/50">Create a post and it appears here immediately.</p>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                      {filteredPosts.length} visible
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <button
                      onClick={() => {
                        setFormError('');
                        setCreateOpen(true);
                      }}
                      className="group min-h-[320px] rounded-[28px] border border-dashed border-cyan-400/35 bg-cyan-400/6 p-6 text-left transition hover:border-cyan-300 hover:bg-cyan-400/10"
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-3xl font-light text-neutral-950 shadow-lg shadow-cyan-500/20">
                          +
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-white">Create new post</h4>
                          <p className="mt-2 text-sm leading-6 text-white/60">
                            Open the separate modal component and publish a lost item post.
                          </p>
                        </div>
                      </div>
                    </button>

                    {filteredPosts.map((post: Post) => (
                      <article
                        key={post.id}
                        className="min-h-[320px] rounded-[28px] border border-white/10 bg-neutral-950/50 p-5 transition hover:border-cyan-400/30 hover:bg-neutral-950/65"
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-300">{post.category}</span>
                              <span>{post.createdAt}</span>
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
                            <div className="text-xs text-white/45">Lost at: {post.timeItemLost}</div>
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
                    <p className="mt-1 text-sm text-white/50">The same created post also appears in its selected forum below.</p>
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
                                  <span>{post.createdAt}</span>
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
        title={title}
        location={location}
        description={description}
        lostDate={lostDate}
        lostTime={lostTime}
        category={category}
        categories={categories}
        imageNames={imageNames}
        error={formError}
        onClose={() => setCreateOpen(false)}
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