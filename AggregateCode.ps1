# Script to aggregate code files from a specified folder within a Git repository,
# respecting .gitignore rules. Output is saved to a text file.

param (
    # Relative path from the Git repository root to the folder to process.
    # Example: "backend" or "src/components". Use "." for the repository root.
    [string]$TargetFolderInRepo = "backend",

    # Name of the output file. This file will be created in the directory
    # from which the script is executed.
    [string]$OutputFile = "aggregated_backend_code.txt"
)

$ErrorActionPreference = "Stop" # Exit on script errors

# --- 1. Determine Paths and Validate ---
$gitRepoRoot = ""
try {
    # Get the top-level directory of the Git repository
    $gitRepoRoot = git rev-parse --show-toplevel
    Write-Host "Git repository root: $gitRepoRoot"
} catch {
    Write-Error "ERROR: Not a Git repository (or any of the parent directories)."
    Write-Error "This script relies on '''git ls-files''' and must be run from within a Git repository checkout."
    exit 1
}

# Construct the absolute path to the target folder within the repo
$AbsoluteTargetFolder = Join-Path -Path $gitRepoRoot -ChildPath $TargetFolderInRepo
# Handle '.' as repo root explicitly for Test-Path, Join-Path normally handles it.
if ($TargetFolderInRepo -eq "." -or $TargetFolderInRepo -eq "./" -or $TargetFolderInRepo -eq ".\") {
    $AbsoluteTargetFolder = $gitRepoRoot
}

if (-not (Test-Path -Path $AbsoluteTargetFolder -PathType Container)) {
    Write-Error "ERROR: Target folder '$AbsoluteTargetFolder' (specified as '$TargetFolderInRepo' relative to repo root) does not exist or is not a directory."
    exit 1
}
Write-Host "Processing target folder: $AbsoluteTargetFolder"

# Determine absolute path for the output file (in the current execution directory)
$currentExecutionPath = Get-Location
$AbsoluteOutputFile = Join-Path -Path $currentExecutionPath.Path -ChildPath $OutputFile
Write-Host "Output will be saved to: $AbsoluteOutputFile"

# Clean up existing output file
if (Test-Path $AbsoluteOutputFile) {
    Remove-Item $AbsoluteOutputFile
    Write-Host "Removed existing output file: $AbsoluteOutputFile"
}

# --- 2. List Files with Git ---
# '''git ls-files''' paths are relative to the repository root.
# We run it from the repo root to ensure correct path interpretation for $TargetFolderInRepo.
$filesToAggregate = @()
Push-Location $gitRepoRoot # Change current directory to Git repository root
try {
    $pathSpec = $TargetFolderInRepo

    Write-Host "Listing non-ignored files in pathspec '$pathSpec' relative to repository root..."
    # --cached: Files tracked by Git
    # --others: Untracked files (REMOVED to only include tracked files)
    # --exclude-standard: Respect .gitignore, .git/info/exclude, and global gitignore
    # The '--' signifies the end of options and the beginning of pathspecs.
    $filesToAggregate = git ls-files --cached --exclude-standard -- $pathSpec

    if ($null -eq $filesToAggregate -or $filesToAggregate.Count -eq 0) {
        Write-Host "No files found in '$TargetFolderInRepo' (within repo '$gitRepoRoot') that are not ignored by Git."
        # Create an empty output file if no files are found
        New-Item -ItemType File -Path $AbsoluteOutputFile -Force -Value "No processable files found in '$TargetFolderInRepo' after applying .gitignore rules." | Out-Null
        Write-Host "Empty/Informational output file created at $AbsoluteOutputFile"
        Pop-Location # Return to original location before exiting
        exit 0
    }
    Write-Host "Found $($filesToAggregate.Count) file(s) to aggregate from '$TargetFolderInRepo'."

} catch {
    Write-Error "ERROR: Failed to execute '''git ls-files'''. Ensure Git is installed and accessible on your PATH."
    Write-Error "Original Error Message: $($_.Exception.Message)"
    # Pop-Location is in the finally block
    exit 1
}
finally {
    Pop-Location # Always return to the original directory from which the script was run
}


# --- 3. Aggregate File Contents ---
Write-Host "Aggregating files into $AbsoluteOutputFile..."
foreach ($fileRelToRepoRoot in $filesToAggregate) {
    # $fileRelToRepoRoot is already relative to the repo root (e.g., "backend/file.js" or "src/main.py")
    $fileFullPath = Join-Path -Path $gitRepoRoot -ChildPath $fileRelToRepoRoot

    # Double-check it'''s not the output file itself. This is an edge case,
    # unlikely if $OutputFile is a simple name and $TargetFolderInRepo doesn'''t overlap strangely with the execution directory.
    if ($fileFullPath -eq $AbsoluteOutputFile) {
        Write-Host "Skipping output file itself: $fileFullPath (this should be rare)"
        continue
    }

    # Ensure it'''s a file and not a directory/symlink etc. (git ls-files should only list files)
    if (-not (Test-Path -Path $fileFullPath -PathType Leaf)) {
        Write-Warning "SKIPPING: Item listed by git is not a file: $fileFullPath"
        continue
    }

    try {
        # The header uses the path relative to the repo root, which clearly identifies the file.
        Add-Content -Path $AbsoluteOutputFile -Value "--- START OF FILE: $fileRelToRepoRoot ---"
        
        # Read content as bytes to preserve encoding, then convert to UTF-8 string.
        # -Raw reads the entire file content as a single string, preserving newlines.
        $fileContentBytes = Get-Content -Path $fileFullPath -AsByteStream -Raw
        $fileContentString = [System.Text.Encoding]::UTF8.GetString($fileContentBytes)
        Add-Content -Path $AbsoluteOutputFile -Value $fileContentString
        
        Add-Content -Path $AbsoluteOutputFile -Value "--- END OF FILE: $fileRelToRepoRoot ---`n" # Extra newline for separation
        # Write-Host "Added: $fileRelToRepoRoot" # Uncomment for verbose per-file logging
    } catch {
        Write-Warning "WARNING: Could not read or append file '$fileFullPath'. Error: $($_.Exception.Message)"
    }
}

Write-Host "Aggregation complete. Output saved to: $AbsoluteOutputFile" 