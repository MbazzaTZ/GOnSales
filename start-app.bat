@echo off
echo Starting GoNSales Application...
echo.
echo Opening application in your default browser...
echo.
echo Note: Some features may require a local server for full functionality.
echo For best experience, consider installing Node.js or Python.
echo.

REM Get the current directory
set "CURRENT_DIR=%~dp0"

REM Open the index.html file in the default browser
start "" "%CURRENT_DIR%index.html"

echo Application opened in browser!
echo.
echo Available features:
echo - Security enhancements with rate limiting
echo - Performance optimizations with caching
echo - Accessibility features (click the ♿ button)
echo - Data management and analytics
echo - Monitoring and real-time metrics
echo - Comprehensive testing suite
echo.
echo To run tests, open browser developer tools (F12) and run:
echo window.runAllTests()
echo.
echo To access accessibility settings, click the ♿ button in the top-right corner.
echo.
pause
