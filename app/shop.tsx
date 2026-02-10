import DashboardHeader from '@/components/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ShopDashboard() {
    const { profile } = useAuth();
    const router = useRouter();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isFocused) return;

        const backAction = () => {
            // When on the dashboard and focused, the back button should exit the app
            // rather than going back to auth or index screens.
            BackHandler.exitApp();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [isFocused]);

    const menuItems = [
        {
            title: 'My Shop',
            subtitle: 'View your profile & details',
            icon: 'storefront',
            route: '/my-shop',
            color: '#6366f1',
            bg: '#f5f3ff'
        },
        {
            title: 'Shops',
            subtitle: 'Explore the shops',
            icon: 'magnify',
            route: '/search-results',
            params: { role: 'shop', title: 'All Shops' },
            color: '#059669',
            bg: '#ecfdf5'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader
                title={profile?.shopName || "Shop Dashboard"}
                subtitle="Manage your business"
                showSearch={false}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <Text style={styles.heroGreeting}>Welcome back,</Text>
                    <Text style={styles.heroName}>{profile?.shopOwnerName || 'Partner'}! 👋</Text>
                    <Text style={styles.heroSub}>Access your shop details or explore the MAHTO network.</Text>
                </View>

                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.card, { backgroundColor: item.bg }]}
                            onPress={() => item.params ? router.push({ pathname: item.route as any, params: item.params }) : router.push(item.route as any)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: 'white' }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Summary Section */}
                {profile?.shopName && (
                    <View style={styles.statusSection}>
                        <Text style={styles.sectionTitle}>Shop Status</Text>
                        <View style={styles.statusCard}>
                            <View style={styles.statusItem}>
                                <Text style={styles.statusLabel}>Visibility</Text>
                                <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                                    <Text style={[styles.badgeText, { color: '#166534' }]}>Live</Text>
                                </View>
                            </View>
                            <View style={styles.statusItem}>
                                <Text style={styles.statusLabel}>Delivery</Text>
                                <Text style={styles.statusVal}>
                                    {profile.isHomeDeliveryAvailable ? 'Available' : 'Not Set'}
                                </Text>
                            </View>
                            <View style={styles.statusItem}>
                                <Text style={styles.statusLabel}>Experience</Text>
                                <Text style={styles.statusVal}>{profile.yearsInBusiness || 0} Years</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    heroSection: {
        marginBottom: 32,
        marginTop: 8,
    },
    heroGreeting: {
        fontSize: 16,
        color: Colors.light.muted,
        fontWeight: '600',
    },
    heroName: {
        fontSize: 28,
        fontWeight: '900',
        color: 'black',
        marginVertical: 4,
    },
    heroSub: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    grid: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        gap: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
    },
    statusSection: {
        marginTop: 40,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
    },
    statusCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 16,
    },
    statusItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    statusVal: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
    }
});
