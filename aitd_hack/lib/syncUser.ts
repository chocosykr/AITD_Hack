import { currentUser } from "@clerk/nextjs/server";
import prisma from "./prisma";

export async function syncUser() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }
    
    const email = user.emailAddresses[0]?.emailAddress;
    const username = user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || email.split("@")[0];

    // Upsert profile in DB
    const profile = await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        email,
        username,
      },
      create: {
        id: user.id,
        email,
        username,
      },
    });

    return profile;
  } catch (error) {
    console.error("Error syncing user:", error);
    return null;
  }
}
