---
name: add-api-endpoint
description: Step-by-step guide for adding a new REST endpoint to the NestJS portfolio backend. Use when creating a new route, adding a method to an existing controller, or wiring a new feature module from scratch.
---

# Add API Endpoint — Portfolio Backend

This skill walks through the full process of adding a new endpoint, from deciding where it lives to verifying it in Swagger.

## Step 0 — Decide where the endpoint belongs

Ask: does this belong to an existing module or does it need a new one?

**Existing modules:** `auth`, `profile`, `projects`, `project-media`, `skills`, `tags`, `contact`

If a new module is needed, follow Steps 1–3. If adding to an existing module, skip to Step 4.

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

---

## Step 2 — Write the service

Inject `PrismaService` (never instantiate `PrismaClient` directly).
Return typed data. Throw only NestJS built-in exceptions.

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

---

## Step 3 — Write the DTOs

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

## Step 4 — Write the controller

Every method needs the full Swagger decorator set. Use this as the template:

```typescript
@ApiTags('Feature')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  // ── Public GET (list) ──────────────────────────────────────────────
  @Get()
  @ApiOperation({
    summary: 'List all features (Public)',
    description: 'Returns all features ordered by creation date. No authentication required.',
  })
  @ApiOkResponse({ description: 'Array of features', type: [FeatureResponseDto] })
  findAll() {
    return this.featureService.findAll();
  }

  // ── Public GET (single) ────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({
    summary: 'Get feature by ID (Public)',
    description: 'Retrieves a single feature by UUID.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the feature', example: 'a1b2c3d4-...' })
  @ApiOkResponse({ description: 'Feature found', type: FeatureResponseDto })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  findOne(@Param('id') id: string) {
    return this.featureService.findOne(id);
  }

  // ── Admin POST ─────────────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create feature (Admin)',
    description: 'Creates a new feature. Requires admin JWT.',
  })
  @ApiCreatedResponse({ description: 'Feature created', type: FeatureResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  create(@Body() dto: CreateFeatureDto) {
    return this.featureService.create(dto);
  }

  // ── Admin PATCH ────────────────────────────────────────────────────
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update feature (Admin)',
    description: 'Partially updates a feature. All fields are optional.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the feature' })
  @ApiOkResponse({ description: 'Feature updated', type: FeatureResponseDto })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  update(@Param('id') id: string, @Body() dto: UpdateFeatureDto) {
    return this.featureService.update(id, dto);
  }

  // ── Admin DELETE ───────────────────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete feature (Admin)',
    description: 'Permanently deletes a feature.',
  })
  @ApiParam({ name: 'id', description: 'UUID of the feature' })
  @ApiNoContentResponse({ description: 'Feature deleted' })
  @ApiNotFoundResponse({ description: 'Feature not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  remove(@Param('id') id: string) {
    return this.featureService.remove(id);
  }
}
```

---

## Step 5 — Write the module file

```typescript
@Module({
  imports: [
    PrismaModule,
    // StorageModule,  ← add this if the feature handles file uploads
  ],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

---

## Step 6 — Register in app.module.ts

```typescript
import { FeatureModule } from './feature/feature.module';

@Module({
  imports: [
    // ... existing modules
    FeatureModule,
  ],
})
export class AppModule {}
```

---

## Step 7 — Verify

```bash
bun run build
```

Zero TypeScript errors required. Then:

1. Start `bun run start:dev`
2. Open http://localhost:3000/api/docs
3. Confirm the new tag and all endpoints appear
4. Test each endpoint via Swagger UI: verify request body, response shape, and error cases

---

## Step 8 — Wire up the frontend (if public endpoint)

If the endpoint is consumed by the Next.js portfolio:
1. Add types to `portfolio-web/src/lib/types/<feature>.ts`
2. Add a fetch function to `portfolio-web/src/lib/api/<feature>.ts`
3. Add to the `Promise.all` in `portfolio-web/src/app/page.tsx`
4. Pass data as props to the relevant section component

If consumed by the Angular admin:
1. Add a method to the relevant service in `portfolio-admin/src/app/core/services/`
2. Call it from the component using `inject(FeatureService)`
