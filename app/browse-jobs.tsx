import { Colors, Spacing } from '@/constants/theme';
import { applyForContract, Contract, getAvailableContracts } from '@/services/db/contractService';
import { applyForJob, getAvailableJobs, Job } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BrowseJobsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'jobs' | 'contracts'>('jobs');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            const [jobsData, contractsData] = await Promise.all([
                getAvailableJobs(),
                getAvailableContracts()
            ]);
            setJobs(jobsData);
            setFilteredJobs(jobsData);
            setContracts(contractsData);
            setFilteredContracts(contractsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const lowerText = text.toLowerCase();

        if (activeTab === 'jobs') {
            const filtered = jobs.filter(j =>
                j.title.toLowerCase().includes(lowerText) ||
                j.category.toLowerCase().includes(lowerText) ||
                j.location.toLowerCase().includes(lowerText)
            );
            setFilteredJobs(filtered);
        } else {
            const filtered = contracts.filter(c =>
                c.title.toLowerCase().includes(lowerText) ||
                c.category.toLowerCase().includes(lowerText) ||
                c.location.toLowerCase().includes(lowerText)
            );
            setFilteredContracts(filtered);
        }
    };

    const handleApplyJob = async (id: string, title: string) => {
        try {
            await applyForJob(id);
            Alert.alert('Applied!', `Application sent for: ${title}`);
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleApplyContract = async (id: string, title: string) => {
        try {
            await applyForContract(id);
            Alert.alert('Applied!', `Bid submitted for: ${title}`);
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Find Work</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={Colors.light.muted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={activeTab === 'jobs' ? "Search daily jobs..." : "Search contracts..."}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
                        onPress={() => {
                            setActiveTab('jobs');
                            setSearchQuery('');
                            setFilteredJobs(jobs);
                        }}
                    >
                        <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Daily Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'contracts' && styles.activeTab]}
                        onPress={() => {
                            setActiveTab('contracts');
                            setSearchQuery('');
                            setFilteredContracts(contracts);
                        }}
                    >
                        <Text style={[styles.tabText, activeTab === 'contracts' && styles.activeTabText]}>Contracts</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="black" />
                </View>
            ) : (
                <FlatList
                    data={(activeTab === 'jobs' ? filteredJobs : filteredContracts) as any[]}
                    keyExtractor={(item) => item.id!}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.jobCard}>
                            <View style={styles.jobHeader}>
                                <View style={[styles.badge, activeTab === 'contracts' && styles.contractBadge]}>
                                    <Text style={[styles.badgeText, activeTab === 'contracts' && styles.contractBadgeText]}>{item.category}</Text>
                                </View>
                                <Text style={styles.applicants}>{item.applicantCount} applied</Text>
                            </View>

                            <Text style={styles.jobTitle}>{item.title}</Text>

                            <View style={styles.infoRow}>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="map-marker" size={16} color={Colors.light.muted} />
                                    <Text style={styles.infoText}>{item.location}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="currency-inr" size={16} color="#10b981" />
                                    <Text style={styles.payText}>
                                        {activeTab === 'jobs' ? (item as Job).wage + '/day' : (item as Contract).budget}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                            <TouchableOpacity
                                style={[styles.applyBtn, activeTab === 'contracts' && styles.contractBtn]}
                                onPress={() => activeTab === 'jobs' ? handleApplyJob(item.id!, item.title) : handleApplyContract(item.id!, item.title)}
                            >
                                <Text style={styles.applyBtnText}>{activeTab === 'jobs' ? 'Apply Now' : 'Bid on Project'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="briefcase-search" size={64} color={Colors.light.border} />
                            <Text style={styles.emptyText}>No matching jobs found</Text>
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
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginHorizontal: Spacing.lg,
        padding: 12,
        borderRadius: 14,
        gap: 10,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: 'black',
        padding: 0,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingBottom: 4,
    },
    tab: {
        marginRight: 24,
        paddingBottom: 12,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: 'black',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: 'black',
        fontWeight: '800',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.lg,
    },
    jobCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    contractBadge: {
        backgroundColor: '#fdf2f8',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#4b5563',
    },
    contractBadgeText: {
        color: '#be185d',
    },
    applicants: {
        fontSize: 11,
        color: '#059669',
        fontWeight: '700',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'black',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#666',
    },
    payText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#10b981',
    },
    description: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
        marginBottom: 16,
    },
    applyBtn: {
        backgroundColor: 'black',
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    contractBtn: {
        backgroundColor: '#6366f1',
    },
    applyBtnText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 15,
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.light.muted,
        fontWeight: '600',
    }
});
