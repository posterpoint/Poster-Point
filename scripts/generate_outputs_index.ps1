# Scans the outputs/ directory and creates outputsIndex.json
# Run from the repo root (PowerShell)
$root = Resolve-Path .
$outputsDir = Join-Path $root.Path 'outputs'
if (-Not (Test-Path $outputsDir)){
    Write-Error "outputs/ directory not found: $outputsDir"
    exit 1
}
$index = @{}
Get-ChildItem -Path $outputsDir -Recurse -File | Where-Object { $_.Extension -match '\.jpe?g$|\.png$|\.webp$|\.gif$' } | ForEach-Object {
    # Get relative folder under outputs
    $relDir = Split-Path $_.DirectoryName -Parent
    # But we want the folder name relative to outputs directory
    $folderName = $_.DirectoryName.Substring($outputsDir.Length).TrimStart('\','/')
    if ([string]::IsNullOrWhiteSpace($folderName)) { $folderName = '.' }
    if (-not $index.ContainsKey($folderName)) { $index[$folderName] = @() }
    $index[$folderName] += $_.Name
}
# Convert to a normal hashtable for JSON
$jsonable = @{}
foreach ($k in $index.Keys) { $jsonable[$k] = $index[$k] }
$outPath = Join-Path $root.Path 'outputsIndex.json'
$json = $jsonable | ConvertTo-Json -Depth 5
Set-Content -Path $outPath -Value $json -Encoding UTF8
Write-Output "Wrote $outPath" 
