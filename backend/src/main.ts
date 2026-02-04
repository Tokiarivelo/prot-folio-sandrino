import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('Dynamic Portfolio Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Profile', 'Profile management')
    .addTag('Projects', 'Project management')
    .addTag('Project Media', 'Project media management')
    .addTag('Skills', 'Skills and categories management')
    .addTag('Contact', 'Contact form and messages')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI with download options
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Portfolio API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      // Enable the "Download" link in Swagger UI
      urls: [
        {
          url: '/api/docs-json',
          name: 'Portfolio API',
        },
      ],
    },
    jsonDocumentUrl: '/api/docs-json',
    yamlDocumentUrl: '/api/docs-yaml',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`📄 OpenAPI JSON: http://localhost:${port}/api/docs-json`);
  console.log(`📄 OpenAPI YAML: http://localhost:${port}/api/docs-yaml`);
}

void bootstrap();
