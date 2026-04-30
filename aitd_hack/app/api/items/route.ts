import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma, Prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '../../lib/supabase-admin';

function toCategoryEnum(category: string) {
  const map: Record<
    string,
    'ELECTRONICS' | 'BAGS' | 'ACCESSORIES' | 'DOCUMENTS' | 'KEYS' | 'OTHER'
  > = {
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

    const formData = await req.formData();

    const title = formData.get('title')?.toString();
    const location = formData.get('location')?.toString();
    const description = formData.get('description')?.toString();
    const lostDate = formData.get('lostDate')?.toString();
    const lostTime = formData.get('lostTime')?.toString();
    const category = formData.get('category')?.toString();
    const typeValue = formData.get('type')?.toString();
    const files = formData.getAll('images') as File[];

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

    if (!files || files.length < 1) {
      return NextResponse.json({ error: 'At least 1 image is required' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'At most 5 images are allowed' }, { status: 400 });
    }

    const uploadedImages: { url: string; fileName: string }[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `items/${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('store-items')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload image: ${file.name}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('store-items')
        .getPublicUrl(filePath);

      uploadedImages.push({
        url: publicUrlData.publicUrl,
        fileName: file.name,
      });
    }

    // Call Python FastAPI Backend
    const backendFormData = new FormData();
    const fileBytes = await files[0].arrayBuffer();
    const fileBlob = new Blob([fileBytes], { type: files[0].type });
    backendFormData.append('file', fileBlob, files[0].name);
    backendFormData.append('location', location.trim());
    backendFormData.append('item_type', typeValue === 'FOUND' ? 'found' : 'lost');
    backendFormData.append('timestamp', new Date(lostDate).toISOString());

    let embedding: number[] | null = null;
    try {
      const backendResponse = await fetch('http://localhost:8000/process_item', {
        method: 'POST',
        body: backendFormData,
      });
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        if (backendData.embedding) {
          embedding = backendData.embedding;
        }
      } else {
        console.warn('Backend responded with error:', await backendResponse.text());
      }
    } catch (err) {
      console.warn('Failed to call python backend:', err);
    }

    const createdItem = await prisma.item.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        locationName: location.trim(),
        lostDate: new Date(lostDate),
        lostTime,
        category: toCategoryEnum(category),
        type: typeValue === 'FOUND' ? 'FOUND' : 'LOST',
        status: 'ACTIVE',
        isVerified: false,
        imageUrl: uploadedImages[0]?.url ?? null,
        userId,
        images: {
          create: uploadedImages.map((img) => ({
            url: img.url,
            fileName: img.fileName,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    if (embedding && embedding.length > 0) {
      try {
        // Build the vector literal as a raw SQL fragment: '[0.1,0.2,...]'::vector
        // We use Prisma.raw so the cast is NOT applied to a parameterized placeholder,
        // which is the only way pgvector accepts the input.
        const vectorLiteral = `'[${embedding.join(',')}]'::vector`;
        await prisma.$executeRaw(
          Prisma.sql`UPDATE "Item" SET embedding = ${Prisma.raw(vectorLiteral)} WHERE id = ${createdItem.id}`
        );
        console.log('Embedding stored for item', createdItem.id);
      } catch (embErr) {
        console.error('Failed to save embedding to database:', embErr);
      }
    }

    revalidatePath('/dashboard');

    return NextResponse.json(
      {
        message: 'Item created successfully',
        item: createdItem,
      },
      { status: 201 }
    );
  }  catch (error: any) {
  console.error('POST /api/items error:', error);

  return NextResponse.json(
    {
      error: error?.message ?? 'Failed to create item',
      code: error?.code ?? null,
      meta: error?.meta ?? null,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    },
    { status: 500 }
  );
}
}
