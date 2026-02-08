import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from your console
const firebaseConfig = {
    apiKey: "AIzaSyDoPGNRRvF2ncxnm76lByRi3qbSrXD1TAw",
    authDomain: "mahto-b8626.firebaseapp.com",
    projectId: "mahto-b8626",
    storageBucket: "mahto-b8626.firebasestorage.app",
    messagingSenderId: "94425344059",
    appId: "1:94425344059:web:afadf0806f41e3baf0d41e",
    measurementId: "G-T54WEHLCP7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
