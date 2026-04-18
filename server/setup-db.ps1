# Simple PowerShell helper to initialise the database for local development
# Usage: run from project root or server folder as Administrator (if needed)

param(
    [string]$RootPassword = 'password'
)

$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    Write-Error "mysql client not found in PATH. Please install MySQL client or add it to PATH."
    exit 1
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath 'db\init.sql'
if (-not (Test-Path $scriptPath)) {
    $scriptPath = Join-Path -Path (Get-Location) -ChildPath 'server\db\init.sql'
}
if (-not (Test-Path $scriptPath)) {
    Write-Error "init.sql not found. Run this script from the project root or server folder."
    exit 1
}

# Run init SQL using provided root password
Write-Host "Running database initialization script..."
$cmd = "mysql -u root -p$RootPassword < `"$scriptPath`""
Invoke-Expression $cmd
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database initialization finished successfully."
} else {
    Write-Error "Database initialization failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}
