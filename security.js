// Security utilities and validation functions
// This module handles input validation, sanitization, and security measures

/**
 * Input validation and sanitization utilities
 */
class SecurityUtils {
    /**
     * Sanitize HTML input to prevent XSS attacks
     * @param {string} input - Raw input string
     * @returns {string} - Sanitized string
     */
    static sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid email
     */
    static validateEmail(email) {
        if (typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} - Validation result with score and requirements
     */
    static validatePassword(password) {
        if (typeof password !== 'string') {
            return { isValid: false, score: 0, requirements: [] };
        }

        const requirements = [];
        let score = 0;

        // Length requirement (minimum 8 characters)
        if (password.length >= 8) {
            score += 1;
        } else {
            requirements.push('At least 8 characters');
        }

        // Uppercase letter
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            requirements.push('One uppercase letter');
        }

        // Lowercase letter
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            requirements.push('One lowercase letter');
        }

        // Number
        if (/\d/.test(password)) {
            score += 1;
        } else {
            requirements.push('One number');
        }

        // Special character
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            requirements.push('One special character');
        }

        return {
            isValid: score >= 4, // Require at least 4 out of 5 criteria
            score: score,
            requirements: requirements,
            strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
        };
    }

    /**
     * Validate numeric input
     * @param {any} value - Value to validate
     * @param {object} options - Validation options
     * @returns {object} - Validation result
     */
    static validateNumber(value, options = {}) {
        const { min = -Infinity, max = Infinity, allowDecimals = true, required = true } = options;
        
        if (required && (value === null || value === undefined || value === '')) {
            return { isValid: false, error: 'This field is required' };
        }

        if (!required && (value === null || value === undefined || value === '')) {
            return { isValid: true, value: null };
        }

        const num = allowDecimals ? parseFloat(value) : parseInt(value);
        
        if (isNaN(num)) {
            return { isValid: false, error: 'Must be a valid number' };
        }

        if (num < min) {
            return { isValid: false, error: `Must be at least ${min}` };
        }

        if (num > max) {
            return { isValid: false, error: `Must be at most ${max}` };
        }

        return { isValid: true, value: num };
    }

    /**
     * Validate text input
     * @param {string} value - Text to validate
     * @param {object} options - Validation options
     * @returns {object} - Validation result
     */
    static validateText(value, options = {}) {
        const { minLength = 0, maxLength = Infinity, required = true, pattern = null } = options;
        
        if (required && (!value || value.trim().length === 0)) {
            return { isValid: false, error: 'This field is required' };
        }

        if (!required && (!value || value.trim().length === 0)) {
            return { isValid: true, value: '' };
        }

        const trimmedValue = value.trim();

        if (trimmedValue.length < minLength) {
            return { isValid: false, error: `Must be at least ${minLength} characters` };
        }

        if (trimmedValue.length > maxLength) {
            return { isValid: false, error: `Must be at most ${maxLength} characters` };
        }

        if (pattern && !pattern.test(trimmedValue)) {
            return { isValid: false, error: 'Invalid format' };
        }

        return { isValid: true, value: trimmedValue };
    }

    /**
     * Sanitize and validate form data
     * @param {object} formData - Raw form data
     * @param {object} schema - Validation schema
     * @returns {object} - Sanitized data and validation results
     */
    static validateFormData(formData, schema) {
        const sanitizedData = {};
        const errors = {};
        let isValid = true;

        for (const [field, rules] of Object.entries(schema)) {
            const value = formData[field];
            let validation;

            switch (rules.type) {
                case 'email':
                    validation = this.validateText(value, { required: rules.required });
                    if (validation.isValid && validation.value) {
                        validation = this.validateEmail(validation.value) 
                            ? validation 
                            : { isValid: false, error: 'Invalid email format' };
                    }
                    break;
                case 'password':
                    validation = this.validatePassword(value);
                    if (!validation.isValid) {
                        validation.error = `Password requirements: ${validation.requirements.join(', ')}`;
                    }
                    break;
                case 'number':
                    validation = this.validateNumber(value, rules);
                    break;
                case 'text':
                default:
                    validation = this.validateText(value, rules);
                    break;
            }

            if (validation.isValid) {
                sanitizedData[field] = validation.value;
            } else {
                errors[field] = validation.error;
                isValid = false;
            }
        }

        return { sanitizedData, errors, isValid };
    }
}

/**
 * Enhanced error handling system
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
    }

    /**
     * Log error with context
     * @param {Error|string} error - Error object or message
     * @param {string} context - Context where error occurred
     * @param {object} metadata - Additional metadata
     */
    logError(error, context = 'Unknown', metadata = {}) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context: context,
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : null,
            metadata: metadata,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errorLog.push(errorEntry);
        
        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error(`[${context}]`, errorEntry);
        }

        // In production, you would send this to a monitoring service
        // this.sendToMonitoringService(errorEntry);
    }

    /**
     * Handle and display user-friendly error messages
     * @param {Error|string} error - Error to handle
     * @param {string} context - Context where error occurred
     * @param {boolean} showToast - Whether to show toast notification
     */
    handleError(error, context = 'Unknown', showToast = true) {
        this.logError(error, context);

        let userMessage = 'An unexpected error occurred. Please try again.';

        // Map technical errors to user-friendly messages
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            
            if (message.includes('network') || message.includes('fetch')) {
                userMessage = 'Network error. Please check your connection and try again.';
            } else if (message.includes('permission') || message.includes('unauthorized')) {
                userMessage = 'You do not have permission to perform this action.';
            } else if (message.includes('not found')) {
                userMessage = 'The requested resource was not found.';
            } else if (message.includes('validation') || message.includes('invalid')) {
                userMessage = 'Please check your input and try again.';
            } else if (message.includes('timeout')) {
                userMessage = 'The request timed out. Please try again.';
            }
        }

        if (showToast) {
            showToast(userMessage, 'error');
        }

        return userMessage;
    }

    /**
     * Get recent errors for debugging
     * @param {number} count - Number of recent errors to return
     * @returns {Array} - Recent error entries
     */
    getRecentErrors(count = 10) {
        return this.errorLog.slice(-count);
    }

    /**
     * Clear error log
     */
    clearLog() {
        this.errorLog = [];
    }
}

/**
 * Session management for enhanced security
 */
class SessionManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = Date.now();
        this.setupActivityTracking();
    }

    /**
     * Setup activity tracking to detect idle users
     */
    setupActivityTracking() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        const resetTimer = () => {
            this.lastActivity = Date.now();
        };

        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        // Check for idle every minute
        setInterval(() => {
            this.checkIdle();
        }, 60000);
    }

    /**
     * Check if user is idle and should be logged out
     */
    checkIdle() {
        const now = Date.now();
        const timeSinceActivity = now - this.lastActivity;

        if (timeSinceActivity > this.sessionTimeout && currentUser) {
            this.handleIdleTimeout();
        }
    }

    /**
     * Handle idle timeout
     */
    handleIdleTimeout() {
        console.warn('User session timed out due to inactivity');
        
        // Show warning before logout
        showToast('Your session will expire due to inactivity. Please refresh to continue.', 'warning', 10000);
        
        // Logout after additional grace period
        setTimeout(() => {
            if (currentUser) {
                handleLogout();
                showToast('Session expired. Please log in again.', 'error');
            }
        }, 30000); // 30 second grace period
    }

    /**
     * Extend session timeout
     */
    extendSession() {
        this.lastActivity = Date.now();
    }

    /**
     * Get time until session expires
     * @returns {number} - Milliseconds until expiration
     */
    getTimeUntilExpiration() {
        const timeSinceActivity = Date.now() - this.lastActivity;
        return Math.max(0, this.sessionTimeout - timeSinceActivity);
    }
}

// Initialize global instances
const securityUtils = new SecurityUtils();
const errorHandler = new ErrorHandler();
const sessionManager = new SessionManager();

// Export for use in other modules
window.SecurityUtils = SecurityUtils;
window.ErrorHandler = ErrorHandler;
window.SessionManager = SessionManager;
window.securityUtils = securityUtils;
window.errorHandler = errorHandler;
window.sessionManager = sessionManager;
