import { onAuthStateChanged, User } from 'firebase/auth';
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { getUserProfile, UserProfile } from '../services/db/userProfile';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setUser(firebaseUser);
                if (firebaseUser) {
                    const userProfile = await getUserProfile(firebaseUser.uid);
                    setProfile(userProfile);
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.error("Auth context error:", error);
                // Don't crash the whole app if profile fetch fails
                setProfile(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
