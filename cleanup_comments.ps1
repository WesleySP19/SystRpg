$files = Get-ChildItem -Path . -Recurse -Include *.js,*.html,*.css -File
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    # Remove line comments // (except those starting with //! or /*!)
    $content = $content -replace '(?m)^\s*//(?![!/]).*$', ''
    # Remove block comments /* ... */ (except /** ... */)
    $content = $content -replace '(?s)/\*(?!\*)(.*?)\*/', ''
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}
