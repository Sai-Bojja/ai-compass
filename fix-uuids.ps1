$content = Get-Content supabase\seed.sql -Raw
$content = $content -replace "'t1", "'a1"
$content = $content -replace "'t2", "'a2"
$content = $content -replace "'t3", "'a3"
$content = $content -replace "'t4", "'a4"
$content = $content -replace "'t5", "'a5"
$content = $content -replace "'t6", "'a6"
$content = $content -replace "'t7", "'a7"
Set-Content supabase\seed.sql -Value $content -NoNewline
Write-Host "Fixed all invalid UUIDs in seed.sql"
