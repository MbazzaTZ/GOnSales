const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Security headers configuration
const securityHeaders = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; '),
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Security middleware
function addSecurityHeaders(res) {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
}

// Serve static files with security headers
function serveFile(req, res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }

        addSecurityHeaders(res);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// Create secure server
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    if (filePath === './') {
        filePath = './index.html';
    }

    // Security: Prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 Forbidden</h1>');
        return;
    }

    // Security: Only serve allowed file types
    const ext = path.extname(filePath).toLowerCase();
    if (!mimeTypes[ext] && ext !== '') {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 Forbidden - File type not allowed</h1>');
        return;
    }

    serveFile(req, res, filePath);
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`🔒 Secure GoNSales server running on http://localhost:${PORT}`);
    console.log('Security features enabled:');
    console.log('  ✓ Security headers (HSTS, CSP, XSS protection, etc.)');
    console.log('  ✓ Directory traversal protection');
    console.log('  ✓ File type restrictions');
    console.log('  ✓ Content Security Policy');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down secure server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Error handling
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('Try running on a different port:');
        console.log('PORT=8001 node security-headers.js');
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
