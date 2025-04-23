$outputFile = 'c:\y2s2ITP\SmartBin\all_the_frontend_code.txt';
$frontendRoot = 'c:\y2s2ITP\SmartBin\frontend';
$includeFilesRoot = @('package.json', 'index.html', 'vite.config.js', 'eslint.config.js');
$includeDirs = @('src');
$includeExtensions = @('*.js', '*.jsx', '*.css');

# Clear or create the output file
if (Test-Path $outputFile) { Clear-Content -Path $outputFile } else { New-Item -Path $outputFile -ItemType File -Force | Out-Null }

# Add specific files from the frontend root
foreach ($file in $includeFilesRoot) {
    $filePath = Join-Path $frontendRoot $file;
    if (Test-Path $filePath) {
        Add-Content -Path $outputFile -Value ('// File: ' + $filePath);
        Get-Content $filePath -Raw | Add-Content -Path $outputFile;
        Add-Content -Path $outputFile -Value ([Environment]::NewLine + [Environment]::NewLine);
    }
}

# Process files in specified directories with specific extensions
foreach ($dir in $includeDirs) {
    $currentDir = Join-Path $frontendRoot $dir;
    if (Test-Path $currentDir -PathType Container) {
        Get-ChildItem -Path $currentDir -Recurse -Include $includeExtensions | ForEach-Object {
            $filePath = $_.FullName;
            Add-Content -Path $outputFile -Value ('// File: ' + $filePath);
            Get-Content $filePath -Raw | Add-Content -Path $outputFile;
            Add-Content -Path $outputFile -Value ([Environment]::NewLine + [Environment]::NewLine);
        }
    }
}

Write-Host ('Frontend code collected into ' + $outputFile)
