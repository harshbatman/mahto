import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import ContractorDashboard from '../contractor';
import HomeownerDashboard from '../homeowner';
import MyShopScreen from '../my-shop';
import WorkerDashboard from '../worker';

export default function HomeTab() {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!profile) return null;

    // Render the appropriate dashboard based on role
    switch (profile.role) {
        case 'homeowner':
            return <HomeownerDashboard />;
        case 'worker':
            return <WorkerDashboard />;
        case 'contractor':
            return <ContractorDashboard />;
        case 'shop':
            return <MyShopScreen />;
        default:
            return <HomeownerDashboard />;
    }
}
