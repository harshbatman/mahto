import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import { Contract, getAvailableContracts } from '@/services/db/contractService';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Dimensions, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');


export default function ContractorDashboard() {
    const router = useRouter();
    const { profile } = useAuth();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [otherContractors, setOtherContractors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    const fetchContracts = async () => {
        try {
            const data = await getAvailableContracts();
            setContracts(data);
            const contractorsData = await searchUsers('contractor');
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

    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title={`Hi, ${profile?.companyName || profile?.name || "Contractor"}`} showSearch={false} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.heroSection}>
                    <Text style={styles.heroGreeting}>Business Hub</Text>
                    <Text style={styles.heroName}>{profile?.companyName || profile?.name || 'Contractor'}</Text>
                </View>

                {/* Main Actions */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/post-job')}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="briefcase-plus-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>Post Job</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/my-posted-jobs')}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="clipboard-list-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>My Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push({ pathname: '/search-results', params: { role: 'worker', title: 'Find Workers' } })}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="account-hard-hat-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>Find Workers</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.actionGrid, { marginTop: 12 }]}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push({ pathname: '/search-results', params: { role: 'contractor', title: 'Find Contractors' } })}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="briefcase-search-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>Network</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/browse-contracts')}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="file-search-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>Contracts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/my-bids')}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="file-document-edit-outline" size={28} color="black" />
                        </View>
                        <Text style={styles.actionLabel}>My Bids</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {otherContractors.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Connections</Text>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/search-results', params: { role: 'contractor', title: 'All Contractors' } })}>
                                <Text style={styles.viewAll}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                            {otherContractors.map((contractor) => (
                                <TouchableOpacity
                                    key={contractor.id || contractor.uid}
                                    style={styles.connectionCard}
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
                                    <View style={styles.connectionAvatar}>
                                        {(contractor.companyLogo || contractor.photoURL) ? (
                                            <Image source={{ uri: contractor.companyLogo || contractor.photoURL }} style={styles.avatarImg} />
                                        ) : (
                                            <MaterialCommunityIcons name="briefcase-outline" size={24} color="black" />
                                        )}
                                    </View>
                                    <Text style={styles.connectionName} numberOfLines={1}>{contractor.companyName || contractor.name}</Text>
                                    <View style={styles.ratingRow}>
                                        <MaterialCommunityIcons name="star" size={12} color="black" />
                                        <Text style={styles.ratingText}>{contractor.averageRating || '4.5'}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

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
        marginVertical: 32,
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
    horizontalScroll: {
        gap: 12,
        paddingRight: 20,
    },
    connectionCard: {
        width: 140,
        backgroundColor: '#F3F3F3',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    connectionAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    connectionName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
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
