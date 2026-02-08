import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Searches for users by role and optionally filters by name/category
 */
export const searchUsers = async (role?: string, searchQuery?: string) => {
    try {
        const usersRef = collection(db, 'users');
        let q = query(usersRef);

        if (role) {
            q = query(usersRef, where('role', '==', role));
        }

        const querySnapshot = await getDocs(q);
        let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            results = results.filter(user =>
                (user.name && user.name.toLowerCase().includes(lowerQuery)) ||
                (user.category && user.category.toLowerCase().includes(lowerQuery))
            );
        }

        return results;
    } catch (error) {
        console.error("Error searching users:", error);
        throw error;
    }
};
