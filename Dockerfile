FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
# .output is self-contained: the server bundle plus the static files it serves.
COPY --from=build /app/.output .output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
