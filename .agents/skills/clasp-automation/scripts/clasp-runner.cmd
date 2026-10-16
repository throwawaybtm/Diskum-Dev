@echo off
setlocal

rem Clasp runner wrapper for Windows cmd/PowerShell execution
if exist "%APPDATA%\npm\clasp.cmd" (
  call "%APPDATA%\npm\clasp.cmd" %*
) else (
  call npx --yes @google/clasp %*
)
