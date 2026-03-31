---
name: swagger-patterns
description: Generates complete Swagger/OpenAPI decorator sets for NestJS controllers in this portfolio project. Use when adding or updating API endpoints, creating response DTOs, or ensuring Swagger documentation is complete and accurate.
---

# Swagger Patterns — Portfolio API

This skill ensures every NestJS endpoint has complete, explicit Swagger documentation matching the project's standard.

## Required decorators per endpoint

Every controller method needs ALL applicable decorators from this list:

### Operation description
```typescript
@ApiOperation({
  summary: 'One-line summary — include (Admin) or (Public)',
  description: 'Full explanation: what it does, side effects, caveats, edge cases, related endpoints.'
})
```

### Response decorators (use all that apply)
```typescript
@ApiOkResponse({ description: 'Successful retrieval', type: ResponseDto })
@ApiCreatedResponse({ description: 'Resource created', type: ResponseDto })
@ApiNoContentResponse({ description: 'Deleted — no body returned' })     // for DELETE with 204
@ApiNotFoundResponse({ description: 'Resource not found' })
@ApiBadRequestResponse({ description: 'Validation error' })
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Authenticated but not authorized' })
```

### Route parameter
```typescript
@ApiParam({ name: 'id', description: 'UUID of the resource', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
@ApiParam({ name: 'slug', description: 'URL-safe slug', example: 'e-commerce-platform' })
```

### Query parameters
```typescript
@ApiQuery({ name: 'status', enum: ProjectStatus, required: false, description: 'Filter by status', example: 'PUBLISHED' })
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)', example: 1 })
@ApiQuery({ name: 'tag', required: false, type: String, description: 'Filter by tag slug', example: 'react' })
```

### Auth (for protected endpoints)
```typescript
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
```

### File upload
```typescript
@UseInterceptors(FileInterceptor('image'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    required: ['image'],
    properties: {
      image: { type: 'string', format: 'binary', description: 'JPEG/PNG/WebP — max 5MB' },
    },
  },
})
```

### DELETE with 204
```typescript
@HttpCode(HttpStatus.NO_CONTENT)
@ApiNoContentResponse({ description: 'Deleted' })
```

## Response DTO pattern

```typescript
export class ProfileResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Sandrino' })
  fullName: string;

  @ApiPropertyOptional({ example: "Hi, I'm Sandrino" })
  heroText: string | null;

  @ApiProperty({ enum: ProjectStatus, example: 'PUBLISHED' })
  status: ProjectStatus;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
```

## Paginated response DTO

```typescript
export class PaginatedProjectsDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  data: ProjectResponseDto[];

  @ApiProperty({ example: { total: 10, page: 1, limit: 10, totalPages: 1 } })
  meta: { total: number; page: number; limit: number; totalPages: number };
}
```

## Full endpoint example

```typescript
@Get('slug/:slug')
@ApiOperation({
  summary: 'Get project by slug (Public)',
  description: 'Retrieves a project by its URL-safe slug. Includes all media, links, and tags. Use this for project detail pages.',
})
@ApiParam({ name: 'slug', description: 'URL-safe slug', example: 'e-commerce-platform' })
@ApiOkResponse({ description: 'Project found', type: ProjectResponseDto })
@ApiNotFoundResponse({ description: 'Project not found' })
findBySlug(@Param('slug') slug: string) {
  return this.projectsService.findBySlug(slug);
}
```

## Verification checklist

After adding/updating endpoints:
- [ ] Every endpoint has `@ApiOperation` with both `summary` and `description`
- [ ] Every success path has a typed `@ApiOkResponse` or `@ApiCreatedResponse` with `type:`
- [ ] Every 404 path has `@ApiNotFoundResponse`
- [ ] Every protected route has `@ApiBearerAuth()` and `@ApiUnauthorizedResponse`
- [ ] All DTOs have `@ApiProperty({ example: ... })` on every field
- [ ] Swagger UI at http://localhost:3000/api/docs shows the endpoint correctly
