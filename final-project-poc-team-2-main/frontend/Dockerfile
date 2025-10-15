# Use Node 20 with a Debian-based image
FROM node:20-bullseye-slim

WORKDIR /app

# Copy dependency definitions for caching.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application's source code.
COPY . .

# Expose the port that Vite uses (default 5173, adjust if needed)
EXPOSE 5173

# Start the Vite development server.
CMD ["npm", "run", "dev"]

