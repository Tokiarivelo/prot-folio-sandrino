# Swagger Patterns for Portfolio API

## Full controller endpoint example

```typescript
@Get(':id')
@ApiOperation({
  summary: 'Get item by ID (Public)',
  description: 'Full explanation: what it returns, edge cases, caveats.',
})
@ApiParam({ name: 'id', description: 'UUID of the item', example: 'a1b2c3d4-...' })
@ApiOkResponse({ description: 'Item found', type: ItemResponseDto })
@ApiNotFoundResponse({ description: 'Item not found' })
findOne(@Param('id') id: string) { ... }
```

## Protected endpoint
```typescript
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create item (Admin)', description: '...' })
@ApiCreatedResponse({ description: 'Created', type: ItemResponseDto })
@ApiBadRequestResponse({ description: 'Validation error' })
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
create(@Body() dto: CreateItemDto) { ... }
```

## File upload endpoint
```typescript
@Post(':id/image')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(FileInterceptor('image'))
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Upload image (Admin)', description: '...' })
@ApiBody({
  schema: {
    type: 'object',
    required: ['image'],
    properties: {
      image: { type: 'string', format: 'binary', description: 'JPEG/PNG/WebP — max 5MB' },
    },
  },
})
@ApiOkResponse({ description: 'Uploaded', type: ImageResponseDto })
uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) { ... }
```

## DELETE with 204
```typescript
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiNoContentResponse({ description: 'Deleted' })
@ApiNotFoundResponse({ description: 'Not found' })
remove(@Param('id') id: string) { ... }
```

## Response DTO with ApiProperty
```typescript
export class ItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Item Name' })
  name: string;

  @ApiPropertyOptional({ example: 'Optional description' })
  description: string | null;

  @ApiProperty({ enum: Status, example: 'ACTIVE' })
  status: Status;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
```

## Paginated response
```typescript
export class PaginatedItemsDto {
  @ApiProperty({ type: [ItemResponseDto] })
  data: ItemResponseDto[];

  @ApiProperty({ example: { total: 10, page: 1, limit: 10, totalPages: 1 } })
  meta: { total: number; page: number; limit: number; totalPages: number };
}
```

## Query param with description
```typescript
@ApiQuery({ name: 'tag', required: false, type: String, description: 'Filter by tag slug', example: 'react' })
```
