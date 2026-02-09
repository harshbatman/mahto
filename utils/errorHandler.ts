/**
 * Sanitizes error messages to remove Firebase-specific branding and technical details.
 * Ensures that users do not know the underlying backend infrastructure.
 */
export const sanitizeError = (error: any): string => {
    if (!error) return "An unexpected error occurred.";

    let message = typeof error === 'string' ? error : (error.message || "An unexpected error occurred.");

    // Remove "Firebase: " prefix (common in raw Firebase errors)
    message = message.replace(/^Firebase:\s*/i, '');

    // Remove text in parentheses at the end (usually technical error codes like (auth/weak-password))
    message = message.replace(/\s*\([^)]+\)\.?$/, '');

    // Common Firebase error code mappings for better user experience
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return "Invalid phone number or password. Please try again.";
            case 'auth/email-already-in-use':
                return "This phone number is already registered.";
            case 'auth/weak-password':
                return "Password should be at least 6 characters.";
            case 'auth/network-request-failed':
                return "Network error. Please check your internet connection.";
            case 'auth/too-many-requests':
                return "Too many attempts. Please try again later.";
            case 'storage/unauthorized':
                return "Permission denied for this upload.";
            case 'storage/canceled':
                return "Upload was canceled.";
            default:
                // If we have a code but no custom mapping, just use the cleaned message
                break;
        }
    }

    // Capitalize first letter if it's not
    if (message.length > 0) {
        message = message.charAt(0).toUpperCase() + message.slice(1);
    }

    return message;
};
