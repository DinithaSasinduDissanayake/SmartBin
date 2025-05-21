$inputFile = "develop_vs_main_diff.txt"
$numberOfSlices = 10
$outputFilePrefix = "develop_vs_main_diff_part_"

try {
    Write-Host "Counting lines in $inputFile..."
    $totalLines = 0
    $reader = New-Object System.IO.StreamReader($inputFile)
    try {
        while ($reader.ReadLine() -ne $null) {
            $totalLines++
        }
    }
    finally {
        if ($reader -ne $null) {
            $reader.Close()
            $reader.Dispose()
        }
    }
    Write-Host "Total lines: $totalLines"

    if ($totalLines -eq 0) {
        Write-Error "The file is empty or could not be read properly."
        exit 1
    }

    $linesPerSlice = [Math]::Ceiling($totalLines / $numberOfSlices)
    Write-Host "Lines per slice: $linesPerSlice"

    $currentSlice = 1
    $linesInCurrentSlice = 0
    $fileStreamReader = New-Object System.IO.StreamReader($inputFile)
    $streamWriter = $null

    try {
        while (($line = $fileStreamReader.ReadLine()) -ne $null) {
            if ($linesInCurrentSlice -eq 0) {
                # Start a new slice
                if ($streamWriter -ne $null) {
                    $streamWriter.Close()
                    $streamWriter.Dispose()
                }
                $outputFileName = "${outputFilePrefix}${currentSlice}.txt"
                Write-Host "Creating slice: $outputFileName"
                $streamWriter = New-Object System.IO.StreamWriter($outputFileName)
            }

            $streamWriter.WriteLine($line)
            $linesInCurrentSlice++

            if ($linesInCurrentSlice -ge $linesPerSlice) {
                $linesInCurrentSlice = 0
                $currentSlice++
            }
        }
    }
    finally {
        if ($fileStreamReader -ne $null) {
            $fileStreamReader.Close()
            $fileStreamReader.Dispose()
        }
        if ($streamWriter -ne $null) {
            $streamWriter.Close()
            $streamWriter.Dispose()
        }
    }

    Write-Host "File splitting complete. $numberOfSlices slices created (or fewer if the file was smaller than expected)."

}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
} 