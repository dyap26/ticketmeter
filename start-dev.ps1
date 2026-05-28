# TicketMeter — Local dev startup script
# Run from the ticketmeter/ root: .\start-dev.ps1

Write-Host "Starting TicketMeter in development mode..." -ForegroundColor Cyan

# Backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Dominic Yap\OneDrive\Desktop\Coding\tickets\ticketmeter\backend"
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
}

Start-Sleep -Seconds 2
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "  API docs: http://localhost:8000/docs" -ForegroundColor Green

# Frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Dominic Yap\OneDrive\Desktop\Coding\tickets\ticketmeter\frontend"
    npm run dev
}

Start-Sleep -Seconds 3
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers." -ForegroundColor Yellow

try {
    Wait-Job $backendJob, $frontendJob
} finally {
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
}
