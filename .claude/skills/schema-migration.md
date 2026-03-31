# Schema Migration — Portfolio Backend

Use when modifying `backend/prisma/schema.prisma`. Covers adding fields, new models, new relations, and destructive changes.

## The mandatory cycle (never skip a step)

```
1. Edit schema.prisma
2. bun run prisma:migrate:dev <name>   ← creates SQL + applies to DB
3. bun run prisma:generate             ← regenerates TypeScript client
4. Update affected DTOs                ← add @ApiProperty to new fields
5. Update seed.ts if needed            ← add sample values for new fields
6. bun run build                       ← must compile with zero errors
```

## Adding a field to an existing model

```prisma
model Profile {
  // existing fields...
  heroText     String?            // nullable String
  availability Boolean @default(true)
  themeConfig  Json?              // untyped JSON blob
}
```

Migration name convention: `add_hero_text_to_profile`, `add_availability_to_profile`

After migrating, update the DTO:
```typescript
@ApiPropertyOptional({ example: "Hi, I'm Sandrino" })
@IsString()
@IsOptional()
heroText?: string;
```

## Adding a new model

```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  projectTags ProjectTag[]

  @@map("tags")               // snake_case table name — always required
}
```

Required on every model:
- `@id @default(uuid())` — UUID primary key
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `@@map("snake_case_table_name")`

## Adding a relation with cascade delete

On the **child** model:
```prisma
model ProjectTag {
  projectId String
  tagId     String

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag     Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([projectId, tagId])    // composite PK for junction tables
  @@map("project_tags")
}
```

Always `onDelete: Cascade` on child side. Always `@@index([foreignKeyField])` on FK columns (except when FK is part of a composite `@@id`).

## Seed script — idempotent upsert

```typescript
// Fixed ID makes seed safe to re-run without duplicating data
await prisma.profile.upsert({
  where: { id: 'seed-profile-id' },
  update: {},           // no-op if exists
  create: {
    id: 'seed-profile-id',
    fullName: 'Sandrino',
    heroText: "Hi, I'm Sandrino",
    // ... all required fields
  },
});
```

For relations that can't have duplicate entries:
```typescript
await prisma.projectTag
  .create({ data: { projectId, tagId } })
  .catch(() => { /* silently skip if already exists */ });
```

## JSON fields (socialLinks, seoMetadata, themeConfig)

Schema type: `Json?`
DTO type: `Record<string, any>` or `Record<string, string>`
Validator: `@IsObject() @IsOptional()`

JSON fields are **replaced in full** on PATCH. The frontend must merge the existing value before sending:
```typescript
// Angular admin — merge pattern
const current = this.profile()?.socialLinks ?? {};
this.profileService.update(id, {
  socialLinks: { ...current, github: newGithubUrl }
});
```

## Destructive changes (rename or remove a field)

1. Find all usages: `Grep` for the field name across `src/` and `dto/`
2. Remove usages in services and DTOs first
3. `bun run build` — must succeed before touching the schema
4. Then edit the schema and run the migration

Never rename a field directly — the generated Prisma client keeps the old name until regenerated, causing a type error cascade.

## Production vs development

| Command | When to use |
|---------|------------|
| `bun run prisma:migrate:dev <name>` | Development — creates migration file + applies |
| `npx prisma migrate deploy` | Production — applies pending migrations only |
| `bun run prisma:push` | Quick prototype only — **never in production** |

`db push` bypasses migration history. Always use `migrate dev` → commit migration files → `migrate deploy` in production.
