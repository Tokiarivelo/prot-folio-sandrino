# Quick Setup Guide

## Prerequisites

1. **Bun** v1.1.34+ installed
   - Install: `curl -fsSL https://bun.sh/install | bash`
   - Or visit: https://bun.sh
2. **PostgreSQL** database (Supabase recommended)
3. **Supabase** account for storage
4. **Brevo** (Sendinblue) account for emails

> **Note**: This project uses Bun as the package manager for faster installs and better performance.

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
bun install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Application
NODE_ENV=development
PORT=3008

# Database - Get from Supabase Project Settings -> Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT - Generate a secure random string
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# Supabase - Get from Project Settings -> API
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=[YOUR-SUPABASE-ANON-KEY]
SUPABASE_STORAGE_BUCKET=portfolio-media

# Brevo - Get from Brevo dashboard
BREVO_API_KEY=[YOUR-BREVO-API-KEY]
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Portfolio Admin
BREVO_ADMIN_EMAIL=admin@yourdomain.com

# CORS
CORS_ORIGIN=http://localhost:4200
```

### 3. Set Up Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `portfolio-media`
3. Set bucket to **Public** (or configure policies as needed)

### 4. Generate Prisma Client

```bash
bun run prisma:generate
```

### 5. Push Database Schema

```bash
bun run prisma:push
```

This will create all tables in your database.

### 6. Start Development Server

```bash
bun run start:dev
```

The server will start at `http://localhost:3008`

### 7. Access API Documentation

Open your browser and go to:

```
http://localhost:3008/api/docs
```

This is the Swagger UI with complete API documentation.

### 8. Register First Admin User

Using the Swagger UI or any API client:

```bash
POST http://localhost:3008/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword123",
  "fullName": "Admin User"
}
```

### 9. Login to Get JWT Token

```bash
POST http://localhost:3008/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

Response will include an `access_token`. Use it in subsequent requests:

```
Authorization: Bearer [YOUR_ACCESS_TOKEN]
```

## Common Issues

### Issue: Prisma Client Not Generated

**Solution:**

```bash
bun run prisma:generate
```

### Issue: Database Connection Error

**Solution:**

- Verify DATABASE_URL is correct
- Check Supabase database is running
- Ensure IP is allowed in Supabase settings

### Issue: Email Not Sending

**Solution:**

- Verify BREVO_API_KEY is valid
- Check sender email is verified in Brevo
- Look at application logs for detailed errors

### Issue: File Upload Failing

**Solution:**

- Verify SUPABASE_URL and SUPABASE_KEY
- Ensure storage bucket exists and is accessible
- Check bucket permissions

## Production Deployment

For production deployment:

1. **Set NODE_ENV=production**
2. **Use strong JWT_SECRET**
3. **Configure proper CORS_ORIGIN**
4. **Set up SSL/TLS**
5. **Use production database**
6. **Enable rate limiting** (recommended)
7. **Set up monitoring and logging**

## Useful Commands

```bash
# Development
bun run start:dev       # Start with hot reload
bun run start:debug     # Start in debug mode

# Production
bun run build           # Build for production
bun run start:prod      # Run production build

# Database
bun run prisma:studio   # Open database GUI
bun run prisma:migrate  # Create migration

# Testing
bun test               # Run tests
bun run test:e2e       # Run e2e tests

# Code Quality
bun run lint           # Lint code
bun run format         # Format code
```

## Next Steps

1. Create your profile via API
2. Add projects with media
3. Set up skills and categories
4. Test contact form
5. Integrate with frontend application

## Support

For issues or questions:

- Check the main [README.md](README.md)
- Review [Swagger documentation](http://localhost:3008/api/docs)
- Check application logs
- Review Prisma schema

---

Happy coding! 🚀
