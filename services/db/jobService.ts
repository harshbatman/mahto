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

export interface JobApplication {
    id?: string;
    jobId: string;
    workerId: string;
    workerName: string;
    workerPhoto?: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: number;
    jobTitle?: string;
    jobLocation?: string;
}

export const applyForJob = async (jobId: string, workerId: string, workerProfile: any) => {
    try {
        // 1. Create the application record
        const applicationsRef = collection(db, 'jobApplications');

        // Check if already applied
        const q = query(applicationsRef, where('jobId', '==', jobId), where('workerId', '==', workerId));
        const existing = await getDocs(q);
        if (!existing.empty) {
            throw new Error("You have already applied for this job.");
        }

        await addDoc(applicationsRef, {
            jobId,
            workerId,
            workerName: workerProfile.name || 'Worker',
            workerPhoto: workerProfile.photoURL || '',
            status: 'pending',
            createdAt: Date.now()
        });

        // 2. Increment the applicant count on the job
        const jobRef = doc(db, 'jobs', jobId);
        const jobSnap = await (await getDocs(query(collection(db, 'jobs'), where('__name__', '==', jobId)))).docs[0];

        if (jobSnap && jobSnap.exists()) {
            const currentCount = jobSnap.data().applicantCount || 0;
            await updateDoc(jobRef, {
                applicantCount: currentCount + 1
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error applying for job:", error);
        throw error;
    }
};

export const getAppliedJobIds = async (workerId: string) => {
    try {
        const applicationsRef = collection(db, 'jobApplications');
        const q = query(applicationsRef, where('workerId', '==', workerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data().jobId as string);
    } catch (error) {
        console.error("Error getting applied job IDs:", error);
        throw error;
    }
};

export const getMyJobApplications = async (workerId: string) => {
    try {
        const applicationsRef = collection(db, 'jobApplications');
        const q = query(applicationsRef, where('workerId', '==', workerId));
        const querySnapshot = await getDocs(q);

        const applications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobApplication));

        // Fetch job details for each application
        const applicationsWithJobs = await Promise.all(applications.map(async (app) => {
            const jobDoc = await (await getDocs(query(collection(db, 'jobs'), where('__name__', '==', app.jobId)))).docs[0];
            const jobData = jobDoc?.data() as Job;
            return {
                ...app,
                jobTitle: jobData?.title || 'Unknown Job',
                jobLocation: jobData?.location || 'Unknown Location',
                jobStatus: jobData?.status || 'unknown'
            };
        }));

        return applicationsWithJobs.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching my job applications:", error);
        throw error;
    }
};
export const getJobApplicationsForJob = async (jobId: string) => {
    try {
        const applicationsRef = collection(db, 'jobApplications');
        const q = query(applicationsRef, where('jobId', '==', jobId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as JobApplication))
            .sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching job applications for job:", error);
        throw error;
    }
};
