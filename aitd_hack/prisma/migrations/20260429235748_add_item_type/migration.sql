-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('LOST', 'FOUND');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "type" "ItemType" NOT NULL DEFAULT 'LOST';
