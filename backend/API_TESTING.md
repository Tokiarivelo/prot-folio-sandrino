# API Testing Guide

This guide provides examples for testing all API endpoints using cURL, Postman, or any HTTP client.

## Authentication

### 1. Register Admin User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "fullName": "Admin User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "fullName": "Admin User"
  }
}
```

**Save the `access_token` for authenticated requests!**

### 3. Get Current User

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Profile Management

### Create Profile

```bash
curl -X POST http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "jobTitle": "Full Stack Developer",
    "shortBio": "Passionate developer with 5 years of experience",
    "longBio": "Detailed biography...",
    "profileImageUrl": "https://example.com/profile.jpg",
    "resumePdfUrl": "https://example.com/resume.pdf",
    "socialLinks": {
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "https://twitter.com/johndoe"
    },
    "seoMetadata": {
      "title": "John Doe - Portfolio",
      "description": "Full Stack Developer Portfolio",
      "keywords": ["developer", "portfolio", "react", "nodejs"]
    }
  }'
```

### Get Current Profile (Public)

```bash
curl -X GET http://localhost:3000/profile/current
```

### Update Profile

```bash
curl -X PATCH http://localhost:3000/profile/PROFILE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "Senior Full Stack Developer"
  }'
```

## Projects

### Create Project

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-commerce Platform",
    "slug": "e-commerce-platform",
    "shortDescription": "A modern e-commerce solution",
    "fullDescription": "Complete description...",
    "status": "PUBLISHED",
    "displayOrder": 1,
    "tags": ["React", "Node.js", "PostgreSQL"]
  }'
```

### Get All Projects (Public)

```bash
# All projects
curl -X GET http://localhost:3000/projects

# Filter by status
curl -X GET "http://localhost:3000/projects?status=PUBLISHED"

# With pagination
curl -X GET "http://localhost:3000/projects?page=1&limit=10"
```

### Get Project by Slug (Public)

```bash
curl -X GET http://localhost:3000/projects/slug/e-commerce-platform
```

### Update Project

```bash
curl -X PATCH http://localhost:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PUBLISHED",
    "tags": ["React", "TypeScript", "Node.js"]
  }'
```

### Delete Project

```bash
curl -X DELETE http://localhost:3000/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Media

### Upload Media

```bash
curl -X POST http://localhost:3000/project-media \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "projectId=PROJECT_ID" \
  -F "fileType=IMAGE" \
  -F "isCover=true" \
  -F "caption=Project screenshot" \
  -F "order=0"
```

### Get Project Media

```bash
# All media
curl -X GET http://localhost:3000/project-media

# Filter by project
curl -X GET "http://localhost:3000/project-media?projectId=PROJECT_ID"
```

### Update Media Metadata

```bash
curl -X PATCH http://localhost:3000/project-media/MEDIA_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isCover": false,
    "order": 1
  }'
```

### Delete Media

```bash
curl -X DELETE http://localhost:3000/project-media/MEDIA_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Skills

### Create Skill Category

```bash
curl -X POST http://localhost:3000/skills/categories \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend",
    "order": 0
  }'
```

### Create Skill

```bash
curl -X POST http://localhost:3000/skills \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "CATEGORY_ID",
    "name": "React",
    "level": "ADVANCED",
    "yearsExperience": 5,
    "iconUrl": "https://example.com/react-icon.png",
    "order": 0
  }'
```

### Get All Categories with Skills (Public)

```bash
curl -X GET http://localhost:3000/skills/categories/all
```

### Get Skills by Category

```bash
curl -X GET "http://localhost:3000/skills?categoryId=CATEGORY_ID"
```

### Update Skill

```bash
curl -X PATCH http://localhost:3000/skills/SKILL_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "EXPERT",
    "yearsExperience": 6
  }'
```

## Contact

### Submit Contact Form (Public)

```bash
curl -X POST http://localhost:3000/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Project Inquiry",
    "message": "I would like to discuss a project..."
  }'
```

### Get All Messages (Admin)

```bash
# All messages
curl -X GET http://localhost:3000/contact \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by read status
curl -X GET "http://localhost:3000/contact?isRead=false" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With pagination
curl -X GET "http://localhost:3000/contact?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Message by ID

```bash
curl -X GET http://localhost:3000/contact/MESSAGE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Mark as Read

```bash
curl -X PATCH http://localhost:3000/contact/MESSAGE_ID/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Delete Message

```bash
curl -X DELETE http://localhost:3000/contact/MESSAGE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Complete Workflow Example

### 1. Setup and Authentication

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "pass123", "fullName": "Admin"}'

# Login and save token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "pass123"}' \
  | jq -r '.access_token')
```

### 2. Create Profile

```bash
curl -X POST http://localhost:3000/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "jobTitle": "Developer",
    "shortBio": "Passionate developer"
  }'
```

### 3. Create Skills

```bash
# Create category
CATEGORY_ID=$(curl -X POST http://localhost:3000/skills/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Frontend", "order": 0}' \
  | jq -r '.id')

# Create skill
curl -X POST http://localhost:3000/skills \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": \"$CATEGORY_ID\",
    \"name\": \"React\",
    \"level\": \"ADVANCED\"
  }"
```

### 4. Create Project

```bash
PROJECT_ID=$(curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project",
    "slug": "my-project",
    "shortDescription": "A great project",
    "status": "PUBLISHED",
    "tags": ["React", "Node.js"]
  }' \
  | jq -r '.id')
```

### 5. Upload Media

```bash
curl -X POST http://localhost:3000/project-media \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./screenshot.jpg" \
  -F "projectId=$PROJECT_ID" \
  -F "fileType=IMAGE" \
  -F "isCover=true"
```

## Testing with Postman

1. Import the collection from Swagger:
   - Go to http://localhost:3000/api/docs
   - Click on "Get Postman Collection" or export OpenAPI spec
   - Import into Postman

2. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: Your JWT token from login

3. Use `{{base_url}}` and `{{token}}` in requests

## Common Response Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Tips

1. **Use Swagger UI**: Visit http://localhost:3000/api/docs for interactive testing
2. **Save Token**: Store the JWT token from login for subsequent requests
3. **Check Logs**: View server logs for detailed error messages
4. **Use jq**: Parse JSON responses with `jq` tool
5. **Postman Collections**: Export from Swagger for easier testing

---

Happy testing! 🚀
