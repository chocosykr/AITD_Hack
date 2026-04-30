import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Unlocking Supabase Storage RLS...")
    
    // Create a policy that allows ALL operations for everyone (for Hackathon MVP)
    await prisma.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "public_all" ON storage.objects;
    `)
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "public_all" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
    `)
    
    console.log("✅ Supabase storage fully unlocked!")
  } catch (error) {
    console.error("❌ Failed to unlock storage:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
