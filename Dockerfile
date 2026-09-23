FROM artifactory.intra.infineon.com/docker-docker-registry/node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN apk add --no-cache python3 make g++ && corepack enable && corepack prepare pnpm@10 --activate && pnpm install --frozen-lockfile
COPY . .
RUN pnpm generate

FROM artifactory.intra.infineon.com/docker-docker-registry/nginxinc/nginx-unprivileged:stable-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 8080

