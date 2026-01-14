# Portfolio - Sandrino

Dynamic portfolio application with a production-ready backend API built with Bun and NestJS.

## 📂 Project Structure

- **backend/** - NestJS backend API (with Bun)
  - Authentication (JWT)
  - Profile Management
  - Project Management
  - Media Upload (Supabase)
  - Skills Management
  - Contact Form with Email (Brevo)
  - Full Swagger API Documentation

## Getting Started

**Prerequisites**: Install Bun - `curl -fsSL https://bun.sh/install | bash`

```bash
cd backend
bun install
cp .env.example .env
# Configure your .env file
bun run prisma:generate
bun run prisma:push
bun run start:dev
```

Visit http://localhost:3000/api/docs for API documentation.

See the [backend/README.md](backend/README.md) for complete setup instructions.

