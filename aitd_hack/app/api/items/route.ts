import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function toCategoryEnum(category: string) {
  const map: Record<string, 'ELECTRONICS' | 'BAGS' | 'ACCESSORIES' | 'DOCUMENTS' | 'KEYS' | 'OTHER'> = {
    Electronics: 'ELECTRONICS',
    Bags: 'BAGS',
    Accessories: 'ACCESSORIES',
    Documents: 'DOCUMENTS',
    Keys: 'KEYS',
    Other: 'OTHER',
  };

  return map[category] ?? 'OTHER';
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      location,
      description,
      lostDate,
      lostTime,
      category,
      imageNames,
    }: {
      title?: string;
      location?: string;
      description?: string;
      lostDate?: string;
      lostTime?: string;
      category?: string;
      imageNames?: string[];
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!location?.trim()) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    if (!lostDate) {
      return NextResponse.json({ error: 'Lost date is required' }, { status: 400 });
    }

    if (!lostTime) {
      return NextResponse.json({ error: 'Lost time is required' }, { status: 400 });
    }

    if (!category?.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (!imageNames || imageNames.length < 1) {
      return NextResponse.json({ error: 'At least 1 image is required' }, { status: 400 });
    }

    if (imageNames.length > 5) {
      return NextResponse.json({ error: 'At most 5 images are allowed' }, { status: 400 });
    }

    const createdItem = await prisma.item.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        locationName: location.trim(),
        lostDate: new Date(lostDate),
        lostTime: lostTime,
        category: toCategoryEnum(category),
        status: 'ACTIVE',
        isVerified: false,
        imageUrl: imageNames[0] ?? null,
        userId,
        images: {
          create: imageNames.map((name) => ({
            url: name,
            fileName: name,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    revalidatePath('/dashboard');

    return NextResponse.json(
      {
        message: 'Item created successfully',
        item: createdItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/items error:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}