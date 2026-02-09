import DashboardHeader from '@/components/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getMyJobApplications, JobApplication } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function WorkerDashboard() {
    const router = useRouter();
    const { profile } = useAuth();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);

    const heartScale = useRef(new Animated.Value(1)).current;

    const fetchApplications = async () => {
        if (!profile?.uid) return;
        try {
            const data = await getMyJobApplications(profile.uid);
            setApplications(data.slice(0, 3)); // Only show last 3 on home
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(heartScale, {
                    toValue: 1.3,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(heartScale, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        fetchApplications();
    }, [profile?.uid]);

    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title={profile?.name || "Worker"} showSearch={false} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.heroSection}>
                    <Text style={styles.heroGreeting}>Welcome back,</Text>
                    <Text style={styles.heroName}>{profile?.name || 'Worker'}! 👋</Text>
                    <Text style={styles.heroSub}>Find your next big project or daily work here.</Text>
                </View>

                <View style={styles.networkingSection}>
                    <Text style={styles.sectionTitle}>Explore MAHTO</Text>
                    <View style={styles.networkingGrid}>
                        <TouchableOpacity
                            style={[styles.networkCard, { backgroundColor: '#ecfdf5' }]}
                            onPress={() => router.push('/browse-jobs')}
                        >
                            <View style={[styles.networkIcon, { backgroundColor: '#d1fae5' }]}>
                                <MaterialCommunityIcons name="briefcase-search" size={24} color="#059669" />
                            </View>
                            <Text style={styles.networkLabel}>Find Jobs</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.networkCard, { backgroundColor: '#f5f3ff' }]}
                            onPress={() => router.push({
                                pathname: '/search-results',
                                params: { role: 'worker', title: 'Workers' }
                            })}
                        >
                            <View style={[styles.networkIcon, { backgroundColor: '#ddd6fe' }]}>
                                <MaterialCommunityIcons name="account-group" size={24} color="#6d28d9" />
                            </View>
                            <Text style={styles.networkLabel}>Find Workers</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.networkCard, { backgroundColor: '#fdf2f8' }]}
                            onPress={() => router.push({
                                pathname: '/search-results',
                                params: { role: 'contractor', title: 'Contractors' }
                            })}
                        >
                            <View style={[styles.networkIcon, { backgroundColor: '#fbcfe8' }]}>
                                <MaterialCommunityIcons name="briefcase-check" size={24} color="#db2777" />
                            </View>
                            <Text style={styles.networkLabel}>Contractors</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.networkCard, { backgroundColor: '#fff7ed' }]}
                            onPress={() => router.push('/applied-jobs')}
                        >
                            <View style={[styles.networkIcon, { backgroundColor: '#ffedd5' }]}>
                                <MaterialCommunityIcons name="clipboard-text-clock" size={24} color="#ea580c" />
                            </View>
                            <Text style={styles.networkLabel}>Applied Jobs</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.recentAppsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Applications</Text>
                        {applications.length > 0 && (
                            <TouchableOpacity onPress={() => router.push('/applied-jobs')}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <ActivityIndicator color="black" style={{ marginTop: 20 }} />
                    ) : applications.length > 0 ? (
                        <View style={styles.appsList}>
                            {applications.map((app) => (
                                <View key={app.id} style={styles.miniAppCard}>
                                    <View style={styles.appInfo}>
                                        <Text style={styles.appTitle} numberOfLines={1}>{app.jobTitle}</Text>
                                        <Text style={styles.appSubtitle}>{app.jobLocation}</Text>
                                    </View>
                                    <View style={[
                                        styles.miniStatus,
                                        app.status === 'accepted' ? styles.acceptedMini :
                                            app.status === 'rejected' ? styles.rejectedMini : styles.pendingMini
                                    ]}>
                                        <Text style={[
                                            styles.miniStatusText,
                                            app.status === 'accepted' ? styles.acceptedText :
                                                app.status === 'rejected' ? styles.rejectedText : styles.pendingText
                                        ]}>
                                            {app.status}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyApps}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={40} color="#cbd5e1" />
                            <Text style={styles.emptyAppsText}>No recent applications</Text>
                            <TouchableOpacity onPress={() => router.push('/browse-jobs')}>
                                <Text style={styles.browseText}>Find jobs now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Made in India </Text>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                    <Text style={styles.footerText}>🇮🇳</Text>
                </Animated.View>
                <Text style={styles.footerText}> with </Text>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                    <MaterialCommunityIcons name="heart" size={18} color="#ff0000" />
                </Animated.View>
            </View>
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
        fontSize: 32,
        fontWeight: '900',
        color: 'black',
        marginVertical: 4,
    },
    heroSub: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    networkingSection: {
        marginTop: 24,
        paddingBottom: 40,
    },
    networkingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 12,
    },
    networkCard: {
        width: '48%',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        gap: 8,
    },
    networkIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    networkLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1f2937',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginBottom: 80,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    },
    recentAppsSection: {
        marginTop: 24,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        color: '#6366f1',
        fontWeight: '700',
    },
    appsList: {
        gap: 12,
    },
    miniAppCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    appInfo: {
        flex: 1,
    },
    appTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b',
    },
    appSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    miniStatus: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    miniStatusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    pendingMini: {
        backgroundColor: '#fffbeb',
    },
    acceptedMini: {
        backgroundColor: '#f0fdf4',
    },
    rejectedMini: {
        backgroundColor: '#fef2f2',
    },
    pendingText: {
        color: '#b45309',
    },
    acceptedText: {
        color: '#16a34a',
    },
    rejectedText: {
        color: '#dc2626',
    },
    emptyApps: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    emptyAppsText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    browseText: {
        marginTop: 8,
        fontSize: 14,
        color: '#6366f1',
        fontWeight: '700',
    }
});
