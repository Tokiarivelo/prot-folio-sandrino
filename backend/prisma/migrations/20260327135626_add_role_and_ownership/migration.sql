/*
  Warnings:
  - Added role-based ownership to projects, skills, skill_categories, and tools.
  - Existing rows are assigned to the first admin user in the database.
*/

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropIndex
DROP INDEX "skill_categories_name_key";

-- AlterTable: admin_users gets a role column (default USER)
ALTER TABLE "admin_users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';

-- ─── Add userId columns as nullable first so existing rows don't break ─────────

-- AlterTable: projects
ALTER TABLE "projects" ADD COLUMN "userId" TEXT;

-- AlterTable: skill_categories
ALTER TABLE "skill_categories" ADD COLUMN "userId" TEXT;

-- AlterTable: skills
ALTER TABLE "skills" ADD COLUMN "userId" TEXT;

-- AlterTable: tools
ALTER TABLE "tools" ADD COLUMN "userId" TEXT;

-- ─── Backfill existing rows with the first admin user's ID ────────────────────
UPDATE "projects"         SET "userId" = (SELECT "id" FROM "admin_users" ORDER BY "createdAt" LIMIT 1) WHERE "userId" IS NULL;
UPDATE "skill_categories" SET "userId" = (SELECT "id" FROM "admin_users" ORDER BY "createdAt" LIMIT 1) WHERE "userId" IS NULL;
UPDATE "skills"           SET "userId" = (SELECT "id" FROM "admin_users" ORDER BY "createdAt" LIMIT 1) WHERE "userId" IS NULL;
UPDATE "tools"            SET "userId" = (SELECT "id" FROM "admin_users" ORDER BY "createdAt" LIMIT 1) WHERE "userId" IS NULL;

-- ─── Enforce NOT NULL once all rows have a value ──────────────────────────────
ALTER TABLE "projects"         ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "skill_categories" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "skills"           ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "tools"            ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "skill_categories_userId_idx" ON "skill_categories"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_userId_name_key" ON "skill_categories"("userId", "name");

-- CreateIndex
CREATE INDEX "skills_userId_idx" ON "skills"("userId");

-- CreateIndex
CREATE INDEX "tools_userId_idx" ON "tools"("userId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tools" ADD CONSTRAINT "tools_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
