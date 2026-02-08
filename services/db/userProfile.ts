import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    role: 'worker' | 'contractor' | 'homeowner' | 'shop';
    name: string;
    email: string;
    phoneNumber?: string;
    photoURL?: string;
    address?: string;
    createdAt: number;
}

/**
 * Saves or updates a user's role-based profile in Firestore
 */
export const saveUserProfile = async (profile: UserProfile) => {
    try {
        const userRef = doc(db, 'users', profile.uid);
        await setDoc(userRef, profile, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error saving user profile:", error);
        throw error;
    }
};

/**
 * Retrieves user profile data from Firestore
 */
export const getUserProfile = async (uid: string) => {
    try {
        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};
