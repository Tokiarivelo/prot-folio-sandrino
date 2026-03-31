# Add API Endpoint — Portfolio Backend

Use this skill when adding a new REST endpoint to the NestJS backend — whether extending an existing module or creating a new one from scratch.

## Step 0 — Pick the right module

Existing modules: `auth`, `profile`, `projects`, `project-media`, `skills`, `tags`, `contact`

If the feature doesn't fit an existing module, create a new one (Steps 1–3). Otherwise jump to Step 4.

If the feature requires a new DB table, run the schema migration skill first.

---

## Step 1 — Create the module directory

```
backend/src/<feature>/
├── <feature>.service.ts
├── <feature>.controller.ts
├── <feature>.module.ts
└── dto/
    ├── create-<feature>.dto.ts
    └── <feature>-response.dto.ts
```

Follow the `src/skills/` module as the reference implementation.

---

## Step 2 — Service

```typescript
@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feature.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.feature.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Feature not found');
    return item;
  }

  async create(dto: CreateFeatureDto) {
    return this.prisma.feature.create({ data: dto });
  }

  async update(id: string, dto: UpdateFeatureDto) {
    const exists = await this.prisma.feature.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Feature not found');
    return this.prisma.feature.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const exists = await this.prisma.feature.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Feature not found');
    return this.prisma.feature.delete({ where: { id } });
  }
}
```

Rules:
- Inject `PrismaService` — never instantiate `PrismaClient` directly
- Check existence before update/delete — throw `NotFoundException` explicitly
- Use only NestJS built-in exceptions

---

## Step 3 — DTOs

### Request DTO
```typescript
export class CreateFeatureDto {
  @ApiProperty({ example: 'My Feature' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Optional description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
```

### Response DTO
```typescript
export class FeatureResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'My Feature' })
  name: string;

  @ApiPropertyOptional({ example: 'Optional description' })
  description: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}
```

---

## Step 4 — Controller with full Swagger

Every method must have the complete decorator set. Reference template:

```typescript
@ApiTags('Feature')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({
    summary: 'List features (Public)',
    description: 'Returns all features ordered by creation date.',
  })
  @ApiOkResponse({ description: 'Array of features', type: [FeatureResponseDto] })
  findAll() { return this.featureService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature by ID (Public)', description: '...' })
  @ApiParam({ name: 'id', description: 'UUID', example: 'a1b2c3d4-...' })
  @ApiOkResponse({ description: 'Feature found', type: FeatureResponseDto })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  findOne(@Param('id') id: string) { return this.featureService.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create feature (Admin)', description: '...' })
  @ApiCreatedResponse({ description: 'Created', type: FeatureResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  create(@Body() dto: CreateFeatureDto) { return this.featureService.create(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update feature (Admin)', description: '...' })
  @ApiParam({ name: 'id', description: 'UUID' })
  @ApiOkResponse({ description: 'Updated', type: FeatureResponseDto })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  update(@Param('id') id: string, @Body() dto: UpdateFeatureDto) {
    return this.featureService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete feature (Admin)', description: '...' })
  @ApiParam({ name: 'id', description: 'UUID' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  remove(@Param('id') id: string) { return this.featureService.remove(id); }
}
```

---

## Step 5 — Module file

```typescript
@Module({
  imports: [PrismaModule],   // add StorageModule if uploads are needed
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

---

## Step 6 — Register in app.module.ts

Add `FeatureModule` to the `imports` array in `src/app.module.ts`.

---

## Step 7 — Build and verify

```bash
bun run build     # must succeed with zero errors
bun run start:dev
```

Open http://localhost:3000/api/docs — confirm the new tag, all endpoints, and correct response schemas appear.

---

## Step 8 — Wire up the frontend

**If public endpoint → Next.js portfolio:**
1. Add types to `portfolio-web/src/lib/types/<feature>.ts`
2. Add fetch function to `portfolio-web/src/lib/api/<feature>.ts`
3. Add to `Promise.all` in `portfolio-web/src/app/page.tsx`
4. Pass as props to the relevant section component

**If admin endpoint → Angular admin:**
1. Add method to the service in `portfolio-admin/src/app/core/services/`
2. Call from the component via `inject(FeatureService)`
