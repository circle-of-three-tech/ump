-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "is_sponsored" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sponsored_tier" INTEGER,
ADD COLUMN     "sponsored_until" TIMESTAMP(3);
