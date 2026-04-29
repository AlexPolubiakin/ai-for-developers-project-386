FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM node:22-alpine AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend ./
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/src/generated ./src/generated
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./prisma.config.ts
COPY --from=frontend-build /app/frontend/dist ../frontend/dist

EXPOSE 3001
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then npx prisma db push; fi; npm run start:prod"]
