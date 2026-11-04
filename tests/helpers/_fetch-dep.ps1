# One-off helper: fetch an npm package tarball into .testdeps/<name>.tgz
# Usage: powershell -NoProfile -File tests/helpers/_fetch-dep.ps1 jsdom
param([Parameter(Mandatory = $true)][string]$Package)

$ProgressPreference = 'SilentlyContinue'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$dir = Join-Path $root '.testdeps'
New-Item -ItemType Directory -Force $dir | Out-Null

$meta = Invoke-RestMethod "https://registry.npmjs.org/$Package/latest"
$out = Join-Path $dir ("{0}.tgz" -f ($Package -replace '[\\/@]', '_'))
Invoke-WebRequest $meta.dist.tarball -OutFile $out
Write-Output ("saved {0} ({1} bytes)" -f $out, (Get-Item $out).Length)
$meta.dependencies.PSObject.Properties.Name | ForEach-Object { Write-Output $_ }
