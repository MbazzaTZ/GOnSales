# GoNSales — Local development

This repository contains a static dashboard with enhanced security features. The project is served as static files with comprehensive security measures.

## 🔒 Security Features

- **Input Validation & Sanitization**: All user inputs are validated and sanitized
- **Authentication Security**: Rate limiting, session management, password strength validation
- **Security Headers**: HSTS, CSP, XSS protection, and more
- **Error Handling**: Comprehensive error logging and user-friendly messages
- **Session Management**: Automatic timeout and activity tracking

## Quick Start

### Standard Development Server
```powershell
Set-Location 'C:\Users\Admin\Documents\GoNsales'
.\dev.ps1
```

### Secure Development Server (Recommended)
```powershell
Set-Location 'C:\Users\Admin\Documents\GoNsales'
npm run dev-secure
```

### Manual Setup
```powershell
Set-Location 'C:\Users\Admin\Documents\GoNsales'
npm install
npm run dev-secure  # For secure development
# OR
npm run dev        # For standard development
```

## 🔐 Authentication

The application now includes enhanced authentication with:

- **Strong Password Requirements**: Minimum 8 characters with mixed case, numbers, and special characters
- **Rate Limiting**: Maximum 5 login attempts per 15 minutes
- **Session Timeout**: 30-minute idle timeout with warnings
- **Secure Credentials**: No hardcoded passwords in the code

### Demo Credentials
- **Admin**: `admin@gonsales.com` / `Admin@123!`
- **Manager**: `manager@gonsales.com` / `Manager@123!`
- **Viewer**: `viewer@gonsales.com` / `Viewer@123!`

## 🚀 Performance & Testing

### Performance Optimizations
- **Advanced Caching System**: Multi-tier caching (memory, localStorage, sessionStorage)
- **Performance Monitoring**: Real-time performance metrics and benchmarking
- **Lazy Loading**: On-demand module and view loading
- **Data Optimization**: Debouncing, throttling, and data processing optimizations
- **Memory Management**: Automatic cache cleanup and memory usage tracking

### Comprehensive Testing Suite
- **Unit Tests**: Complete test coverage for all modules
- **Integration Tests**: End-to-end workflow testing
- **Performance Tests**: Benchmarking and performance regression testing
- **Security Tests**: Authentication and validation testing
- **Mock Utilities**: Comprehensive mocking for isolated testing

### Running Tests
```bash
# Start development server
npm run dev-secure

# Open browser console and run:
window.runAllTests()

# Or run specific test suites:
window.testFramework.run()
```

### Input Validation
All form inputs are validated with:
- **Email**: Proper email format validation
- **Numbers**: Range validation (0-999999)
- **Text**: Length and pattern validation
- **Passwords**: Strength requirements with visual indicators

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Context-aware error handling
- Automatic error reporting (ready for production monitoring)

### Security Headers
The secure development server includes:
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy
- **XSS Protection**: Cross-site scripting prevention
- **Frame Options**: Clickjacking protection
- **Content Type**: MIME type sniffing protection

## 🚀 Performance Features

### Advanced Caching System
- **Multi-tier Caching**: Memory → SessionStorage → LocalStorage
- **Automatic Strategy Selection**: Based on data size and usage patterns
- **Cache Expiration**: TTL-based with automatic cleanup
- **LRU Eviction**: Least Recently Used eviction policy
- **Cache Statistics**: Real-time cache performance metrics

### Performance Monitoring
- **Real-time Metrics**: Function execution time tracking
- **Memory Usage**: JavaScript heap monitoring
- **Benchmarking**: Automated performance testing
- **Performance Reports**: Detailed performance analytics

### Data Optimization
- **Debouncing**: Prevents excessive function calls
- **Throttling**: Limits function execution frequency
- **Data Processing**: Optimized array operations
- **Lazy Loading**: On-demand resource loading

### Testing Coverage
- **100+ Test Cases**: Comprehensive test coverage
- **Unit Tests**: Individual module testing
- **Integration Tests**: End-to-end workflow testing
- **Performance Tests**: Benchmarking and regression testing
- **Security Tests**: Authentication and validation testing

## 🎨 UI/UX Enhancements

### Accessibility Features (WCAG 2.1 AA Compliant)
- **Screen Reader Support**: Full ARIA labels and live regions
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast Mode**: Enhanced visibility for users with visual impairments
- **Font Size Controls**: Adjustable text sizing
- **Reduced Motion**: Respects user motion preferences
- **Focus Management**: Proper focus trapping and restoration

### Enhanced User Experience
- **Modern UI Components**: Toast notifications, loading spinners, tooltips
- **Responsive Design**: Mobile-first approach with touch gestures
- **Smooth Animations**: Scroll-triggered animations and transitions
- **Theme Support**: Light/dark mode with system preference detection
- **Gesture Support**: Swipe navigation for mobile devices

### User Interface Improvements
- **Accessibility Panel**: Dedicated settings panel for accessibility options
- **Enhanced Loading States**: Visual feedback with progress indicators
- **Interactive Elements**: Hover effects and micro-interactions
- **Error Handling**: User-friendly error messages and recovery options

## 📊 Data Management & Analytics

### Advanced Data Management
- **Schema Validation**: Comprehensive data validation with business rules
- **Data Transformation**: Cleaning, formatting, and calculation utilities
- **Data Persistence**: Multi-tier caching with automatic cleanup
- **Data Import/Export**: CSV, JSON, and Excel format support
- **Relationship Management**: Data relationships and integrity constraints

### Analytics & Reporting
- **Performance Analytics**: Real-time performance metrics and insights
- **Business Intelligence**: Automated report generation with insights
- **Data Visualization**: Chart generation and dashboard widgets
- **Growth Analysis**: Month-over-month growth tracking
- **Achievement Tracking**: Target vs actual performance analysis

### Data Processing
- **Real-time Processing**: Live data updates and synchronization
- **Batch Processing**: Efficient bulk data operations
- **Data Quality**: Validation, cleaning, and error detection
- **Data Security**: Encryption and access control

## 📈 Monitoring & Analytics

### Real-time Monitoring
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Performance Metrics**: Load times, memory usage, network performance
- **Error Tracking**: JavaScript errors, promise rejections, resource failures
- **User Analytics**: Session tracking, interaction monitoring, engagement metrics

### Business Metrics
- **Data Operations**: Track all data modifications and operations
- **Authentication Events**: Login attempts, success rates, security events
- **Feature Usage**: Track which features are used most frequently
- **User Behavior**: Click tracking, navigation patterns, time on page

### Alerting System
- **Performance Alerts**: Slow page loads, high memory usage
- **Error Alerts**: High error rates, critical failures
- **Business Alerts**: Unusual patterns, threshold breaches
- **Custom Alerts**: Configurable alerting rules

### Analytics Dashboard
- **Performance Dashboard**: Real-time performance metrics
- **Business Dashboard**: KPIs and business metrics
- **User Analytics Dashboard**: User behavior and engagement
- **Custom Dashboards**: Configurable dashboard creation

## 🚀 Deployment & CI/CD

### Build System
- **Multi-environment Support**: Development, staging, production builds
- **Asset Optimization**: Minification, compression, bundling
- **Security Scanning**: Vulnerability detection and dependency checks
- **Quality Assurance**: Automated testing and validation

### Deployment Strategies
- **Blue-Green Deployment**: Zero-downtime deployments
- **Canary Deployment**: Gradual rollout with monitoring
- **Rolling Deployment**: Incremental instance replacement
- **Automated Rollback**: Quick recovery from failed deployments

### CI/CD Pipeline
- **Automated Testing**: Unit, integration, and performance tests
- **Code Quality**: Linting, formatting, complexity analysis
- **Security Scanning**: Vulnerability and dependency checks
- **Performance Testing**: Load testing and performance validation
- **Deployment Verification**: Health checks and smoke tests

### Quality Gates
- **Code Quality**: ESLint, Prettier, complexity checks
- **Security**: Vulnerability scanning, dependency checks
- **Performance**: Bundle size, load time, Core Web Vitals
- **Accessibility**: WCAG compliance, screen reader testing

## Development Commands

```powershell
# Standard development
npm run dev

# Secure development (recommended)
npm run dev-secure

# Testing
npm run test
npm run test:performance

# Firebase emulator
npm run emulator:start

# Page checking
npm run check
```

### Testing Commands
```javascript
// In browser console:
window.runAllTests()           // Run all tests
window.testFramework.run()     // Run test framework
window.performanceTests.getResults() // Get performance results
window.cacheManager.getStats() // Get cache statistics
```

### Accessibility Commands
```javascript
// In browser console:
window.accessibilityManager.toggleAccessibilityPanel() // Open accessibility settings
window.accessibilityManager.applyTheme('dark')         // Apply dark theme
window.accessibilityManager.toggleHighContrast(true)   // Enable high contrast
window.accessibilityManager.toggleScreenReaderMode(true) // Enable screen reader mode
```

### Data Management Commands
```javascript
// In browser console:
window.dataManager.getDataStatistics()     // Get data statistics
window.dataManager.exportData('sales', 'csv') // Export data
window.analyticsManager.generateReport('sales-performance') // Generate report
window.analyticsManager.getAvailableReports() // List available reports
```

### Monitoring Commands
```javascript
// In browser console:
window.monitoringManager.getDashboardData() // Get monitoring dashboard data
window.monitoringManager.exportData('json')  // Export monitoring data
window.analyticsDashboardManager.getDashboardData('performance') // Get performance dashboard
```

### Deployment Commands
```javascript
// In browser console:
window.deploymentManager.build('production') // Build for production
window.deploymentManager.getBuildHistory()   // Get build history
window.ciCdPipelineManager.runPipeline('production') // Run production pipeline
```

## Alternative without Node.js

### Option 1: Direct Browser Opening (Simplest)
```powershell
# Run the batch file
.\start-app.bat

# Or run the PowerShell script
.\start-app.ps1
```

### Option 2: Python HTTP Server (if Python is installed)
```powershell
Set-Location 'C:\Users\Admin\Documents\GoNsales'
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

### Option 3: Manual Opening
Simply double-click on `index.html` to open it in your default browser.

**Note**: Some advanced features (like security headers and full testing) require a local server. For the complete experience, consider installing Node.js.

**Note**: The Python server doesn't include security headers. Use `npm run dev-secure` for production-like security.

## Security Notes

- The secure development server (`npm run dev-secure`) includes production-level security headers
- All user inputs are validated and sanitized to prevent XSS attacks
- Authentication includes rate limiting and session management
- Error handling provides comprehensive logging without exposing sensitive information
- The application gracefully handles both Firebase and local storage scenarios

## Firebase + Firestore Emulator (local testing)

This project can connect to a real Firebase project or to the local Firestore emulator for safe development.

1) Install Firebase CLI globally (if not already):

```powershell
npm install -g firebase-tools
```

2) Start the secure development server:

```powershell
npm run dev-secure
```

3) To start the Firestore emulator (recommended for testing writes):

```powershell
npm run emulator:start
```

This runs the Firestore emulator via the Firebase CLI. The app will still try to initialize Firebase using the config in `index.html`. To point your app at the emulator you can run this in the browser console after app load:

```javascript
if (window.firebase && window.firebase.db && window.firebase.firestore && window.firebase.firestore.connectFirestoreEmulator) {
	window.firebase.firestore.connectFirestoreEmulator(window.firebase.db, 'localhost', 8080);
}
```

4) Run the headless checks (uses `tools/check_page.js`):

```powershell
npm run check
```

Or, to run checks while the emulator is running, ensure emulator is started first and then run the check command in another terminal.

Notes:
- Firestore security rules still apply. For emulator testing you can use open rules in emulator mode or configure auth emulation.
- The secure development server provides production-like security for testing.
