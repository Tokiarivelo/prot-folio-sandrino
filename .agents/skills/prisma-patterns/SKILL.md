---
name: prisma-patterns
description: Provides Prisma ORM patterns for the portfolio backend. Use when modifying the database schema, writing Prisma queries, creating migrations, or updating the seed script.
---

# Prisma Patterns — Portfolio Backend

## Adding a Field to an Existing Model

```prisma
model Profile {
  // existing fields...
  heroText     String?           // nullable String
  availability Boolean @default(true)
  location     String?
  themeConfig  Json?             // untyped JSON blob
}
```

After editing the schema:
1. `bun run prisma:migrate:dev add_<field>_to_<model>`
2. `bun run prisma:generate`
3. Update DTO with `@ApiProperty({ example: ... })`

## Adding a New Model with a Relation

```prisma
model Child {
  id        String   @id @default(uuid())
  parentId  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  parent Parent @relation(fields: [parentId], references: [id], onDelete: Cascade)

  @@index([parentId])           // always index foreign keys
  @@map("children")             // snake_case table name
}
```

Always add `onDelete: Cascade` on child models so deleting the parent cleans up all children.
Always add `@@index` on the foreign key field.
Always add `@@map("snake_case_name")` to control the actual table name.

## JSON Field Pattern

Schema: `Json?`
DTO type: `Record<string, any>` or `Record<string, string>`
Validation: `@IsObject() @IsOptional()`

JSON fields are replaced in full on PATCH — the frontend must read the current value and merge before sending.

## Seed Script — Idempotent Upsert Pattern

```typescript
// Fixed ID makes seed idempotent (safe to re-run)
await prisma.profile.upsert({
  where: { id: 'seed-profile-id' },
  update: {},          // no-op if already exists
  create: {
    id: 'seed-profile-id',
    fullName: 'Sandrino',
    // ... all required fields
  },
});
```

## Handling Duplicate Relations in Seed

```typescript
await prisma.projectTag
  .create({ data: { projectId, tagId } })
  .catch(() => { /* skip if already exists */ });
```

## Common Query Patterns

### Include nested relations
```typescript
prisma.project.findMany({
  include: {
    projectTags: { include: { tag: true } },
    media: { orderBy: { order: 'asc' } },
    links: true,
  },
  orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
})
```

### Filter by nested relation
```typescript
prisma.project.findMany({
  where: {
    projectTags: { some: { tag: { slug: tagSlug } } },
  },
})
```

### Count related records
```typescript
prisma.tag.findMany({
  include: {
    _count: { select: { projectTags: true } },
  },
})
```

### Paginated query with total count
```typescript
const [items, total] = await Promise.all([
  prisma.project.findMany({ where, skip, take: limit }),
  prisma.project.count({ where }),
]);
return {
  data: items,
  meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
};
```

## Production vs Development

| Operation | Development | Production |
|-----------|-------------|------------|
| Apply schema changes | `bun run prisma:migrate:dev` | `npx prisma migrate deploy` |
| Quick prototype | `bun run prisma:push` | ⛔ Never use in production |
| Explore data | `bun run prisma:studio` | Connect directly to Supabase dashboard |

`prisma db push` bypasses migration history — never use it in production.
