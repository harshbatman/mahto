import DashboardHeader from '@/components/DashboardHeader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { applyForContract, Contract, getAvailableContracts } from '@/services/db/contractService';
import { searchUsers } from '@/services/db/searchService';
import { sanitizeError } from '@/utils/errorHandler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ContractorDashboard() {
    const router = useRouter();
    const { profile } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [otherContractors, setOtherContractors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchContracts = async () => {
        try {
            const data = await getAvailableContracts();
            setContracts(data);


            const contractorsData = await searchUsers('contractor');
            // Filter out self
            const filteredContractors = contractorsData.filter(c => c.id !== profile?.uid && c.uid !== profile?.uid);
            setOtherContractors(filteredContractors.slice(0, 5));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchContracts();
    };

    const handleApply = async (id: string, title: string) => {
        try {
            await applyForContract(id);
            Alert.alert('Application Sent', `You have successfully applied for: ${title}`);
            fetchContracts(); // Refresh to update count
        } catch (error: any) {
            Alert.alert('Error', sanitizeError(error));
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
            <DashboardHeader title={profile?.companyName || profile?.name || "Contractor"} showSearch={false} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/post-job')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#2563eb' }]}><MaterialCommunityIcons name="briefcase-plus" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>Post Job</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/my-posted-jobs')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' }]}><MaterialCommunityIcons name="briefcase-check" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>Posted Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push({ pathname: '/search-results', params: { role: 'worker', title: 'Find Workers' } })}>
                        <View style={[styles.actionIcon, { backgroundColor: '#db2777' }]}><MaterialCommunityIcons name="account-hard-hat" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>Find Workers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push({ pathname: '/search-results', params: { role: 'contractor', title: 'Find Contractors' } })}>
                        <View style={[styles.actionIcon, { backgroundColor: '#6366f1' }]}><MaterialCommunityIcons name="briefcase-search" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>Contractors</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/browse-contracts')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}><MaterialCommunityIcons name="text-box-search" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>Contracts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/my-bids')}>
                        <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}><MaterialCommunityIcons name="file-document-edit" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>My Bids</Text>
                    </TouchableOpacity>
                </View>


                {otherContractors.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Other Contractors</Text>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/search-results', params: { role: 'contractor', title: 'All Contractors' } })}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                            {otherContractors.map((contractor) => (
                                <TouchableOpacity
                                    key={contractor.id || contractor.uid}
                                    style={styles.workerCard}
                                    onPress={() => router.push({
                                        pathname: '/user-profile',
                                        params: {
                                            id: contractor.uid || contractor.id,
                                            name: contractor.name,
                                            role: contractor.role,
                                            category: contractor.category,
                                            averageRating: contractor.averageRating?.toString() || contractor.rating || '0',
                                            ratingCount: contractor.ratingCount?.toString() || '0',
                                            distance: contractor.distance,
                                            phoneNumber: contractor.phoneNumber,
                                            location: contractor.location,
                                            photoURL: contractor.photoURL,
                                            companyName: contractor.companyName,
                                            companyLogo: contractor.companyLogo,
                                            companyBanner: contractor.companyBanner,
                                            ownerName: contractor.ownerName,
                                            contractorServices: JSON.stringify(contractor.contractorServices || []),
                                            about: contractor.about || "",
                                            address: contractor.address,
                                            yearsInBusiness: contractor.yearsInBusiness?.toString()
                                        }
                                    })}
                                >
                                    <View style={styles.workerAvatar}>
                                        {(contractor.companyLogo || contractor.photoURL) ? (
                                            <Image source={{ uri: contractor.companyLogo || contractor.photoURL }} style={styles.avatarImage} />
                                        ) : (
                                            <MaterialCommunityIcons name="briefcase" size={30} color="#9ca3af" />
                                        )}
                                    </View>
                                    <Text style={styles.workerName} numberOfLines={1}>{contractor.companyName || contractor.name}</Text>
                                    <Text style={styles.workerRole} numberOfLines={1}>{(contractor.contractorServices && contractor.contractorServices.length > 0) ? contractor.contractorServices[0] : 'Contractor'}</Text>
                                    <View style={styles.workerRating}>
                                        <MaterialCommunityIcons name="star" size={12} color="#f59e0b" />
                                        <Text style={styles.ratingText}>{contractor.averageRating || '0'} ({contractor.ratingCount || 0})</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
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
        paddingBottom: 40,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    actionCard: {
        width: '47%',
        backgroundColor: Colors.light.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'black',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    actionLabel: {
        fontWeight: '700',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    seeAll: {
        color: '#6366f1',
        fontWeight: '700',
    },
    contractListCard: {
        padding: Spacing.lg,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 20,
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryBadge: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        fontSize: 11,
        fontWeight: '700',
        color: '#374151',
    },
    applicantText: {
        fontSize: 11,
        color: '#059669',
        fontWeight: '600',
    },
    contractTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'black',
    },
    contractBudget: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10b981',
        marginVertical: 4,
    },
    contractLocation: {
        fontSize: 13,
        color: Colors.light.muted,
        marginBottom: 8,
    },
    contractDescription: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
        marginBottom: 16,
    },
    applyBtn: {
        backgroundColor: 'black',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
        gap: 12,
    },
    emptyText: {
        color: Colors.light.muted,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginBottom: 80,
        opacity: 1,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    horizontalList: {
        paddingRight: Spacing.lg,
    },
    workerCard: {
        width: 140,
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    workerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    workerName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    workerRole: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 2,
    },
    workerRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4b5563',
    },
});
