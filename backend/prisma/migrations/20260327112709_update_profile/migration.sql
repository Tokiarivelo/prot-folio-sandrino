-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "availability" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "heroText" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "themeConfig" JSONB;
