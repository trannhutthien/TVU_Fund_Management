# Script to restart backend server
Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan

# Stop all node processes
Write-Host "🛑 Stopping existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Set-Location -Path "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "✅ Backend server is starting in a new window!" -ForegroundColor Green
Write-Host "📝 Check the new PowerShell window for server logs" -ForegroundColor Cyan
