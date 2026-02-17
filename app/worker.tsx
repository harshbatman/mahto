import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import { getMyJobApplications, JobApplication } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Dimensions,
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
            <DashboardHeader title={`Hi, ${profile?.name || "Worker"}`} showSearch={false} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <Text style={styles.heroGreeting}>Welcome back,</Text>
                    <Text style={styles.heroName}>{profile?.name || 'Worker'}</Text>
                </View>

                {/* Main Actions */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/browse-jobs')}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="briefcase-search-outline" size={28} color="black" />
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
                            <MaterialCommunityIcons name="account-group-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>Find Workers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push({
                            pathname: '/search-results',
                            params: { role: 'contractor', title: 'Contractors' }
                        })}
                    >
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="account-hard-hat-outline" size={28} color="black" />
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
                                <TouchableOpacity key={app.id} style={styles.appItem} onPress={() => router.push('/applied-jobs')}>
                                    <View style={styles.appInfo}>
                                        <Text style={styles.appTitle}>{app.jobTitle}</Text>
                                        <Text style={styles.appLocation}>{app.jobLocation}</Text>
                                    </View>
                                    <Text style={[
                                        styles.statusText,
                                        { color: app.status === 'accepted' ? '#000' : app.status === 'rejected' ? '#AFAFAF' : '#545454' }
                                    ]}>
                                        {app.status.toUpperCase()}
                                    </Text>
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
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    appInfo: {
        flex: 1,
    },
    appTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    appLocation: {
        fontSize: 14,
        color: '#545454',
        marginTop: 2,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
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
