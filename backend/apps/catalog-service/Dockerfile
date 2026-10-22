# Build from repo root:  docker build -f backend/apps/catalog-service/Dockerfile .
FROM oven/bun:1.4 AS base
WORKDIR /app

FROM base AS deps
COPY backend/package.json backend/tsconfig.json ./
COPY backend/libs ./libs
COPY backend/apps/catalog-service ./apps/catalog-service
RUN bun install --production

FROM base
COPY --from=deps /app ./
EXPOSE 3002
CMD ["bun", "run", "apps/catalog-service/src/index.ts"]
