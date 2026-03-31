---
name: schema-migration
description: Guides safe Prisma schema migrations for the portfolio backend. Use when adding database fields, creating new models, or modifying relations. Ensures the full migration → generate → compile → seed cycle is followed correctly.
---

# Schema Migration Skill

This skill ensures every Prisma schema change is applied safely and completely. Follow these steps in order — skipping any step will cause build errors or data inconsistencies.

## Decision tree

```
Need to change the database?
├── Adding a field to existing model  → go to "Add field" section
├── Adding a new model               → go to "New model" section
├── Adding a relation                → go to "New relation" section
└── Renaming or removing             → go to "Destructive change" section
```

## Add field to existing model

1. Edit `backend/prisma/schema.prisma`
2. Run: `bun run prisma:migrate:dev add_<field>_to_<model>`
3. Run: `bun run prisma:generate`
4. Update `create-<model>.dto.ts` — add the field with `@ApiProperty`
5. If field is required with no default: update `backend/prisma/seed.ts`
6. Run: `bun run build` — must succeed with zero errors

## New model

1. Add model to `backend/prisma/schema.prisma`:
   - Use `@id @default(uuid())` for primary key
   - Add `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
   - Add `@@map("snake_case_name")`
   - Add `@@index([foreignKeyField])` for every FK
2. Run: `bun run prisma:migrate:dev add_<model>_model`
3. Run: `bun run prisma:generate`
4. Create `src/<feature>/dto/create-<model>.dto.ts` and `response.dto.ts`
5. Create the full module (service, controller, module file)
6. Register in `app.module.ts`
7. Add seed data to `backend/prisma/seed.ts`
8. Run: `bun run build`

## New relation (foreign key)

On the **child** model:
```prisma
parentId String
parent   Parent @relation(fields: [parentId], references: [id], onDelete: Cascade)

@@index([parentId])
```

Always use `onDelete: Cascade` — orphaned child records cause runtime errors.

## Destructive change (rename or remove field)

1. Check if the field is used in any service or DTO
2. Remove usages first (DTO, service queries)
3. `bun run build` — verify no TypeScript errors
4. Then modify the schema and migrate

Never rename a field directly in schema without first removing its usages — the generated client will have the old name until regenerated, causing a compile failure.

## Verification after any migration

```bash
bun run build       # TypeScript must compile cleanly
bun run prisma:studio   # visually verify the schema in the browser
```

Check that:
- New columns appear in the correct table
- Default values are set correctly
- Indexes are present on FK columns
