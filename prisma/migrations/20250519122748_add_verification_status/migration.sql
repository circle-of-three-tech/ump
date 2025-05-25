-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'UNDER_REVIEW');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';
