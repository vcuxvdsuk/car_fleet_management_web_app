FROM node:20-alpine
WORKDIR /app

# Copy package files and install dependencies inside container
COPY package*.json ./
RUN npm install --include=dev

# Copy the rest of the source code
COPY . .

EXPOSE 5173

# Use the dev script from package.json
CMD ["npm", "run", "dev"]
