---
trigger: always_on
---

# Workflow: Schema Migration

Use this workflow whenever a Prisma schema change is needed (adding fields, new models, new relations).

## Steps

### Step 1 — Identify the change

Read `backend/prisma/schema.prisma` and identify exactly what needs to change.
Confirm the field type, optionality (`?`), default value, and any index needed.

### Step 2 — Edit the schema

Apply the minimal change to `backend/prisma/schema.prisma`.

- New fields on existing models: add after existing fields
- New models: add with `@@map("snake_case_table_name")` and `@@index` on foreign keys
- New relations: always add `onDelete: Cascade` on child models

### Step 3 — Create and apply migration

```bash
bun run prisma:migrate:dev <descriptive-migration-name>
```

Example names: `add_hero_text_to_profile`, `add_tags_module`, `add_project_links`

### Step 4 — Regenerate Prisma Client

```bash
bun run prisma:generate
```

This MUST run after every schema change. The backend won't compile otherwise.

### Step 5 — Update affected DTOs

For every model that changed:

- Add new fields to `create-<model>.dto.ts` with `@ApiProperty({ example: ... })`
- `update-<model>.dto.ts` extends `PartialType(Create...)` — no changes needed there
- Add `@IsOptional()` for nullable fields

### Step 6 — Update seed script

If the new field should have sample data, update `backend/prisma/seed.ts`.
Use `upsert` with a fixed `id` so the seed is idempotent.

### Step 7 — Verify compilation

```bash
bun run build
```

Fix any TypeScript errors before proceeding.

### Step 8 — Update Swagger docs

If a new endpoint was added, ensure it has full `@ApiOperation`, `@ApiResponse`, and `@ApiProperty` decorators.
Run the dev server and verify the endpoint appears correctly in http://localhost:3000/api/docs.
