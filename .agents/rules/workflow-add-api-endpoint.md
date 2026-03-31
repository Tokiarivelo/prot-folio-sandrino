# Workflow: Add API Endpoint

Use this workflow when adding a new endpoint to the NestJS backend.

## Steps

### Step 1 — Determine the resource
Identify: which module owns this endpoint? Does a new module need to be created, or does it belong to an existing one?

Existing modules: `auth`, `profile`, `projects`, `project-media`, `skills`, `tags`, `contact`

If new module needed: call `/workflow-schema-migration` first if it requires schema changes.

### Step 2 — Create or update the service method
In `src/<module>/<module>.service.ts`:
- Inject `PrismaService` — never instantiate `PrismaClient` directly
- Use `NotFoundException` for missing resources
- Return typed data (match the response DTO shape)

```typescript
async findBySlug(slug: string) {
  const item = await this.prisma.item.findUnique({ where: { slug } });
  if (!item) throw new NotFoundException('Item not found');
  return item;
}
```

### Step 3 — Create the response DTO
In `src/<module>/dto/<model>-response.dto.ts`:
- Annotate every field with `@ApiProperty({ example: ... })`
- Use `@ApiPropertyOptional` for nullable fields

### Step 4 — Add the controller method
Add the route handler with ALL Swagger decorators:

```typescript
@Get('slug/:slug')
@ApiOperation({
  summary: 'Get item by slug (Public)',
  description: 'Full description of behavior and edge cases.',
})
@ApiParam({ name: 'slug', description: 'URL-safe slug', example: 'my-item' })
@ApiOkResponse({ description: 'Item found', type: ItemResponseDto })
@ApiNotFoundResponse({ description: 'Item not found' })
findBySlug(@Param('slug') slug: string) {
  return this.itemService.findBySlug(slug);
}
```

Add `@ApiBearerAuth()`, `@UseGuards(JwtAuthGuard)`, and `@ApiUnauthorizedResponse` for protected routes.

### Step 5 — Build and verify
```bash
bun run build
```
Then start the dev server and verify:
- Endpoint appears in http://localhost:3000/api/docs
- All Swagger decorators render correctly
- Test with a curl or the Swagger UI

### Step 6 — Update the frontend API client (if public endpoint)
If this is a public endpoint consumed by the portfolio:
1. Add/update types in `portfolio-web/src/lib/types/`
2. Add a typed function in `portfolio-web/src/lib/api/`
3. Use it in the appropriate Server Component
