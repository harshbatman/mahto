export const mapErrorToProfessionalMessage = (error: any): string => {
    if (typeof error === 'string') {
        return error;
    }

    const code = error?.code || error?.message || '';

    // Firebase Auth Errors
    if (code.includes('auth/invalid-email')) {
        return "The email address you entered doesn't look quite right. Please check and try again.";
    }
    if (code.includes('auth/user-not-found')) {
        return "We couldn't find an account with that email. Would you like to sign up instead?";
    }
    if (code.includes('auth/wrong-password')) {
        return "The password you entered is incorrect. Please try again or reset your password.";
    }
    if (code.includes('auth/email-already-in-use')) {
        return "An account with this email already exists. Try signing in or use a different email.";
    }
    if (code.includes('auth/weak-password')) {
        return "For your security, please choose a stronger password (at least 6 characters).";
    }
    if (code.includes('auth/network-request-failed')) {
        return "It looks like you're having connection issues. Please check your internet and try again.";
    }
    if (code.includes('auth/too-many-requests')) {
        return "We've noticed too many attempts. Please take a short break and try again later.";
    }
    if (code.includes('auth/user-disabled')) {
        return "This account has been disabled. Please contact our support team for assistance.";
    }
    if (code.includes('auth/operation-not-allowed')) {
        return "We're currently unable to process this request. Please try again in a few moments.";
    }

    // Network Errors
    if (code.includes('Network request failed')) {
        return "Connection lost. Please check your internet and try again.";
    }

    // Generic fallback
    return "Something didn't go as planned. Please try again, and if the issue persists, let us know.";
};
