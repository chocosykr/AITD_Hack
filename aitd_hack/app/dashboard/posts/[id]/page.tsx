import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CommentSection from '../../../../components/CommentSection';

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function PostDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const { id } = await params;

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      images: true,
      comments: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      },
      user: true,
    },
  });

  if (!item) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          ← Back to dashboard
        </Link>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-300">
              {formatCategory(item.category)}
            </span>
            <span>{new Date(item.createdAt).toLocaleString()}</span>
            <span>{item.status}</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold text-white">{item.title}</h1>

          <p className="mt-3 text-white/70">
            {item.locationName || 'No location provided'}
          </p>

          {(item.lostDate || item.lostTime) && (
            <p className="mt-2 text-sm text-white/50">
              Lost date: {item.lostDate ? new Date(item.lostDate).toLocaleDateString() : '—'} | Lost time: {item.lostTime ?? '—'}
            </p>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-medium text-white">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/70">
              {item.description || 'No description provided.'}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-white">Images</h2>

            {item.images.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {item.images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20"
                  >
                    <img
                      src={image.url}
                      alt={image.fileName ?? item.title}
                      className="h-64 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : item.imageUrl ? (
              <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-[420px] w-full object-cover"
                />
              </div>
            ) : (
              <div className="mt-4 rounded-[24px] border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center text-sm text-white/50">
                No images available.
              </div>
            )}
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-medium text-white">Posted by</h2>
            <p className="mt-3 text-sm text-white/70">
              {item.user.username || item.user.email}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <CommentSection
            itemId={item.id}
            initialComments={item.comments.map((comment) => ({
              id: comment.id,
              content: comment.content,
              createdAt: comment.createdAt.toISOString(),
              userName: comment.user.username || comment.user.email,
            }))}
          />
        </div>
      </div>
    </main>
  );
}