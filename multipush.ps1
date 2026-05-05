$readmePath = "README.md"
if (-not (Test-Path $readmePath)) {
    New-Item -Path $readmePath -ItemType File -Value "# AM Crochet Project`n`n"
}

for ($i = 1; $i -le 6; $i++) {
    Add-Content -Path $readmePath -Value "- Added project documentation detail update $i.`n"
    git add $readmePath
    git commit -m "docs: Update README with part $i"
    git push
    Start-Sleep -Seconds 3
}
