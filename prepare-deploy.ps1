# Script untuk prepare backend sebelum deploy
# Jalankan: .\prepare-deploy.ps1

Write-Host "🚀 Preparing SAKO Backend for Deployment..." -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "1️⃣  Checking Node.js version..." -ForegroundColor Yellow
node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found! Install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js OK" -ForegroundColor Green
Write-Host ""

# 2. Install dependencies
Write-Host "2️⃣  Installing production dependencies..." -ForegroundColor Yellow
npm install --production
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# 3. Check .env.production
Write-Host "3️⃣  Checking .env.production..." -ForegroundColor Yellow
if (Test-Path ".env.production") {
    Write-Host "✅ .env.production exists" -ForegroundColor Green
    
    # Validate required variables
    $envContent = Get-Content ".env.production" -Raw
    $required = @(
        "DB_HOST",
        "DB_USER", 
        "DB_PASSWORD",
        "DB_NAME",
        "JWT_SECRET",
        "BASE_URL"
    )
    
    $missing = @()
    foreach ($var in $required) {
        if ($envContent -notmatch "$var=") {
            $missing += $var
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "⚠️  Missing environment variables:" -ForegroundColor Yellow
        $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    } else {
        Write-Host "✅ All required env variables present" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  .env.production not found! Copy from .env.production.example" -ForegroundColor Yellow
}
Write-Host ""

# 4. Create deployment package
Write-Host "4️⃣  Creating deployment package..." -ForegroundColor Yellow

# Files to exclude
$excludeItems = @(
    "node_modules",
    ".git",
    ".env",
    ".env.local",
    "logs",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    "*.zip"
)

# Create temp folder
$tempFolder = "deploy-temp"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Copy files (exclude node_modules, .git, etc)
Write-Host "   Copying files..." -ForegroundColor Gray
Get-ChildItem -Path "." -Exclude $excludeItems | Copy-Item -Destination $tempFolder -Recurse -Force

# Create zip
$zipName = "backend-sako-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Write-Host "   Creating $zipName..." -ForegroundColor Gray
Compress-Archive -Path "$tempFolder\*" -DestinationPath $zipName -Force

# Cleanup temp
Remove-Item $tempFolder -Recurse -Force

$zipSize = (Get-Item $zipName).Length / 1MB
Write-Host "✅ Deployment package created: $zipName ($($zipSize.ToString('F2')) MB)" -ForegroundColor Green
Write-Host ""

# 5. Show deployment checklist
Write-Host "📋 DEPLOYMENT CHECKLIST:" -ForegroundColor Cyan
Write-Host "   [ ] Database sudah dibuat di cPanel" -ForegroundColor White
Write-Host "   [ ] Database user & password sudah dicatat" -ForegroundColor White
Write-Host "   [ ] Database sudah di-import" -ForegroundColor White
Write-Host "   [ ] Node.js app sudah di-setup di cPanel" -ForegroundColor White
Write-Host "   [ ] Environment variables sudah di-set" -ForegroundColor White
Write-Host "   [ ] Upload file $zipName ke cPanel" -ForegroundColor White
Write-Host "   [ ] Extract zip di folder aplikasi" -ForegroundColor White
Write-Host "   [ ] Run 'npm install --production' di cPanel terminal" -ForegroundColor White
Write-Host "   [ ] Start/Restart aplikasi" -ForegroundColor White
Write-Host "   [ ] Test API endpoints" -ForegroundColor White
Write-Host ""

# 6. Next steps
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Login ke cPanel: https://mercury.carihosting.id:2083" -ForegroundColor Yellow
Write-Host "2. Upload $zipName ke folder aplikasi" -ForegroundColor Yellow
Write-Host "3. Extract zip file" -ForegroundColor Yellow
Write-Host "4. Run 'npm install --production' di terminal" -ForegroundColor Yellow
Write-Host "5. Restart Node.js app" -ForegroundColor Yellow
Write-Host "6. Test: https://ridhodwisyahputra.my.id/api/" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Baca DEPLOYMENT-GUIDE.md untuk panduan lengkap!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Preparation complete!" -ForegroundColor Green
