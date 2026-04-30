// app/dashboard/page.tsx (example)
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return redirect('/sign-in');

  const profileRow = await prisma.profile.findUnique({
    where: { id: userId },
  });

const items = await prisma.item.findMany({
  orderBy: { createdAt: 'desc' },
  include: { images: true },
});

  const initialPosts = items.map((item) => ({
    id: item.id,
    title: item.title,
    location: item.locationName ?? '',
    description: item.description ?? '',
    timeItemLost: `${item.lostDate ?? ''} ${item.lostTime ?? ''}`,
    category: item.category,
    forum: item.type === 'FOUND' ? 'Found Items' : 'Lost Items',
    author: profileRow?.username || profileRow?.email || 'Unknown',
    createdAt: item.createdAt.toISOString(),
    likes: 0,
    comments: 0,
    images: item.images.map((img) => img.url),
  }));

  return (
    <DashboardClient
      clerkUserId={userId}
      clerkEmail={profileRow?.email ?? ''}
      profileRow={profileRow!}
      initialPosts={initialPosts}
    />
  );
}