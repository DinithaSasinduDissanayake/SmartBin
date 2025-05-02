# Script to collect specific frontend configuration and component files

$outputFile = "frontend_config_dump.txt"
$basePath = ".\frontend" # Relative path from workspace root

# Clear the output file if it exists
if (Test-Path $outputFile) {
    Clear-Content $outputFile
}

# List of files to collect (relative to the frontend directory)
$files = @(
    "package.json",
    "tailwind.config.js",
    "postcss.config.cjs",
    "vite.config.js",
    "src\index.css",
    "src\main.jsx",
    "src\App.jsx",
    "src\pages\experimental\ShadcnExperimentPage.jsx" # Assuming .jsx
)

# Loop through files, add content to output
foreach ($file in $files) {
    $filePath = Join-Path $basePath $file
    # Use absolute path for Get-Content
    $absoluteFilePath = Resolve-Path $filePath -ErrorAction SilentlyContinue

    if ($absoluteFilePath) {
        Add-Content $outputFile "--- File: $($filePath) ---`n" # Corrected newline
        # Ensure UTF8 encoding is preserved
        Get-Content $absoluteFilePath -Raw | Add-Content $outputFile -Encoding UTF8
        Add-Content $outputFile "`n--- End File: $($filePath) ---`n`n" # Corrected newlines
    } else {
        Add-Content $outputFile "--- File Not Found: $($filePath) ---`n`n" # Corrected newlines
    }
} # Added missing closing brace

Write-Host "Collected specified frontend files into $outputFile" # Corrected string termination