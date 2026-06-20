# Payload CMS Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# === Production ===
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/payload.config.ts ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./

EXPOSE 3001

CMD ["npm", "start"]
