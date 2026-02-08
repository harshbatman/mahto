import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    if (user && profile) {
        // Force worker profile setup if not done
        if (profile.role === 'worker' && !profile.isProfileSetup) {
            return <Redirect href="/setup-worker-profile" />;
        }
        if (profile.role === 'shop' && !profile.isProfileSetup) {
            return <Redirect href="/select-shop-category" />;
        }
        // Redirect to the correct dashboard based on role
        return <Redirect href={`/${profile.role}` as any} />;
    }

    return <Redirect href="/(auth)/select-role" />;
}
