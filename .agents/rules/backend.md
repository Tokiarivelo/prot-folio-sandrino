---
trigger: always_on
---

# Backend Rules — NestJS + Bun + Prisma

This project's backend lives in `/backend`. Always apply these rules when working on any file under that directory.

## Package Manager: BUN ONLY

**Never use `npm` or `npx` in the `/backend` directory.** All commands must use `bun`:

| Wrong                           | Correct                     |
| ------------------------------- | --------------------------- |
| `npm install @nestjs/throttler` | `bun add @nestjs/throttler` |
| `npx prisma generate`           | `bun run prisma:generate`   |
| `npm run start:dev`             | `bun run start:dev`         |

## Schema Change Workflow (mandatory order)

Whenever the Prisma schema (`backend/prisma/schema.prisma`) is modified:

1. `bun run prisma:migrate:dev <migration-name>` — creates and applies migration
2. `bun run prisma:generate` — regenerates the Prisma Client types
3. Update affected DTOs — add `@ApiProperty({ example: ... })` to new fields
4. Update `backend/prisma/seed.ts` if the new fields need sample data
5. `bun run build` — verify TypeScript compiles with zero errors

Never skip step 2. The backend will fail to compile if the Prisma Client is stale.

## Swagger: Required on Every Endpoint

Every controller method must have ALL of the following decorators:

```typescript
@ApiOperation({
  summary: 'One-line summary (Admin|Public)',
  description: 'Full explanation: behavior, side effects, caveats, edge cases.'
})
@ApiOkResponse({ description: 'What is returned on success', type: ResponseDto })
@ApiNotFoundResponse({ description: 'When 404 occurs' })          // if applicable
@ApiBadRequestResponse({ description: 'Validation error details' }) // if applicable
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' }) // if protected
@ApiBearerAuth()                                                     // if protected
```

## New Module Checklist

When adding a new feature module, follow the existing `src/skills/` pattern exactly:

1. `src/<feature>/<feature>.service.ts` — inject `PrismaService` (never `new PrismaClient()`)
2. `src/<feature>/<feature>.controller.ts` — inject only the service
3. `src/<feature>/<feature>.module.ts` — import `PrismaModule`; also import `StorageModule` if uploads are needed
4. `src/<feature>/dto/` — one DTO file per operation with `@ApiProperty` on all fields
5. Register the new module in `src/app.module.ts` imports array

## Error Handling

Use only NestJS built-in HTTP exceptions — never throw plain `Error`:

- `NotFoundException` — resource does not exist
- `BadRequestException` — invalid input
- `ForbiddenException` — authenticated but not authorized
- `ConflictException` — unique constraint violation
- `UnauthorizedException` — no or invalid token

## File Uploads

All uploads go to Supabase Storage via `StorageService.uploadFile(file, 'folder-name')`.
Never write files to disk. Inject `StorageModule` into any module that needs uploads.

## Rate Limiting

The global `ThrottlerGuard` applies 60 req/min per IP across all routes.
Use `@SkipThrottle()` on admin GET endpoints where high throughput is needed.

## Production Safety

`POST /auth/register` throws `ForbiddenException` when `NODE_ENV === 'production'`.
Do not remove or bypass this guard.

## CORS

`CORS_ORIGIN` in `.env` supports comma-separated origins:

```
CORS_ORIGIN=http://localhost:4000,http://localhost:4200
```
