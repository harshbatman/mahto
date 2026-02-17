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
        if (profile.role === 'contractor' && !profile.isProfileSetup) {
            return <Redirect href="/setup-contractor-profile" />;
        }
        // Redirect to the main tabs
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)/welcome" />;
}
