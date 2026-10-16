<#
.SYNOPSIS
    Cross-platform / Windows execution helper for Google clasp commands.
.DESCRIPTION
    Bypasses PowerShell script execution policy restrictions on clasp.ps1
    by prioritizing clasp.cmd or falling back to npx @google/clasp.
.EXAMPLE
    .\clasp-runner.ps1 status
    .\clasp-runner.ps1 push
    .\clasp-runner.ps1 deploy --description "v1.0"
#>
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ClaspArgs
)

$claspCmd = Join-Path $env:APPDATA "npm\clasp.cmd"

if (Test-Path $claspCmd) {
    & $claspCmd @ClaspArgs
} elseif (Get-Command clasp.cmd -ErrorAction SilentlyContinue) {
    & clasp.cmd @ClaspArgs
} else {
    Write-Host "[clasp-runner] clasp.cmd not found globally. Running via npx @google/clasp..." -ForegroundColor Yellow
    npx --yes @google/clasp @ClaspArgs
}
