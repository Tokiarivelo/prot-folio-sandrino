# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build for production (uses environment.prod.ts)
RUN npm run build -- --configuration=production

# ─── Stage 2: Production (nginx) ──────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy Angular dist output
COPY --from=builder /app/dist/portfolio-admin/browser /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
