FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate && npx prisma db push && node prisma/seed.js
EXPOSE 3000
CMD ["node", "src/server.js"]
