import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';

export interface Contract {
    id?: string;
    homeownerId: string;
    homeownerName: string;
    title: string;
    category: 'Full Construction' | 'Renovation' | 'Interior';
    budget: string;
    description: string;
    location: string;
    duration: string;
    status: 'open' | 'active' | 'completed';
    createdAt: number;
    applicantCount: number;
}

export const postContract = async (contract: Omit<Contract, 'id' | 'createdAt' | 'status' | 'applicantCount'>) => {
    try {
        const contractsRef = collection(db, 'contracts');
        const docRef = await addDoc(contractsRef, {
            ...contract,
            status: 'open',
            applicantCount: 0,
            createdAt: Date.now()
        });
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error("Error posting contract:", error);
        throw error;
    }
};

export const getAvailableContracts = async () => {
    try {
        const contractsRef = collection(db, 'contracts');
        const q = query(contractsRef, where('status', '==', 'open'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contract));
    } catch (error) {
        console.error("Error fetching contracts:", error);
        throw error;
    }
};

export const applyForContract = async (contractId: string) => {
    try {
        const contractRef = doc(db, 'contracts', contractId);
        // In a real app, we'd add an entry to an 'applications' subcollection
        // For now, let's just increment applicantCount for the demo
        const currentCount = (await (await getDocs(query(collection(db, 'contracts')))).docs.find(d => d.id === contractId)?.data()?.applicantCount) || 0;
        await updateDoc(contractRef, {
            applicantCount: currentCount + 1
        });
        return { success: true };
    } catch (error) {
        console.error("Error applying for contract:", error);
        throw error;
    }
};
