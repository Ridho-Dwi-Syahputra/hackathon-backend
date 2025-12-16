# 🚀 SAKO Backend + ngrok Auto Starter
# Script untuk start backend dan ngrok sekaligus

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SAKO BACKEND + NGROK STARTER" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok installed
Write-Host "🔍 Checking ngrok installation..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Please install ngrok first:" -ForegroundColor Yellow
    Write-Host "   1. Download: https://ngrok.com/download" -ForegroundColor White
    Write-Host "   2. Extract to C:\ngrok (or any folder)" -ForegroundColor White
    Write-Host "   3. Add to PATH or run from that folder" -ForegroundColor White
    Write-Host "   4. Run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ ngrok found!" -ForegroundColor Green
Write-Host ""

# Check if backend is ready
Write-Host "🔍 Checking backend files..." -ForegroundColor Yellow
if (-not (Test-Path "server.js")) {
    Write-Host "❌ server.js not found! Are you in backend folder?" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Red
    Write-Host "   Please create .env file first!" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Backend files OK!" -ForegroundColor Green
Write-Host ""

# Start backend in new window
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🔥 BACKEND SERVER' -ForegroundColor Green; npm start"

Write-Host "✅ Backend starting in new window..." -ForegroundColor Green
Write-Host "⏳ Waiting 10 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if backend is running
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
    Write-Host "   Continuing anyway..." -ForegroundColor Yellow
}

Write-Host ""

# Start ngrok in new window
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🌐 NGROK TUNNEL' -ForegroundColor Cyan; ngrok http 5000"

Write-Host "✅ ngrok starting in new window..." -ForegroundColor Green
Write-Host "⏳ Waiting 5 seconds for ngrok to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Try to get ngrok URL from API
Write-Host ""
Write-Host "🔍 Fetching ngrok URL..." -ForegroundColor Yellow
try {
    $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $publicUrl = $ngrokApi.tunnels[0].public_url
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Your ngrok URL:" -ForegroundColor Cyan
    Write-Host "   $publicUrl" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📱 Update ApiConfig.kt dengan:" -ForegroundColor Cyan
    Write-Host "   private const val BASE_URL = `"$publicUrl/api/`"" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔗 ngrok Web Interface:" -ForegroundColor Cyan
    Write-Host "   http://localhost:4040" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Test URL di browser:" -ForegroundColor Cyan
    Write-Host "   $publicUrl/api/health" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    
    # Copy URL to clipboard
    Set-Clipboard -Value "$publicUrl/api/"
    Write-Host "✅ URL copied to clipboard!" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️  Could not fetch ngrok URL automatically" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Manual steps:" -ForegroundColor Cyan
    Write-Host "   1. Check ngrok window for URL" -ForegroundColor White
    Write-Host "   2. Or open: http://localhost:4040" -ForegroundColor White
    Write-Host "   3. Copy the https://xxx.ngrok-free.app URL" -ForegroundColor White
    Write-Host "   4. Update ApiConfig.kt dengan: YOUR_URL/api/" -ForegroundColor White
}

Write-Host ""
Write-Host "💡 Pro Tips:" -ForegroundColor Cyan
Write-Host "   - Keep both windows running during development" -ForegroundColor White
Write-Host "   - Close windows when done testing" -ForegroundColor White
Write-Host "   - URL akan berubah setiap restart ngrok (free plan)" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to close this window"
