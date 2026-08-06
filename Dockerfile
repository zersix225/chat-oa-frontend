FROM node:22-alpine AS build
WORKDIR /app

ENV CI=true

RUN corepack enable  && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . ./

RUN NODE_ENV=production NODE_OPTIONS=--max-old-space-size=4096 pnpm build

FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/.output/ ./

EXPOSE 80

CMD ["node", "/app/server/index.mjs"]
