# Portfolio Backend API

A production-ready NestJS backend API for a dynamic portfolio application with authentication, project management, media uploads, skills tracking, and contact form functionality.

## 🧱 Tech Stack

- **NestJS** (TypeScript) - Progressive Node.js framework
- **Prisma ORM** - Next-generation database ORM
- **PostgreSQL** (Supabase) - Database
- **Swagger/OpenAPI** - API documentation
- **Supabase Storage** - File uploads and storage
- **Brevo (Sendinblue)** - Transactional email service
- **JWT** - Authentication

## 🎯 Core Features

### 1. Authentication (Admin Only)
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected admin routes
- Login and registration endpoints

### 2. Profile Management
Complete CRUD operations for portfolio profile:
- Full name, job title, bio (short & long)
- Profile image and resume PDF URLs
- Social media links (JSON)
- SEO metadata
- Public and admin endpoints

### 3. Project Management
Full project lifecycle management:
- Title, slug, descriptions
- Status (DRAFT/PUBLISHED)
- Display ordering
- Tag associations
- Pagination and filtering
- Public and admin endpoints

### 4. Project Media
Upload and manage project media:
- Image, video, and document support
- Supabase Storage integration
- Cover image designation
- Ordered media galleries
- Automatic file deletion on removal

### 5. Project Links
Manage project-related links:
- GitHub repositories
- Live websites
- Demo URLs
- Figma designs
- Custom links

### 6. Skills & Technologies
Organize and display skills:
- Skill categories (Frontend, Backend, etc.)
- Skill levels (Beginner to Expert)
- Years of experience
- Icon URLs
- Ordered display

### 7. Contact Form
Handle contact submissions:
- Public submission endpoint
- Email notifications to admin
- Confirmation emails to users
- Message storage with metadata (IP, user agent)
- Read/unread status tracking
- Email logs for audit trail

## 📦 Installation

### Prerequisites
- **Bun** (v1.1.34 or higher) - Fast all-in-one JavaScript runtime
  - Install: `curl -fsSL https://bun.sh/install | bash`
  - Or visit: https://bun.sh
- PostgreSQL database (Supabase recommended)
- Supabase account for storage
- Brevo account for emails

> **Note**: This project is configured to use Bun as the package manager. While npm/yarn may work, Bun is recommended for optimal performance.

### Setup Steps

1. **Install dependencies**
```bash
bun install
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (Supabase PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio_db?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_STORAGE_BUCKET=portfolio-media

# Brevo (Sendinblue)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Portfolio Admin
BREVO_ADMIN_EMAIL=admin@yourdomain.com

# CORS
CORS_ORIGIN=http://localhost:4200
```

3. **Generate Prisma Client**
```bash
bun run prisma:generate
```

4. **Run database migrations**
```bash
bun run prisma:migrate
```

Or push schema directly (for development):
```bash
bun run prisma:push
```

5. **Start the development server**
```bash
bun run start:dev
```

The API will be available at:
- API: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/api/docs`

## 🗄️ Database Schema

The Prisma schema includes the following models:

- **AdminUser** - Admin authentication
- **Profile** - Portfolio profile information
- **Project** - Project details
- **ProjectMedia** - Project images/videos/documents
- **ProjectLink** - Project-related links
- **Tag** - Project tags
- **ProjectTag** - Many-to-many relation
- **Skill** - Individual skills
- **SkillCategory** - Skill groupings
- **ContactMessage** - Contact form submissions
- **EmailLog** - Email delivery tracking

### Database Management

```bash
# Open Prisma Studio (visual database editor)
bun run prisma:studio

# Create a new migration
bun run prisma:migrate

# Reset database (⚠️ destructive)
bunx prisma migrate reset
```

## 📘 API Documentation

Once the server is running, visit the Swagger UI for complete API documentation:

**http://localhost:3000/api/docs**

### Quick API Overview

#### Public Endpoints
- `GET /profile/current` - Get current profile
- `GET /projects` - List published projects
- `GET /projects/slug/:slug` - Get project by slug
- `GET /skills/categories/all` - Get all skills with categories
- `POST /contact` - Submit contact form

#### Admin Endpoints (Require JWT Token)
- `POST /auth/register` - Register admin
- `POST /auth/login` - Admin login
- `POST /profile` - Create/update profile
- `POST /projects` - Create project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /project-media` - Upload project media
- `POST /skills` - Create skill
- `POST /skills/categories` - Create skill category
- `GET /contact` - View contact messages
- `PATCH /contact/:id/read` - Mark message as read

### Authentication

1. Register or login to get JWT token:
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "password123"
}
```

2. Use the token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🚀 Deployment

### Build for production

```bash
bun run build
bun run start:prod
```

### Environment Setup

Ensure all environment variables are properly configured in your production environment:

1. Set up PostgreSQL database (Supabase recommended)
2. Configure Supabase Storage bucket
3. Set up Brevo API keys
4. Generate strong JWT secret
5. Configure CORS origins

### Recommended Platforms

- **Vercel** - Easy deployment with GitHub integration
- **Railway** - Full-stack hosting with PostgreSQL
- **Heroku** - Traditional PaaS
- **DigitalOcean App Platform** - Container-based hosting
- **AWS/GCP/Azure** - Enterprise solutions

## 🛠️ Development Scripts

```bash
# Development
bun run start:dev          # Start with hot-reload
bun run start:debug        # Start in debug mode

# Building
bun run build              # Build for production

# Testing
bun test                   # Run unit tests
bun run test:watch         # Run tests in watch mode
bun run test:cov           # Generate coverage report
bun run test:e2e           # Run end-to-end tests

# Code Quality
bun run lint               # Lint and fix code
bun run format             # Format code with Prettier

# Database
bun run prisma:generate    # Generate Prisma Client
bun run prisma:migrate     # Run migrations
bun run prisma:studio      # Open Prisma Studio
bun run prisma:push        # Push schema (development)
```

## 📂 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── dto/               # Data transfer objects
│   │   ├── guards/            # Auth guards
│   │   ├── strategies/        # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── profile/               # Profile management
│   ├── projects/              # Project management
│   ├── project-media/         # Media upload & management
│   ├── skills/                # Skills & categories
│   ├── contact/               # Contact form
│   ├── email/                 # Email service (Brevo)
│   ├── storage/               # Storage service (Supabase)
│   ├── prisma/                # Prisma service
│   ├── common/                # Shared utilities
│   │   └── decorators/        # Custom decorators
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
├── test/                      # E2E tests
├── .env.example               # Environment variables template
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with class-validator
- CORS configuration
- Request rate limiting (recommended to add)
- SQL injection protection (via Prisma)
- XSS protection (sanitize inputs)

## 📝 Notes

- Default admin registration is open. In production, consider closing registration after creating your admin account, or add additional validation.
- Configure rate limiting for public endpoints (contact form) to prevent abuse.
- Set up proper logging and monitoring for production.
- Regular database backups are recommended.
- Keep dependencies updated for security patches.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For issues or questions:
- Check the Swagger documentation
- Review Prisma schema
- Check application logs
- Open an issue on GitHub

---

Built with ❤️ using NestJS
