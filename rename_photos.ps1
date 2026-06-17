# 照片重命名脚本
# 将 "plaza-juan-baron (N).jpg" 重命名为 "plaza-juan-baron-N.jpg"

Get-ChildItem "plaza-juan-baron (*).jpg" | ForEach-Object {
    $newName = $_.Name -replace ' ', '' -replace '\(', '-' -replace '\)', ''
    Rename-Item $_.FullName $newName -Force
    Write-Host "Renamed: $($_.Name) -> $newName"
}

Write-Host "All files renamed successfully!"
