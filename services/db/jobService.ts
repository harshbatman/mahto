import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';

export interface Job {
    id?: string;
    homeownerId: string;
    homeownerName: string;
    title: string;
    category: string; // Mason, Painter, Electrician, etc.
    wage: string; // Daily wage in ₹
    description: string;
    location: string;
    status: 'open' | 'active' | 'completed';
    createdAt: number;
    applicantCount: number;
}

export const postJob = async (job: Omit<Job, 'id' | 'createdAt' | 'status' | 'applicantCount'>) => {
    try {
        const jobsRef = collection(db, 'jobs');
        const docRef = await addDoc(jobsRef, {
            ...job,
            status: 'open',
            applicantCount: 0,
            createdAt: Date.now()
        });
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error("Error posting job:", error);
        throw error;
    }
};

export const getAvailableJobs = async () => {
    try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('status', '==', 'open'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
    } catch (error) {
        console.error("Error fetching jobs:", error);
        throw error;
    }
};

export const applyForJob = async (jobId: string) => {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        // Simplified for demo: just increment the count
        const jobsRef = collection(db, 'jobs');
        const querySnapshot = await getDocs(query(jobsRef));
        const jobDoc = querySnapshot.docs.find(d => d.id === jobId);
        const currentCount = jobDoc?.data()?.applicantCount || 0;

        await updateDoc(jobRef, {
            applicantCount: currentCount + 1
        });
        return { success: true };
    } catch (error) {
        console.error("Error applying for job:", error);
        throw error;
    }
};
