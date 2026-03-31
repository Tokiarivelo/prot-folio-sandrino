import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Multi-origin CORS: supports comma-separated CORS_ORIGIN for multiple frontends
  // e.g. CORS_ORIGIN=http://localhost:4000,http://localhost:4200
  const rawOrigin = process.env.CORS_ORIGIN || '';
  const allowedOrigins = rawOrigin
    ? rawOrigin
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription(
      `## Dynamic Portfolio Backend API

All text, images, and data for the public portfolio are served from this API.
The Supabase PostgreSQL database stores all content. Files (images, PDFs) are stored in Supabase Storage.

### Authentication
Protected endpoints require a Bearer JWT token obtained from \`POST /auth/login\`.

### Public vs Admin endpoints
- **Public**: No auth required — used by the Next.js public portfolio
- **Admin**: Require Bearer JWT — used by the Angular admin dashboard

### File Upload
File upload endpoints accept \`multipart/form-data\`. Uploaded files are stored in Supabase Storage and returned as public CDN URLs.

### Pagination
List endpoints support \`?page=1&limit=10\` query parameters. Responses include a \`meta\` object with total count and page info.`,
    )
    .setVersion('1.0')
    .setContact('Sandrino', '', 'admin@portfolio.dev')
    .addServer(
      `http://localhost:${process.env.PORT || 3000}`,
      'Local Development',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter the JWT token obtained from POST /auth/login',
        in: 'header',
      },
      'bearer', // changed to 'bearer' instead of 'access-token' so it matches @ApiBearerAuth() default
    )
    .addTag('Auth', 'Admin authentication — login, register, and current user')
    .addTag(
      'Profile',
      'Portfolio owner profile — bio, image, social links, theme config',
    )
    .addTag('Projects', 'Project portfolio — CRUD with tags, media, and links')
    .addTag(
      'Project Media',
      'File uploads for project images, videos, and documents',
    )
    .addTag('Tags', 'Project tags — used for filtering on the public portfolio')
    .addTag('Skills', 'Technical skills organized by category')
    .addTag('Contact', 'Contact form submissions and admin message management')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Portfolio API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    jsonDocumentUrl: '/api/docs-json',
    yamlDocumentUrl: '/api/docs-yaml',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI:             http://localhost:${port}/api/docs`);
  console.log(
    `📄 OpenAPI JSON:           http://localhost:${port}/api/docs-json`,
  );
}

void bootstrap();
