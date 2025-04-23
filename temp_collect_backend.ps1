$outputFile = 'c:\y2s2ITP\SmartBin\all_the_backend_code.txt';
$backendRoot = 'c:\y2s2ITP\SmartBin\backend';
$includeDirs = @('src', 'tests');
$includeFiles = @('package.json');

# Clear or create the output file
if (Test-Path $outputFile) { Clear-Content -Path $outputFile } else { New-Item -Path $outputFile -ItemType File -Force | Out-Null }

# Add package.json
$pkgJsonPath = Join-Path $backendRoot $includeFiles[0];
if (Test-Path $pkgJsonPath) {
    Add-Content -Path $outputFile -Value ('// File: ' + $pkgJsonPath);
    Get-Content $pkgJsonPath -Raw | Add-Content -Path $outputFile;
    Add-Content -Path $outputFile -Value ([Environment]::NewLine + [Environment]::NewLine);
}

# Process .js files in specified directories
foreach ($dir in $includeDirs) {
    $currentDir = Join-Path $backendRoot $dir;
    if (Test-Path $currentDir -PathType Container) {
        Get-ChildItem -Path $currentDir -Recurse -Filter *.js | ForEach-Object {
            $filePath = $_.FullName;
            Add-Content -Path $outputFile -Value ('// File: ' + $filePath);
            Get-Content $filePath -Raw | Add-Content -Path $outputFile;
            Add-Content -Path $outputFile -Value ([Environment]::NewLine + [Environment]::NewLine);
        }
    }
}

Write-Host ('Backend code collected into ' + $outputFile)
