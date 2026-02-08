import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

export interface Review {
    id?: string;
    workerId: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    comment?: string;
    createdAt: any;
}

/**
 * Submits a rating for a worker
 */
export const submitRating = async (review: Review) => {
    try {
        const reviewsRef = collection(db, 'reviews');

        // Add the review
        await addDoc(reviewsRef, {
            ...review,
            createdAt: serverTimestamp()
        });

        // Update worker's average rating
        const workerRef = doc(db, 'users', review.workerId);
        const workerSnap = await getDoc(workerRef);

        if (workerSnap.exists()) {
            const data = workerSnap.data();
            const currentRating = data.averageRating || 0;
            const currentCount = data.ratingCount || 0;

            const newCount = currentCount + 1;
            const newRating = ((currentRating * currentCount) + review.rating) / newCount;

            await updateDoc(workerRef, {
                averageRating: Number(newRating.toFixed(1)),
                ratingCount: newCount
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error submitting rating:", error);
        throw error;
    }
};

/**
 * Fetches all reviews for a specific worker
 */
export const getWorkerReviews = async (workerId: string) => {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('workerId', '==', workerId));

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Review));
    } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error;
    }
};
