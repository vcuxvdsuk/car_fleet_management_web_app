FROM node:20-bullseye

WORKDIR /app

# Install system dependencies (optional)
RUN apt-get update && apt-get install -y openssl curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --include=dev

# Copy everything
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

# Use ts-node-dev for live TypeScript running
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]
