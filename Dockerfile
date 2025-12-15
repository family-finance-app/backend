FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src

RUN npx prisma generate

RUN npm run build

RUN ls -la dist/ && echo "Build completed successfully"

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY prisma ./prisma/
RUN npx prisma generate

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY ./entrypoint.sh ./entrypoint.sh

RUN ls -la dist/ && echo "Files copied to production image"

RUN chmod +x entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["sh", "entrypoint.sh"]