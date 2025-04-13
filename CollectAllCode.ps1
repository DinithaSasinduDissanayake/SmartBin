# This script aggregates all code into a single file (all_code.txt) in the current directory.
# It includes the relative path of text files (with content) and the absolute path for non-text files.
# It ignores folders like node_modules, .git, build, and dist.

# Remove output file if it exists
$outputFile = "all_code.txt"
if (Test-Path $outputFile) {
    Remove-Item $outputFile -Force
}

# Define the root directory
$rootDir = Get-Location

# Define what we consider as text-based file extensions (lowercase)
$textExtensions = @(".js", ".jsx", ".css", ".html", ".md", ".json", ".ts", ".tsx", ".gitignore", ".txt")

# Get all files recursively while ignoring specific folders
Get-ChildItem -Recurse -File | Where-Object { 
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.git\\" -and
    $_.FullName -notmatch "\\build\\" -and
    $_.FullName -notmatch "\\dist\\"
} | ForEach-Object {
    # Get relative path
    $relativePath = $_.FullName.Substring($rootDir.Path.Length + 1)
    
    # Check if file extension is in the text-based list (case-insensitive)
    if ($textExtensions -contains $_.Extension.ToLower()) {
        # Write header with relative file path
        Add-Content -Path $outputFile -Value "`n`n========== $relativePath ==========`n`n"
        # Append the content of the text file to the output
        Get-Content $_.FullName | Add-Content -Path $outputFile
    }
    else {
        # For non-text files, write the absolute path and file name
        Add-Content -Path $outputFile -Value "`n`n========== ABSOLUTE: $($_.FullName) ==========`n"
    }
}

Write-Host "All code has been aggregated into $($rootDir.Path)\$outputFile" -ForegroundColor Green