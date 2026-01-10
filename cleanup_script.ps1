# CodeConnect Cleanup Script - LOW + MEDIUM Risk Items
# Generated: 2026-01-10
# Total items: 22 (excluding high-risk database)
# Estimated space savings: ~755 MB

Write-Host "CodeConnect Project Cleanup - LOW + MEDIUM Risk" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Counter for tracking
$deletedCount = 0
$errorCount = 0

# Function to safely delete with confirmation
function Remove-SafeItem {
    param($Path, $Description)
    
    if (Test-Path $Path) {
        try {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            Write-Host "[OK] Deleted: $Description" -ForegroundColor Green
            $script:deletedCount++
        } catch {
            Write-Host "[ERROR] Failed: $Description - $($_.Exception.Message)" -ForegroundColor Red
            $script:errorCount++
        }
    } else {
        Write-Host "[SKIP] Not found: $Description" -ForegroundColor Yellow
    }
}

Write-Host "Starting cleanup..." -ForegroundColor Yellow
Write-Host ""

# ===== LOW RISK ITEMS =====
Write-Host "--- LOW RISK: Build Artifacts ---" -ForegroundColor Cyan
Remove-SafeItem "d:\codeconnect\build" "Root build folder"
Remove-SafeItem "d:\codeconnect\frontend\build" "Frontend build folder"

Write-Host ""
Write-Host "--- LOW RISK: Log Files ---" -ForegroundColor Cyan
Remove-SafeItem "d:\codeconnect\backend.log" "Backend log"
Remove-SafeItem "d:\codeconnect\debug_chat.log" "Debug chat log (root)"
Remove-SafeItem "d:\codeconnect\backend_django\debug_chat.log" "Debug chat log (Django)"

Write-Host ""
Write-Host "--- LOW RISK: Python Cache ---" -ForegroundColor Cyan
Remove-SafeItem "d:\codeconnect\backend_python\__pycache__" "Python bytecode cache"

Write-Host ""
Write-Host "--- LOW RISK: Debug/Test Files ---" -ForegroundColor Cyan
Remove-SafeItem "d:\codeconnect\backend_python\debug_output.txt" "Debug output file"
Remove-SafeItem "d:\codeconnect\backend\testfile.txt" "Backend test file"

# ===== MEDIUM RISK ITEMS =====
Write-Host ""
Write-Host "--- MEDIUM RISK: Test/Debug Scripts ---" -ForegroundColor Cyan
Remove-SafeItem "d:\codeconnect\test_ai.py" "AI test script"
Remove-SafeItem "d:\codeconnect\test_db.py" "Database test script"
Remove-SafeItem "d:\codeconnect\inspect_db.py" "Database inspection script"
Remove-SafeItem "d:\codeconnect\repro_chat.py" "Chat reproduction script"
Remove-SafeItem "d:\codeconnect\verify_mysql.js" "MySQL verification script"
Remove-SafeItem "d:\codeconnect\backend_python\debug_db.py" "Python debug DB script"

Write-Host ""
Write-Host "--- MEDIUM RISK: Duplicate Public Folder ---" -ForegroundColor Cyan
Remove-SafeItem "d:\codeconnect\public" "Root public folder (build artifact)"

Write-Host ""
Write-Host "--- MEDIUM RISK: Uploaded Files ---" -ForegroundColor Cyan
Remove-SafeItem "d:\codeconnect\backend\uploads\1758989128342.pdf" "Upload: PDF 1"
Remove-SafeItem "d:\codeconnect\backend\uploads\1759224706203.pdf" "Upload: PDF 2"
Remove-SafeItem "d:\codeconnect\backend\uploads\1759594991858.pdf" "Upload: PDF 3"
Remove-SafeItem "d:\codeconnect\backend\uploads\1759749896708.txt" "Upload: TXT 1"
Remove-SafeItem "d:\codeconnect\backend\uploads\1759752379143.txt" "Upload: TXT 2"

# Summary
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "Successfully deleted: $deletedCount items" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "Errors encountered: $errorCount items" -ForegroundColor Red
}
Write-Host "=================================================" -ForegroundColor Cyan
