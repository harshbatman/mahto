import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

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
    images?: string[];
    dimensionUnit?: 'ft' | 'gaj';
    // Property Details
    length?: string;
    breadth?: string;
    plotSize?: string;
    builtUpArea?: string;
    floors?: string;
    bedrooms?: string;
    kitchens?: string;
    bathrooms?: string;
    hasBasement?: boolean;
    // Work Requirement
    workType?: 'Material + Labour' | 'Labour Only';
    materialQuality?: 'Basic' | 'Standard' | 'Premium';
    // Timeline
    startDate?: number;
    completionDate?: number;
}

export interface Bid {
    id?: string;
    contractId: string;
    contractorId: string;
    contractorName: string;
    contractorPhoto?: string;
    amount: string;
    proposal: string;
    createdAt: number;
    status: 'pending' | 'accepted' | 'rejected';
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
        const q = query(contractsRef, where('status', '==', 'open'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Contract))
            .sort((a, b) => b.createdAt - a.createdAt);
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

export const placeBid = async (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => {
    try {
        // 1. Add bid to 'bids' collection
        const bidsRef = collection(db, 'bids');
        await addDoc(bidsRef, {
            ...bid,
            createdAt: Date.now(),
            status: 'pending'
        });

        // 2. Increment applicantCount on the contract
        const contractRef = doc(db, 'contracts', bid.contractId);
        // Fetch current count safely
        const contractSnap = await (await getDocs(query(collection(db, 'contracts'), where('__name__', '==', bid.contractId)))).docs[0];

        if (contractSnap && contractSnap.exists()) {
            const currentCount = contractSnap.data().applicantCount || 0;
            await updateDoc(contractRef, {
                applicantCount: currentCount + 1
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error placing bid:", error);
        throw error;
    }
};

export const getBiddedContractIds = async (contractorId: string) => {
    try {
        const bidsRef = collection(db, 'bids');
        const q = query(bidsRef, where('contractorId', '==', contractorId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data().contractId as string);
    } catch (error) {
        console.error("Error getting bidded contract IDs:", error);
        throw error;
    }
};

export const getMyBids = async (contractorId: string) => {
    try {
        const bidsRef = collection(db, 'bids');
        const q = query(bidsRef, where('contractorId', '==', contractorId));
        const querySnapshot = await getDocs(q);

        // We also need to fetch contract details for each bid to show in the UI
        const bids = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bid));

        const bidsWithContracts = await Promise.all(bids.map(async (bid) => {
            const contractDoc = await getDocs(query(collection(db, 'contracts'), where('__name__', '==', bid.contractId)));
            const contractData = contractDoc.docs[0]?.data() as Contract;
            return {
                ...bid,
                contractTitle: contractData?.title || 'Unknown Contract',
                contractLocation: contractData?.location || 'Unknown Location',
                contractStatus: contractData?.status || 'unknown'
            };
        }));

        return bidsWithContracts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error getting my bids:", error);
        throw error;
    }
};

export const getMyContracts = async (homeownerId: string) => {
    try {
        const contractsRef = collection(db, 'contracts');
        const q = query(contractsRef, where('homeownerId', '==', homeownerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Contract))
            .sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching my contracts:", error);
        throw error;
    }
};

export const getBidsForContract = async (contractId: string) => {
    try {
        const bidsRef = collection(db, 'bids');
        const q = query(bidsRef, where('contractId', '==', contractId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Bid))
            .sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching bids for contract:", error);
        throw error;
    }
};
