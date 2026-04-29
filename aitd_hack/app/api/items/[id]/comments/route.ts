import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: itemId } = await context.params;

    const body = await req.json();
    const content = body?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, userId: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found for this Clerk user' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        itemId,
        userId: profile.id,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(`/dashboard/posts/${itemId}`);

    return NextResponse.json(
      {
        message: 'Comment added successfully',
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          userName: comment.user.username || comment.user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/items/[id]/comments error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to add comment' },
      { status: 500 }
    );
  }
}