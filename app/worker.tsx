import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import { getMyJobApplications, JobApplication } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');


export default function WorkerDashboard() {
    const router = useRouter();
    const { profile } = useAuth();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);

    const getStatusColors = (status: string): [string, string] => {
        switch (status) {
            case 'accepted': return ['#22c55e', '#16a34a'];
            case 'rejected': return ['#ef4444', '#dc2626'];
            default: return ['#334155', '#1e293b'];
        }
    };

    const fetchApplications = async () => {
        if (!profile?.uid) return;
        try {
            const data = await getMyJobApplications(profile.uid);
            setApplications(data.slice(0, 3));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchApplications();
    }, [profile?.uid]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <DashboardHeader title={`Hi, ${profile?.name || "Worker"}`} showSearch={false} />
                <View style={styles.heroSection}>
                    <Text style={styles.heroGreeting}>Welcome back,</Text>
                    <Text style={styles.heroName}>{profile?.name || 'Worker'}</Text>
                </View>

                {/* Main Actions */}
                <TouchableOpacity style={styles.rewardBanner} onPress={() => router.push('/browse-jobs')}>
                    <View style={styles.rewardInfo}>
                        <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>FREE</Text>
                        </View>
                        <Text style={styles.rewardTitle}>Start applying for jobs now compeletly free ₹0</Text>
                        <Text style={styles.rewardSub}>Find best jobs for you today</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={{ fontSize: 36 }}>🎉</Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
                    </View>
                </TouchableOpacity>
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/browse-jobs')}
                    >
                        <View style={styles.iconCircle}>
                            <Image
                                source={require('@/assets/images/3d_find_jobs.png')}
                                style={styles.actionIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.actionLabel}>Find Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push({
                            pathname: '/search-results',
                            params: { role: 'worker', title: 'Workers' }
                        })}
                    >
                        <View style={styles.iconCircle}>
                            <Image
                                source={require('@/assets/images/3d_other_workers.png')}
                                style={styles.actionIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.actionLabel}>Other Workers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push({
                            pathname: '/search-results',
                            params: { role: 'contractor', title: 'Contractors' }
                        })}
                    >
                        <View style={styles.iconCircle}>
                            <Image
                                source={require('@/assets/images/role_contractor.png')}
                                style={styles.actionIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.actionLabel}>Contractors</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Applications</Text>
                        {applications.length > 0 && (
                            <TouchableOpacity onPress={() => router.push('/applied-jobs')}>
                                <Text style={styles.viewAll}>See all</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <ActivityIndicator color="black" />
                    ) : applications.length > 0 ? (
                        <View style={styles.appList}>
                            {applications.map((app) => (
                                <TouchableOpacity key={app.id} style={styles.stylishAppCard} onPress={() => router.push('/applied-jobs')}>
                                    <View style={styles.cardTop}>
                                        <View style={styles.jobIconBox}>
                                            <MaterialCommunityIcons name="briefcase-variant" size={24} color="#000" />
                                        </View>
                                        <LinearGradient
                                            colors={getStatusColors(app.status)}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.statusBadge}
                                        >
                                            <Text style={styles.statusText}>{app.status.toUpperCase()}</Text>
                                        </LinearGradient>
                                    </View>

                                    <View style={styles.cardMid}>
                                        <Text style={styles.appTitle} numberOfLines={1}>{app.jobTitle}</Text>
                                        <View style={styles.locationRow}>
                                            <MaterialCommunityIcons name="map-marker-radius" size={14} color="#64748b" />
                                            <Text style={styles.appLocation}>{app.jobLocation}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardBottom}>
                                        <Text style={styles.appliedDate}>Applied on {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No applications yet</Text>
                            <TouchableOpacity style={styles.mainActionBtn} onPress={() => router.push('/browse-jobs')}>
                                <Text style={styles.mainActionText}>Browse Jobs</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Made in 🇮🇳 with ❤️</Text>
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
    rewardBanner: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    rewardInfo: {
        flex: 1,
    },
    freeBadge: {
        backgroundColor: '#FF3B30',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginBottom: 8,
    },
    freeBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    rewardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    rewardSub: {
        fontSize: 13,
        color: '#AFAFAF',
        marginTop: 4,
        fontWeight: '500',
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
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        // Elevation for the icon itself
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIcon: {
        width: 50,
        height: 50,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#000',
        textAlign: 'center',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F3F3',
        marginBottom: 32,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#545454',
    },
    appList: {
        gap: 8,
    },
    stylishAppCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 3,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    jobIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    cardMid: {
        marginBottom: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
    },
    appliedDate: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    appTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    appLocation: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: '#F3F3F3',
        borderRadius: 16,
    },
    emptyText: {
        fontSize: 15,
        color: '#545454',
        marginBottom: 16,
    },
    mainActionBtn: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    mainActionText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
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
