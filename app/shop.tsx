import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');


export default function ShopDashboard() {
    const { profile } = useAuth();
    const router = useRouter();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isFocused) return;
        const backAction = () => {
            BackHandler.exitApp();
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isFocused]);

    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader
                title={profile?.shopName || "Shop Dashboard"}
                showSearch={false}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <Text style={styles.heroGreeting}>Store Hub</Text>
                    <Text style={styles.heroName}>{profile?.shopName || 'Partner'}</Text>
                </View>

                {/* Main Actions */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/my-shop')}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="store-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>My Shop</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push({ pathname: '/search-results', params: { role: 'shop', title: 'All Shops' } })}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="store-search-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>Browse Shops</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/profile-menu')}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="cog-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>Settings</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {profile?.shopName && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shop Overview</Text>
                        <View style={styles.statusBox}>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Visibility</Text>
                                <Text style={styles.statusValue}>Public</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Delivery</Text>
                                <Text style={styles.statusValue}>{profile.isHomeDeliveryAvailable ? 'Available' : 'No'}</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Experience</Text>
                                <Text style={styles.statusValue}>{profile.yearsInBusiness || 0} Years</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Made in India </Text>
                    <Text style={styles.footerText}>🇮🇳</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    heroSection: {
        marginTop: 24,
        marginBottom: 32,
    },
    heroGreeting: {
        fontSize: 16,
        color: '#545454',
        fontWeight: '500',
    },
    heroName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        marginTop: 4,
        letterSpacing: -0.5,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#F3F3F3',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F3F3',
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    statusBox: {
        backgroundColor: '#F3F3F3',
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 15,
        color: '#545454',
        fontWeight: '500',
    },
    statusValue: {
        fontSize: 15,
        color: '#000',
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#AFAFAF',
        fontWeight: '600',
    },
});
