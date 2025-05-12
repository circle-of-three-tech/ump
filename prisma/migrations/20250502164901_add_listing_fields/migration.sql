-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "allow_negotiation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allow_swap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "tags" TEXT[];
