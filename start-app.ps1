# GoNSales Application Launcher
# This script opens the GoNSales application in your default browser

Write-Host "🚀 Starting GoNSales Application..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 Opening application in your default browser..." -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$currentDir = Get-Location

# Open the index.html file in the default browser
$indexPath = Join-Path $currentDir "index.html"
Start-Process $indexPath

Write-Host "✅ Application opened in browser!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Available features:" -ForegroundColor Yellow
Write-Host "  🔒 Security enhancements with rate limiting" -ForegroundColor White
Write-Host "  ⚡ Performance optimizations with caching" -ForegroundColor White
Write-Host "  ♿ Accessibility features (click the ♿ button)" -ForegroundColor White
Write-Host "  📊 Data management and analytics" -ForegroundColor White
Write-Host "  📈 Monitoring and real-time metrics" -ForegroundColor White
Write-Host "  🧪 Comprehensive testing suite" -ForegroundColor White
Write-Host ""
Write-Host "🧪 To run tests:" -ForegroundColor Cyan
Write-Host "  1. Open browser developer tools (F12)" -ForegroundColor White
Write-Host "  2. Go to Console tab" -ForegroundColor White
Write-Host "  3. Run: window.runAllTests()" -ForegroundColor White
Write-Host ""
Write-Host "♿ To access accessibility settings:" -ForegroundColor Cyan
Write-Host "  Click the ♿ button in the top-right corner" -ForegroundColor White
Write-Host ""
Write-Host "📊 To view monitoring dashboard:" -ForegroundColor Cyan
Write-Host "  Run: window.monitoringManager.getDashboardData()" -ForegroundColor White
Write-Host ""
Write-Host "📈 To generate analytics reports:" -ForegroundColor Cyan
Write-Host "  Run: window.analyticsManager.generateReport('sales-performance')" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
