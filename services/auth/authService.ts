import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { saveUserProfile, UserProfile } from '../db/userProfile';

/**
 * Registers a new user and creates their role-specific profile in Firestore
 */
export const registerUser = async (email: string, password: string, role: UserProfile['role'], name: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create the profile in Firestore
        await saveUserProfile({
            uid: user.uid,
            role: role,
            name: name,
            email: email,
            createdAt: Date.now()
        });

        return { user, success: true };
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
};

/**
 * Logs in an existing user
 */
export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, success: true };
    } catch (error) {
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
