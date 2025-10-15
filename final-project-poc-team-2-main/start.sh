#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status.
set -e

# Change to the backend directory and build the project with Maven
echo "🔨 Building backend..."
cd backend
mvn clean package
sleep 2
echo "✅  Backend assets built →"

cd ..
echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
echo "✅  Frontend assets built →"
cd ..


# Stop any running containers and rebuild the images in detached mode
echo "🐳  Rebuilding & (re)starting containers…"
docker-compose down
docker-compose up --build -d

echo "🚀  Containers are up."
