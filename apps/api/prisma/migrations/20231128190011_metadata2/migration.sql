-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "metadata" DROP NOT NULL,
ALTER COLUMN "metadata" DROP DEFAULT;
