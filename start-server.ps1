# Script to start the development server

Write-Host "🚀 Starting Cruel Stack Development Server..." -ForegroundColor Cyan
Write-Host ""

# Clean .next directory
if (Test-Path .next) {
    Write-Host "🧹 Cleaning .next directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
}

# Check if port 3000 is in use
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "⚠️  Port 3000 is in use. Trying to free it..." -ForegroundColor Yellow
    $processId = $port3000.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host "✅ Starting Next.js server..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Server will be available at:" -ForegroundColor Cyan
Write-Host "   Local:   http://localhost:3000" -ForegroundColor White
Write-Host "   Network: http://192.168.1.5:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the server
npm run dev
