FROM node:22-alpine AS frontend-builder
WORKDIR /build
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps
COPY client/ ./
ARG VITE_ENTRA_CLIENT_ID
ARG VITE_ENTRA_AUTHORITY
ARG VITE_ENTRA_API_SCOPE
ARG VITE_TURNSTILE_SITE_KEY
RUN npm run build

# Client dev server (Vite with HMR) for `docker compose up`. Compose bind-mounts
# ./client over /app so edits hot-reload; the baked node_modules is preserved by
# an anonymous volume. --host 0.0.0.0 makes Vite reachable from the host.
FROM node:22-alpine AS client-dev
WORKDIR /app
COPY client/package*.json ./
RUN npm ci --legacy-peer-deps
COPY client/ ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM node:22-alpine AS server-deps
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY server/package*.json ./
RUN npm ci --omit=dev

FROM server-deps AS development
COPY server/ .
RUN chown -R app:app /app
USER app
EXPOSE 3001
CMD ["node", "index.js"]

FROM server-deps AS production
COPY server/ .
COPY --from=frontend-builder /build/dist ./public/gunaso
RUN chown -R app:app /app
USER app
EXPOSE 3001
CMD ["node", "index.js"]
