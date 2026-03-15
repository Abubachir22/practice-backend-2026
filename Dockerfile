FROM node:18-alpine

WORKDIR /app

COPY src/package.json ./src/package.json

WORKDIR /app/src

RUN npm install --production

COPY src/ /app/src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]

