// app/browse/page.tsx
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import BrowseClient from '@/components/BrowseClient';

export const metadata = {
  title: 'Browse Items — Lost & Found',
  description: 'Browse all lost and found items reported by the community.',
};

export default async function BrowsePage() {
  const { userId } = await auth();
  if (!userId) return redirect('/sign-in');

  const items = await prisma.item.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      images: true,
      user: { select: { username: true, email: true } },
    },
  });

  const allItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    location: item.locationName ?? '',
    description: item.description ?? '',
    category: item.category as string,
    type: item.type as 'LOST' | 'FOUND',
    status: item.status as string,
    createdAt: item.createdAt.toISOString(),
    lostDate: item.lostDate?.toISOString() ?? '',
    lostTime: item.lostTime ?? '',
    images: item.images.map((img) => img.url),
    author: item.user?.username ?? item.user?.email ?? 'Anonymous',
    isOwner: item.userId === userId,
  }));

  return <BrowseClient items={allItems} currentUserId={userId} />;
}
