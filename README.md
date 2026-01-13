# Portfolio - Sandrino

Dynamic portfolio application with a production-ready backend API.

## 📂 Project Structure

- **backend/** - NestJS backend API
  - Authentication (JWT)
  - Profile Management
  - Project Management
  - Media Upload (Supabase)
  - Skills Management
  - Contact Form with Email (Brevo)
  - Full Swagger API Documentation

## Getting Started

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run prisma:generate
npm run prisma:push
npm run start:dev
```

Visit http://localhost:3000/api/docs for API documentation.

See the [backend/README.md](backend/README.md) for complete setup instructions.

