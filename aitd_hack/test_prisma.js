const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const createdItem = await prisma.item.create({
      data: {
        title: "Test Item",
        locationName: "Test Location",
        type: "FOUND",
        status: "ACTIVE",
        categoryId: "1", // Wait, schema says category is an enum: category: 'OTHER'
        imageUrl: "http://example.com/test.jpg",
        userId: "test-user-id" // Need a valid user ID? User relation has onDelete Cascade, so we need a Profile.
      }
    });
    console.log("Created item:", createdItem.id);
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
