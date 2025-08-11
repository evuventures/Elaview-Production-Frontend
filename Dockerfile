# Elaview Frontend - Multi-stage Dockerfile
# Optimized for both development and production

# Stage 1: Base Node.js environment
FROM node:20-alpine AS base
LABEL maintainer="Elaview Team"
LABEL description="Elaview Frontend React Application"

# Install system dependencies
RUN apk add --no-cache libc6-compat dumb-init

# Set working directory
WORKDIR /app

# Copy package files for better Docker layer caching
COPY frontend/package*.json ./

# Stage 2: Dependencies installation
FROM base AS deps

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Stage 3: Development environment
FROM deps AS development

# Copy source code
COPY frontend/ ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose Vite dev server port
EXPOSE 3000

# Development command with hot reloading
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# Stage 4: Build stage
FROM deps AS builder

# Copy source code
COPY frontend/ ./

# Build the application
RUN npm run build

# Stage 5: Production runtime with Nginx
FROM nginx:alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy custom nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001

# Set proper permissions
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    chown -R nginx-app:nginx-app /etc/nginx/conf.d

# Create nginx PID directory
RUN mkdir -p /var/run/nginx && \
    chown -R nginx-app:nginx-app /var/run/nginx

# Switch to non-root user
USER nginx-app

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]