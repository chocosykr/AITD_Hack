import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import DashboardClient from '../../components/DashboardClient';

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) throw new Error('Not authenticated');

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Clerk user not found');

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? '';

  if (!primaryEmail) throw new Error('No primary email found for Clerk user');

  const dbProfile = await prisma.profile.upsert({
    where: { id: userId },
    update: {
      email: primaryEmail,
      username: clerkUser.username ?? undefined,
    },
    create: {
      id: userId,
      email: primaryEmail,
      username: clerkUser.username ?? undefined,
    },
  });

  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      images: true,
    },
  });

  const posts = items.map((item) => ({
    id: item.id,
    title: item.title,
    location: item.locationName ?? '',
    description: item.description ?? '',

    // lostDate is DateTime?, lostTime is String? — combine if both exist
    timeItemLost:
      item.lostDate && item.lostTime
        ? `${item.lostDate.toISOString().split('T')[0]}T${item.lostTime}`
        : item.lostDate
        ? item.lostDate.toISOString().split('T')[0]
        : '',

    // category is an enum — format it like "ELECTRONICS" → "Electronics"
    category: formatCategory(item.category),

    // no Forum model in schema yet — hardcode or derive from item type
    forum: 'Lost Items',

    author: 'You',
    createdAt: item.createdAt.toISOString(),
    likes: 0,    // no Like model yet
    comments: 0, // no Comment model yet

    // prefer ItemImage rows, fall back to legacy imageUrl
    images:
      item.images.length > 0
        ? item.images.map((img) => img.url)
        : item.imageUrl
        ? [item.imageUrl]
        : [],
  }));

  return (
    <DashboardClient
      clerkUserId={userId}
      clerkEmail={primaryEmail}
      profileRow={{
        id: dbProfile.id,
        email: dbProfile.email,
        username: dbProfile.username ?? null,
        contactNumber: dbProfile.contactNumber ?? null,
      }}
      initialPosts={posts}
    />
  );
}