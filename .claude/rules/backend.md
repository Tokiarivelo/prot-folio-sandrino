# Backend Rules (NestJS + Bun + Prisma)

> Extends global common rules for this project's NestJS backend.

## Package Manager: BUN ONLY
**NEVER use npm or npx for the backend.** All commands must use `bun`:
- Install: `bun add <package>`
- Run scripts: `bun run <script>`
- Wrong: `npm install`, `npx prisma generate`
- Correct: `bun add`, `bun run prisma:generate`

## After Any Schema Change (MANDATORY order)
1. `bun run prisma:migrate:dev <migration-name>`
2. `bun run prisma:generate`
3. Update affected DTOs with new fields + `@ApiProperty` decorators
4. Update seed script if new fields have meaningful defaults
5. Run `bun run build` to verify no type errors

## Swagger: Every Endpoint Must Have
```typescript
@ApiOperation({ summary: 'One-line summary (Admin|Public)', description: 'Full explanation of behavior, side effects, and caveats.' })
@ApiOkResponse({ description: 'What is returned', type: ResponseDto })          // or @ApiCreatedResponse
@ApiNotFoundResponse({ description: 'When not found' })                          // if 404 possible
@ApiBadRequestResponse({ description: 'Validation errors' })                    // if 400 possible
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })       // if protected
@ApiBearerAuth()                                                                  // if protected
```

## New Module Pattern
Follow the existing module structure exactly:
1. `src/<feature>/<feature>.service.ts` — inject `PrismaService` (never instantiate Prisma directly)
2. `src/<feature>/<feature>.controller.ts` — inject service, never PrismaService directly
3. `src/<feature>/<feature>.module.ts` — import `PrismaModule` and `StorageModule` if needed
4. `src/<feature>/dto/` — one DTO per operation, all fields decorated with `@ApiProperty`
5. Register in `app.module.ts` imports array

## Error Handling
Use only NestJS built-in exceptions:
- `NotFoundException` — resource not found
- `BadRequestException` — invalid input
- `ForbiddenException` — auth but no permission
- `ConflictException` — unique constraint violation
- `UnauthorizedException` — no/invalid token

## File Uploads
Always use `StorageService.uploadFile(file, 'folder-name')` — never write files to disk.
Inject `StorageModule` into the feature module.

## Rate Limiting
The global `ThrottlerGuard` applies to all routes.
Use `@SkipThrottle()` on admin GET endpoints that need high throughput.
For public write endpoints (contact form), the default 60 req/min is appropriate.

## Production Safety
`POST /auth/register` throws `ForbiddenException` when `NODE_ENV === 'production'`. Do not remove this guard.
