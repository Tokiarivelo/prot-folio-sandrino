# Prisma Patterns for Portfolio Backend

## Adding a field to an existing model

1. Add to `backend/prisma/schema.prisma`
2. `bun run prisma:migrate:dev add_<field>_to_<model>`
3. `bun run prisma:generate`
4. Update the relevant DTO with `@ApiProperty`
5. `bun run build` to verify

## JSON field pattern (socialLinks, seoMetadata, themeConfig)
In the schema, these are `Json?` fields.
In DTOs, type them as `Record<string, any>` with `@IsObject() @IsOptional()`.
They are replaced in full on update — the frontend must merge before sending.

## Adding a relation with cascade delete
```prisma
model Child {
  id       String @id @default(uuid())
  parentId String
  parent   Parent @relation(fields: [parentId], references: [id], onDelete: Cascade)

  @@index([parentId])
}
```
Always add an index on the foreign key field.

## Seed script patterns

Upsert with fixed ID for idempotent seeds:
```typescript
await prisma.profile.upsert({
  where: { id: 'seed-profile-id' },
  update: {},   // no-op if already exists
  create: { id: 'seed-profile-id', ...data },
});
```

Handle duplicate relations gracefully:
```typescript
await prisma.projectTag.create({ data }).catch(() => { /* skip duplicate */ });
```

## Useful query patterns

Include nested relations:
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

Filter by nested relation:
```typescript
prisma.project.findMany({
  where: {
    projectTags: { some: { tag: { slug: tagSlug } } },
  },
})
```

Count related records:
```typescript
prisma.tag.findMany({
  include: { _count: { select: { projectTags: true } } },
})
```

## Production migrations
- Development: `bun run prisma:migrate:dev` (creates migration + applies)
- Production: `npx prisma migrate deploy` (applies pending migrations without creating new ones)
- NEVER use `prisma db push` in production — it bypasses migration history
