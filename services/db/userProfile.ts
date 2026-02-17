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
    // Worker specific
    skills?: string[];
    experienceYears?: number;
    about?: string;
    isProfileSetup?: boolean;
    dailyRate?: number;
    isAvailable?: boolean;
    averageRating?: number;
    ratingCount?: number;
    workerBanner?: string;
    // Shop specific
    shopCategories?: string[];
    shopBanner?: string;
    shopLogo?: string;
    shopName?: string;
    shopOwnerName?: string;
    openingTime?: string;
    closingTime?: string;
    isHomeDeliveryAvailable?: boolean;
    yearsInBusiness?: number;
    gstNumber?: string;
    latitude?: number;
    longitude?: number;
    // Contractor specific
    contractorServices?: string[];
    companyName?: string;
    companyLogo?: string;
    companyBanner?: string;
    ownerName?: string;
}

/**
 * Saves or updates a user's role-based profile in Firestore
 */
export const saveUserProfile = async (profile: UserProfile) => {
    try {
        const userRef = doc(db, 'users', profile.uid);
        // Remove undefined fields which Firestore doesn't like
        const cleanProfile = Object.fromEntries(
            Object.entries(profile).filter(([_, v]) => v !== undefined)
        );
        await setDoc(userRef, cleanProfile, { merge: true });
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
