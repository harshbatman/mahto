import { db } from '@/lib/firebase';
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

export interface Message {
    id?: string;
    senderId: string;
    receiverId: string;
    text: string;
    createdAt: any;
}

export interface Chat {
    id: string;
    participants: string[];
    lastMessage: string;
    lastTimestamp: any;
    updatedAt: any;
    otherUser?: {
        name: string;
        photoURL?: string;
    };
}

/**
 * Gets or creates a chat ID for two users
 */
export const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join('_');
};

/**
 * Sends a message
 */
export const sendMessage = async (senderId: string, receiverId: string, text: string) => {
    const chatId = getChatId(senderId, receiverId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    const messageData = {
        senderId,
        receiverId,
        text,
        createdAt: serverTimestamp(),
    };

    // Add message
    await addDoc(messagesRef, messageData);

    // Update chat metadata
    const chatRef = doc(db, 'chats', chatId);
    await setDoc(chatRef, {
        participants: [senderId, receiverId],
        lastMessage: text,
        lastTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }, { merge: true });
};

/**
 * Fetches messages for a chat
 */
export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Message));
        callback(messages);
    });
};

/**
 * Fetches all chats for a user with real-time updates
 */
export const subscribeToMyChats = (userId: string, callback: (chats: Chat[]) => void) => {
    const chatsRef = collection(db, 'chats');
    const q = query(
        chatsRef,
        where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Chat));
        callback(chats);
    });
};
