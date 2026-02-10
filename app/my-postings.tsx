import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Contract, getMyContracts } from '@/services/db/contractService';
import { getPostedJobs, Job } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Tab = 'jobs' | 'contracts';

export default function MyPostingsScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('contracts');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            if (profile?.uid) {
                const [jobsData, contractsData] = await Promise.all([
                    getPostedJobs(profile.uid),
                    getMyContracts(profile.uid)
                ]);
                setJobs(jobsData);
                setContracts(contractsData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderJob = ({ item }: { item: Job }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: '/view-applicants',
                params: { jobId: item.id, title: item.title }
            })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.category}>
                        {item.selectedWorkers?.map(sw => `${sw.count} ${sw.skillName}`).join(', ') || item.category}
                    </Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
                    <Text style={[styles.statusText, item.status === 'open' ? styles.statusTextOpen : styles.statusTextClosed]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.footer}>
                <View style={styles.applicantInfo}>
                    <MaterialCommunityIcons name="account-group" size={18} color="#6366f1" />
                    <Text style={styles.applicantCount}>{item.applicantCount} Applicants</Text>
                </View>
                <View style={styles.payInfo}>
                    <Text style={styles.payValue}>₹{item.wage}/{item.paymentType === 'Monthly' ? 'mo' : 'day'}</Text>
                    <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderContract = ({ item }: { item: Contract }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/view-bids', params: { contractId: item.id, title: item.title } })}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
                    <Text style={[styles.statusText, item.status === 'open' ? styles.statusTextOpen : styles.statusTextClosed]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.footer}>
                <View style={styles.applicantInfo}>
                    <MaterialCommunityIcons name="briefcase-outline" size={18} color="#6366f1" />
                    <Text style={styles.applicantCount}>{item.applicantCount} Bids</Text>
                </View>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Postings</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'contracts' && styles.activeTab]}
                    onPress={() => setActiveTab('contracts')}
                >
                    <Text style={[styles.tabText, activeTab === 'contracts' && styles.activeTabText]}>Contracts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
                    onPress={() => setActiveTab('jobs')}
                >
                    <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <FlatList
                    data={(activeTab === 'contracts' ? contracts : jobs) as any[]}
                    renderItem={activeTab === 'contracts' ? (renderContract as any) : (renderJob as any)}
                    keyExtractor={item => item.id!}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MaterialCommunityIcons
                                name={activeTab === 'contracts' ? "file-document-outline" : "briefcase-outline"}
                                size={64} color="#ccc"
                            />
                            <Text style={styles.emptyText}>
                                {activeTab === 'contracts' ? "No contracts posted yet." : "No jobs posted yet."}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: Spacing.md,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
    },
    activeTab: {
        backgroundColor: 'black',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6b7280',
    },
    activeTabText: {
        color: 'white',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    list: {
        padding: Spacing.lg,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusOpen: {
        backgroundColor: '#ecfdf5',
    },
    statusClosed: {
        backgroundColor: '#fef2f2',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    statusTextOpen: {
        color: '#059669',
    },
    statusTextClosed: {
        color: '#dc2626',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    applicantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    applicantCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366f1',
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    payInfo: {
        alignItems: 'flex-end',
    },
    payValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#10b981',
    },
});
