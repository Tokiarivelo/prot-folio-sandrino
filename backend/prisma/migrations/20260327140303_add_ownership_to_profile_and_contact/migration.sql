-- Add columns as nullable first
ALTER TABLE "contact_messages" ADD COLUMN "userId" TEXT;
ALTER TABLE "profiles" ADD COLUMN "userId" TEXT;

-- Create a temporary function to safely backfill
DO $$
DECLARE
    first_admin_user_id TEXT;
    target_profile_id TEXT;
BEGIN
    -- Get the ID of the first admin user
    SELECT id INTO first_admin_user_id FROM "admin_users" ORDER BY "createdAt" ASC LIMIT 1;

    -- If we have an admin user, backfill
    IF first_admin_user_id IS NOT NULL THEN
        -- Link messages to this user
        UPDATE "contact_messages" SET "userId" = first_admin_user_id WHERE "userId" IS NULL;

        -- Keep only the first profile and link it to this user
        SELECT id INTO target_profile_id FROM "profiles" ORDER BY "createdAt" ASC LIMIT 1;

        IF target_profile_id IS NOT NULL THEN
            UPDATE "profiles" SET "userId" = first_admin_user_id WHERE id = target_profile_id;
            -- Delete any other profiles that would violate the unique constraint
            DELETE FROM "profiles" WHERE id != target_profile_id;
        END IF;
    END IF;
END $$;

-- Now enforce NOT NULL on profiles.userId
-- (contact_messages.userId remains nullable as per schema)
ALTER TABLE "profiles" ALTER COLUMN "userId" SET NOT NULL;

-- Create indices
CREATE INDEX "contact_messages_userId_idx" ON "contact_messages"("userId");
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- Add foreign keys
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
