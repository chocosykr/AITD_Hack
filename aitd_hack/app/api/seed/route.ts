import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // First, create a test profile if it doesn't exist
    const profile = await prisma.profile.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        id: "test-user-1",
        email: "test@example.com",
        username: "testuser",
        contactNumber: "+91-9876543210",
      },
    });

    // Hardcoded sample items
    const sampleItems = [
      {
        title: "Black iPhone 14",
        description: "Lost black iPhone 14 with screen protector",
        imageUrl:
          "https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop",
        locationName: "Campus Library",
        type: "lost",
        userId: profile.id,
      },
      {
        title: "Blue Backpack",
        description: "Found blue backpack near the cafeteria",
        imageUrl:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        locationName: "Cafeteria",
        type: "found",
        userId: profile.id,
      },
      {
        title: "Silver Watch",
        description: "Lost silver analog watch with brown leather strap",
        imageUrl:
          "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop",
        locationName: "Classroom Block A",
        type: "lost",
        userId: profile.id,
      },
      {
        title: "Red Wallet",
        description: "Found red leather wallet with cash and ID",
        imageUrl:
          "https://images.unsplash.com/photo-1605559424843-9e4c3ca4628d?w=400&h=400&fit=crop",
        locationName: "Parking Lot",
        type: "found",
        userId: profile.id,
      },
      {
        title: "White AirPods",
        description: "Lost white Apple AirPods Pro with case",
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        locationName: "Sports Ground",
        type: "lost",
        userId: profile.id,
      },
      {
        title: "Black Laptop Bag",
        description: "Found black laptop bag with Dell laptop inside",
        imageUrl:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        locationName: "Exam Hall",
        type: "found",
        userId: profile.id,
      },
      {
        title: "Gold Necklace",
        description: "Lost gold chain necklace with pendant",
        imageUrl:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop",
        locationName: "Hostel Gate",
        type: "lost",
        userId: profile.id,
      },
      {
        title: "Blue Umbrella",
        description: "Found blue umbrella near the main entrance",
        imageUrl:
          "https://images.unsplash.com/photo-1612308534611-8cc6739db634?w=400&h=400&fit=crop",
        locationName: "Main Gate",
        type: "found",
        userId: profile.id,
      },
    ];

    // Insert all items
    const createdItems = await prisma.item.createMany({
      data: sampleItems,
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Seeded ${createdItems.count} items`,
        profile: profile,
        itemsCount: createdItems.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}