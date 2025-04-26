FROM node:22-alpine

WORKDIR /app

ARG APP_TOKEN
ARG CLIENT_ID
ARG GUILD_ID

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

ENV NODE_ENV=production \
    APP_TOKEN=${APP_TOKEN} \
    CLIENT_ID=${CLIENT_ID} \
    GUILD_ID=${GUILD_ID}

CMD ["yarn", "start"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)"
