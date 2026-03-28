# ETUK Next.js Production Dockerfile - Emergency Space Optimization
FROM node:20-alpine AS builder
WORKDIR /app

# Combine everything in the builder to minimize intermediate layers
RUN apk add --no-cache libc6-compat openssl && npm install -g bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bunx prisma generate && \
    NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production bun run build && \
    # Remove node_modules and cache immediately AFTER build to free ~1GB
    rm -rf node_modules && \
    bun pm cache rm

# Production image, copy ONLY the standalone results
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL="file:/app/data/etuk.db" \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Install runtime dependencies and setup user/dirs in one layer
RUN apk add --no-cache openssl sqlite && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/data /app/public/uploads /app/.next && \
    chown -R nextjs:nodejs /app && \
    chmod 755 /app/data /app/public/uploads

# Copy essential files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/translations ./src/translations

# Ensure ALL files in /app are owned by nextjs (extra safety for volumes)
USER root
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
