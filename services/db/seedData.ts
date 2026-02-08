import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

/**
 * Script to seed the database with demo Indian profiles
 * Run this by temporarily calling it from a screen or using a button
 */
export const seedDemoProfiles = async () => {
    try {
        const batch = writeBatch(db);
        const usersRef = collection(db, 'users');

        const demoUsers = [
            {
                uid: 'demo_worker_1',
                name: 'Arjun Verma',
                role: 'worker',
                phoneNumber: '9876543210',
                email: 'arjun@mahto.app',
                category: 'Electrician',
                rating: 4.9,
                distance: '1.2 km',
                createdAt: Date.now()
            },
            {
                uid: 'demo_worker_2',
                name: 'Suresh Yadav',
                role: 'worker',
                phoneNumber: '9876543211',
                email: 'suresh@mahto.app',
                category: 'Plumber',
                rating: 4.7,
                distance: '2.5 km',
                createdAt: Date.now()
            },
            {
                uid: 'demo_contractor_1',
                name: 'Vikram construction Co.',
                role: 'contractor',
                phoneNumber: '9876543212',
                email: 'vikram@mahto.app',
                category: 'Civil Contractor',
                rating: 4.8,
                createdAt: Date.now()
            },
            {
                uid: 'demo_shop_1',
                name: 'Mahto Hardware Store',
                role: 'shop',
                phoneNumber: '9876543213',
                email: 'mahto_shop@mahto.app',
                category: 'Hardware & Cement',
                rating: 4.9,
                location: 'Main Market, Delhi',
                createdAt: Date.now()
            }
        ];

        demoUsers.forEach(user => {
            const docRef = doc(usersRef, user.uid);
            batch.set(docRef, user);
        });

        await batch.commit();
        console.log("Demo profiles seeded successfully!");
        return true;
    } catch (error) {
        console.error("Error seeding profiles:", error);
        return false;
    }
};
