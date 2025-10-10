# compress-video.ps1
$input = "public\smartcompanion-video.mp4"
$output = "public\smartcompanion-video-test.mp4"
$final  = "public\smartcompanion-video.mp4"
$targetMB = 100
$found = $false

# Try CRF values (lower = higher quality)
foreach ($crf in 36,34,32,30,28,26,24) {
    Write-Host "Testing CRF=$crf ..."
    ffmpeg -y -i $input -vcodec libx264 -crf $crf -preset medium -acodec aac -b:a 128k $output | Out-Null

    $sizeMB = [math]::Round((Get-Item $output).Length / 1MB, 2)
    Write-Host "Result: $sizeMB MB"

    if ($sizeMB -le $targetMB) {
        Write-Host "Found acceptable CRF=$crf ($sizeMB MB)"
        Remove-Item $final -ErrorAction SilentlyContinue
        Rename-Item $output $final
        $found = $true
        break
    } else {
        Remove-Item $output -ErrorAction SilentlyContinue
    }
}

if (-not $found) {
    Write-Host "No CRF produced a file under $targetMB MB. Try reducing resolution."
}
