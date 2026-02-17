import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: any;
    link?: string;
}

export const getNotifications = async (userId: string): Promise<Notification[]> => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);

        // If no notifications found, return some dummy data for demo purposes
        if (snapshot.empty) {
            return [
                {
                    id: '1',
                    userId,
                    title: 'Welcome to MAHTO!',
                    message: 'Thanks for joining our community. Complete your profile to get started.',
                    type: 'info',
                    read: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    userId,
                    title: 'Profile Update',
                    message: 'Your profile was successfully updated.',
                    type: 'success',
                    read: true,
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ];
        }

        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
};

export const markNotificationAsRead = async (notificationId: string) => {
    try {
        const ref = doc(db, 'notifications', notificationId);
        await updateDoc(ref, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

export const markAllNotificationsAsRead = async (userId: string) => {
    // Implementation would require batch update or iterating
    // For now, let's keep it simple
    console.log("Marking all as read for", userId);
};
