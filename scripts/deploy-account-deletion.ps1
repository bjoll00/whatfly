# Deploy Account Deletion Edge Function
Write-Host "Deploying Account Deletion Function..." -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $version = supabase --version
    Write-Host "Supabase CLI found: $version" -ForegroundColor Green
} catch {
    Write-Host "Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Supabase CLI. Please install manually:" -ForegroundColor Red
        Write-Host "   npm install -g supabase" -ForegroundColor Yellow
        exit 1
    }
}

# Check if we're in a Supabase project
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "Not in a Supabase project directory." -ForegroundColor Red
    Write-Host "Please run this script from your project root." -ForegroundColor Yellow
    exit 1
}

# Deploy the function
Write-Host "Deploying delete-account function..." -ForegroundColor Yellow
supabase functions deploy delete-account

if ($LASTEXITCODE -eq 0) {
    Write-Host "Account deletion function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Test the function by:" -ForegroundColor Cyan
    Write-Host "   1. Sign in to your app" -ForegroundColor White
    Write-Host "   2. Go to Settings tab" -ForegroundColor White
    Write-Host "   3. Click 'Delete Account'" -ForegroundColor White
    Write-Host "   4. Follow the confirmation steps" -ForegroundColor White
    Write-Host ""
    Write-Host "Monitor function logs in Supabase Dashboard:" -ForegroundColor Cyan
    Write-Host "   https://supabase.com/dashboard/project/[YOUR_PROJECT]/functions" -ForegroundColor White
} else {
    Write-Host "Failed to deploy function. Check the error above." -ForegroundColor Red
    exit 1
}