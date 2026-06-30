# =================================================================================
# FARMLINK AI - INTERACTIVE DevOps DEPLOYMENT AGENT
# =================================================================================
# This script automates Git pushing, Vercel project linking, Env Var uploads,
# and Supabase Prisma migrations securely on your local system.

Clear-Host
Write-Host "🌾 FarmLink AI Deployment Agent starting..." -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

# Step 1: Git Repository Verification
Write-Host "`n[1/5] Checking Git repository status..." -ForegroundColor Yellow
if (!(Test-Path .git)) {
    Write-Host "Initializing Git..." -ForegroundColor Cyan
    git init
}
git branch -M main

# Step 2: GitHub Repository Setup & Push
Write-Host "`n[2/5] GitHub Repository Synchronization..." -ForegroundColor Yellow
Write-Host "Please ensure you have created an empty repository named 'farmlink-ai' on GitHub first:" -ForegroundColor Cyan
Write-Host "Link: https://github.com/new" -ForegroundColor Cyan

$pushSuccess = $false
while (!$pushSuccess) {
    $confirm = Read-Host "`nHave you created the empty 'farmlink-ai' repo on GitHub? (y/n)"
    if ($confirm -eq 'y' -or $confirm -eq 'yes') {
        Write-Host "Pushing main branch to GitHub..." -ForegroundColor Cyan
        git remote remove origin 2>$null
        git remote add origin https://github.com/skmdshariff143/farmlink-ai.git
        git push -u origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ GitHub push completed successfully!" -ForegroundColor Green
            $pushSuccess = $true
        } else {
            Write-Host "❌ Push failed. If authentication failed, please ensure you are signed into GitHub on this machine or create a PAT." -ForegroundColor Red
            $retry = Read-Host "Would you like to try pushing again? (y/n)"
            if ($retry -ne 'y') { break }
        }
    } else {
        Write-Host "Waiting for you to create the repository..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

# Step 3: Vercel Authentication & Project Linking
Write-Host "`n[3/5] Linking project to Vercel..." -ForegroundColor Yellow
Write-Host "Authenticating Vercel CLI (this will open a browser window)..." -ForegroundColor Cyan
npx vercel login

Write-Host "`nLinking local directory to Vercel project..." -ForegroundColor Cyan
npx vercel link --yes

# Step 4: Supabase Database URL & Env Vars Setup
Write-Host "`n[4/5] Syncing Environment Variables..." -ForegroundColor Yellow
Write-Host "Please retrieve your Supabase Transaction database URL (port 5432)." -ForegroundColor Cyan
Write-Host "Example: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?schema=public" -ForegroundColor Cyan
$dbUrl = Read-Host "`nEnter your Supabase DATABASE_URL"

if ($dbUrl) {
    # Update local .env.local
    $envContent = @"
DATABASE_URL="$dbUrl"
NEXTAUTH_SECRET="farmlink-ai-super-secret-payout-auth-hash-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
"@
    Set-Content -Path .env.local -Value $envContent
    Write-Host "✓ Local .env.local updated." -ForegroundColor Green

    # Upload env vars to Vercel
    Write-Host "Uploading DATABASE_URL to Vercel..." -ForegroundColor Cyan
    $dbUrl | npx vercel env add DATABASE_URL production
    Write-Host "Uploading NEXTAUTH_SECRET to Vercel..." -ForegroundColor Cyan
    "farmlink-ai-super-secret-payout-auth-hash-32" | npx vercel env add NEXTAUTH_SECRET production
    Write-Host "Uploading NEXT_PUBLIC_APP_URL to Vercel..." -ForegroundColor Cyan
    "https://farmlink-ai.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL production
}

# Step 5: Database Migration & Deployment
Write-Host "`n[5/5] Executing database schema migrations & building production bundle..." -ForegroundColor Yellow
Write-Host "Running Prisma migration in Supabase..." -ForegroundColor Cyan
npx prisma generate
npx prisma migrate dev --name init_schema

Write-Host "`nTriggering Vercel production deployment..." -ForegroundColor Cyan
npx vercel --prod --yes

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "🌾 FarmLink AI is now successfully configured for CI/CD and Live!" -ForegroundColor Green
Write-Host "GitHub Repository: https://github.com/skmdshariff143/farmlink-ai" -ForegroundColor Green
Write-Host "Vercel Production: https://farmlink-ai.vercel.app" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
