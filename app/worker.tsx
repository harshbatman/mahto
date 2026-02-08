import DashboardHeader from '@/components/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { applyForContract, Contract, getAvailableContracts } from '@/services/db/contractService';
import { applyForJob, getAvailableJobs, Job } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    RefreshControl,
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
    const [jobs, setJobs] = useState<Job[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'jobs' | 'contracts'>('jobs');

    const fetchData = async () => {
        try {
            const [jobsData, contractsData] = await Promise.all([
                getAvailableJobs(),
                getAvailableContracts()
            ]);
            setJobs(jobsData);
            setContracts(contractsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleApplyJob = async (id: string, title: string) => {
        try {
            await applyForJob(id);
            Alert.alert('Applied!', `You have applied for: ${title}. The homeowner/contractor will contact you.`);
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleApplyContract = async (id: string, title: string) => {
        try {
            await applyForContract(id);
            Alert.alert('Application Sent', `You have successfully applied for contract: ${title}`);
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const heartScale = useRef(new Animated.Value(1)).current;

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
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title={profile?.name || "Worker"} showSearch={true} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: '#10b981' }]}>
                        <Text style={styles.statValue}>₹12,400</Text>
                        <Text style={styles.statLabel}>Earnings</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: '#6366f1' }]}>
                        <Text style={styles.statValue}>{profile?.experienceYears || 0} Yrs</Text>
                        <Text style={styles.statLabel}>Experience</Text>
                    </View>
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
                        onPress={() => setActiveTab('jobs')}
                    >
                        <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Daily Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'contracts' && styles.activeTab]}
                        onPress={() => setActiveTab('contracts')}
                    >
                        <Text style={[styles.tabText, activeTab === 'contracts' && styles.activeTabText]}>Contracts</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{activeTab === 'jobs' ? 'Browse Jobs' : 'Project Contracts'}</Text>
                    <TouchableOpacity onPress={onRefresh}><Text style={styles.seeAll}>Refresh</Text></TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator color="black" style={{ marginTop: 20 }} />
                ) : (
                    activeTab === 'jobs' ? (
                        jobs.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="briefcase-off-outline" size={48} color={Colors.light.border} />
                                <Text style={styles.emptyText}>No new jobs available right now</Text>
                            </View>
                        ) : (
                            jobs.map(job => (
                                <View key={job.id} style={styles.jobCard}>
                                    <View style={styles.jobHeader}>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{job.category}</Text>
                                        </View>
                                        <Text style={styles.applicantCount}>{job.applicantCount} applied</Text>
                                    </View>

                                    <View style={styles.jobBody}>
                                        <View style={styles.jobInfo}>
                                            <Text style={styles.jobTitle}>{job.title}</Text>
                                            <Text style={styles.jobLocation}>
                                                <MaterialCommunityIcons name="map-marker" size={12} color={Colors.light.muted} /> {job.location}
                                            </Text>
                                        </View>
                                        <View style={styles.payInfo}>
                                            <Text style={styles.jobPay}>₹{job.wage}</Text>
                                            <Text style={styles.paySub}>per day</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.description} numberOfLines={2}>{job.description}</Text>

                                    <TouchableOpacity
                                        style={styles.applyBtn}
                                        onPress={() => handleApplyJob(job.id!, job.title)}
                                    >
                                        <Text style={styles.applyBtnText}>Apply Now</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )
                    ) : (
                        contracts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="file-document-outline" size={48} color={Colors.light.border} />
                                <Text style={styles.emptyText}>No project contracts available</Text>
                            </View>
                        ) : (
                            contracts.map(contract => (
                                <View key={contract.id} style={styles.jobCard}>
                                    <View style={styles.jobHeader}>
                                        <View style={[styles.categoryBadge, { backgroundColor: '#fdf2f8' }]}>
                                            <Text style={[styles.categoryText, { color: '#be185d' }]}>{contract.category}</Text>
                                        </View>
                                        <Text style={styles.applicantCount}>{contract.applicantCount} bidders</Text>
                                    </View>

                                    <View style={styles.jobBody}>
                                        <View style={styles.jobInfo}>
                                            <Text style={styles.jobTitle}>{contract.title}</Text>
                                            <Text style={styles.jobLocation}>
                                                <MaterialCommunityIcons name="map-marker" size={12} color={Colors.light.muted} /> {contract.location}
                                            </Text>
                                        </View>
                                        <View style={styles.payInfo}>
                                            <Text style={[styles.jobPay, { color: '#6366f1' }]}>{contract.budget}</Text>
                                            <Text style={styles.paySub}>Project Budget</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.description} numberOfLines={2}>{contract.description}</Text>

                                    <TouchableOpacity
                                        style={[styles.applyBtn, { backgroundColor: '#6366f1' }]}
                                        onPress={() => handleApplyContract(contract.id!, contract.title)}
                                    >
                                        <Text style={styles.applyBtnText}>Bid on Project</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )
                    )
                )}



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
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: Spacing.md,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.muted,
        fontWeight: '600',
        marginTop: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 4,
        borderRadius: 12,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: 'black',
        fontWeight: '800',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    seeAll: {
        color: '#6366f1',
        fontWeight: '700',
    },
    jobCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4b5563',
    },
    applicantCount: {
        fontSize: 11,
        color: '#059669',
        fontWeight: '600',
    },
    jobBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: 'black',
    },
    jobLocation: {
        fontSize: 13,
        color: Colors.light.muted,
        marginTop: 4,
    },
    payInfo: {
        alignItems: 'flex-end',
    },
    jobPay: {
        fontSize: 18,
        fontWeight: '900',
        color: '#10b981',
    },
    paySub: {
        fontSize: 10,
        color: Colors.light.muted,
    },
    description: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
        marginVertical: 12,
    },
    applyBtn: {
        backgroundColor: 'black',
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    applyBtnText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 15,
    },

    emptyState: {
        alignItems: 'center',
        marginTop: 40,
        gap: 12,
        paddingBottom: 100,
    },
    emptyText: {
        color: Colors.light.muted,
        fontSize: 15,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginBottom: 20,
        opacity: 1,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    }
});
