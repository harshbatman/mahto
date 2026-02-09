import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

export interface JobSkill {
    skillId: string;
    skillName: string;
    count: number;
}

export interface Job {
    id?: string;
    homeownerId: string;
    homeownerName: string;
    title: string;
    category: string; // Maintain for backward compatibility or primary category
    selectedWorkers: JobSkill[];
    paymentType: 'Daily' | 'Monthly';
    wage: string;
    toolsProvided: boolean;
    foodProvided: boolean;
    stayProvided: boolean;
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
        const q = query(jobsRef, where('status', '==', 'open'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Job))
            .sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        throw error;
    }
};

export const getPostedJobs = async (userId: string) => {
    try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('homeownerId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Job))
            .sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching posted jobs:", error);
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
