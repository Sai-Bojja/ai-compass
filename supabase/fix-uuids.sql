-- Script to fix invalid UUIDs in seed.sql
-- Replace all 't' prefixes with 'a' (valid hex character)

-- Use this command in PowerShell:
(Get-Content supabase\seed.sql -Raw) -replace "'t", "'a" | Set-Content supabase\seed.sql -NoNewline

-- Or manually find and replace: 't -> 'a in all UUIDs
