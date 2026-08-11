# ---------- 1) build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build

# ---------- 2) runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and install production dependencies only
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy compiled JavaScript from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Create directories that will be used as mount points
# These will be overridden by volumes but need to exist
RUN mkdir -p /app/certificates /app/data/temp /app/data/generated-passes && \
    chown -R nodejs:nodejs /app

# Copy assets directory (should exist in repo with .gitkeep)
COPY --chown=nodejs:nodejs ./assets ./assets

# Copy images directory for support page
COPY --chown=nodejs:nodejs ./images ./images

# Switch to non-root user
USER nodejs

# Expose API port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]