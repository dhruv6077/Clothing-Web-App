# Exit on error
$ErrorActionPreference = "Stop"

# Build the backend with Maven
Write-Host "Building backend..."
Set-Location -Path "backend"
Invoke-Expression "mvn clean package"
Start-Sleep -Seconds 2

# Return to root directory
Set-Location -Path ".."

Write-Host "Building frontend..."
Set-Location -Path "frontend"
Invoke-Expression "npm install"
Invoke-Expression "npm run build"
Start-Sleep -Seconds 2

# Return to root directory
Set-Location -Path ".."


# Stop running containers and rebuild with Docker Compose
Write-Host "Rebuilding and starting Docker containers..."
Invoke-Expression "docker-compose down"
Start-Sleep -Seconds 3
Invoke-Expression "docker-compose up --build -d"

Write-Host "Done."