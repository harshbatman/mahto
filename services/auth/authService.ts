import { auth } from '@/lib/firebase';
import { saveUserProfile, UserProfile } from '@/services/db/userProfile';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Helper to convert phone number to a dummy email for Firebase
const formatPhoneAsEmail = (phone: string) => {
    // Removes any non-digit characters and appends a dummy domain
    const cleanPhone = phone.replace(/\D/g, '');
    return `${cleanPhone}@mahto.app`;
};

/**
 * Registers a new user using Phone Number + Password
 */
export const registerUser = async (phone: string, password: string, role: UserProfile['role'], name: string) => {
    try {
        console.log("Starting registration for:", phone);
        const email = formatPhoneAsEmail(phone);

        console.log("Attempting to create Firebase user...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Firebase Auth user created:", user.uid);

        // Create the profile in Firestore
        console.log("Saving user profile to Firestore...");
        try {
            await saveUserProfile({
                uid: user.uid,
                role: role,
                name: name,
                email: email,
                phoneNumber: phone,
                createdAt: Date.now()
            });
            console.log("Firestore profile saved successfully.");
        } catch (dbError) {
            console.error("Firestore error (non-fatal):", dbError);
            // We don't throw here so the user can still be logged in
        }

        return { user, success: true };
    } catch (error: any) {
        console.error("Critical registration error:", error);
        throw error;
    }
};

/**
 * Logs in an existing user using Phone Number + Password
 */
export const loginUser = async (phone: string, password: string) => {
    try {
        const email = formatPhoneAsEmail(phone);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, success: true };
    } catch (error: any) {
        console.error("Error logging in user:", error);
        throw error;
    }
};

/**
 * Logs out the current user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Error logging out:", error);
        throw error;
    }
};
