$path = "C:\Users\ayman\projects\habit-tracker\supabase\migrations\combined_full_schema.sql"
$content = [System.IO.File]::ReadAllText($path)
$old = "-- 6. PROFILES TABLE (from 0002_profiles.sql)  " + [char]13 + [char]10 + "-- ============================================================  " + [char]13 + [char]10 + "-- ============================================================" + [char]13 + [char]10 + "-- PROFILES TABLE"
$new = "-- 6. PROFILES TABLE (from 0002_profiles.sql)" + [char]13 + [char]10 + "-- ============================================================" + [char]13 + [char]10 + "--============================================================" + [char]13 + [char]10 + "-- PROFILES TABLE"
$content = $content -replace [regex]::Escape($old), $new
[System.IO.File]::WriteAllText($path, $content)
Write-Host "Done"
