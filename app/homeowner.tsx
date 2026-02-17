import DashboardHeader from '@/components/DashboardHeader';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeownerDashboard() {
    const { profile } = useAuth();
    const { t } = useLanguage();
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

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [resultsTitle, setResultsTitle] = useState('');

    const categories = [
        { id: 'contractor', title: t.contractors, image: require('@/assets/images/3d_contractor.png') },
        { id: 'worker', title: t.workers, image: require('@/assets/images/3d_worker.png') },
        { id: 'shop', title: t.materials, image: require('@/assets/images/3d_materials.png') },
    ];

    const handleSearch = async (text: string) => {
        if (text.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchUsers(undefined, text);
            setSearchResults(results);
            setResultsTitle(`Results for "${text}"`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCategorySearch = (role: string, title: string) => {
        router.push({
            pathname: '/search-results',
            params: { role, title }
        });
    };

    const handleNavigate = (user: any) => {
        router.push({
            pathname: '/user-profile',
            params: {
                id: user.uid || user.id,
                name: user.name,
                role: user.role,
                category: user.category,
                averageRating: user.averageRating?.toString() || user.rating || '0',
                ratingCount: user.ratingCount?.toString() || '0',
                distance: user.distance,
                phoneNumber: user.phoneNumber,
                location: user.location,
                photoURL: user.photoURL,
                skills: JSON.stringify(user.skills || []),
                experienceYears: user.experienceYears?.toString() || '0',
                dailyRate: user.dailyRate?.toString() || '0',
                isAvailable: user.isAvailable?.toString() || 'true',
                about: user.about || "",
                shopOwnerName: user.shopOwnerName,
                shopLogo: user.shopLogo,
                shopBanner: user.shopBanner,
                openingTime: user.openingTime,
                closingTime: user.closingTime,
                address: user.address || user.location,
                shopCategories: JSON.stringify(user.shopCategories || []),
                companyName: user.companyName,
                companyLogo: user.companyLogo,
                companyBanner: user.companyBanner,
                ownerName: user.ownerName,
                contractorServices: JSON.stringify(user.contractorServices || [])
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <DashboardHeader
                    title={profile?.name || "Homeowner"}
                    showSearch={true}
                    onSearch={handleSearch}
                    placeholder="Search for services..."
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {searchResults.length > 0 && (
                    <View style={styles.resultsContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{resultsTitle}</Text>
                            <TouchableOpacity onPress={() => setSearchResults([])}>
                                <Text style={styles.clearText}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                        {searchResults.map((user, i) => (
                            <TouchableOpacity key={i} style={styles.resultItem} onPress={() => handleNavigate(user)}>
                                <View style={styles.resultAvatar}>
                                    {user.photoURL || user.companyLogo || user.shopLogo ? (
                                        <Image source={{ uri: user.photoURL || user.companyLogo || user.shopLogo }} style={styles.avatarImg} />
                                    ) : (
                                        <MaterialCommunityIcons name="account-outline" size={24} color="black" />
                                    )}
                                </View>
                                <View style={styles.resultInfo}>
                                    <Text style={styles.resultName}>{user.companyName || user.name || user.shopName}</Text>
                                    <Text style={styles.resultSub}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.location || 'Nearby'}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {isSearching && (
                    <View style={styles.loading}>
                        <ActivityIndicator color="black" />
                    </View>
                )}

                <Text style={styles.mainTitle}>What can we help you find?</Text>

                <View style={styles.categoryGrid}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.categoryCard}
                            onPress={() => handleCategorySearch(cat.id, cat.title)}
                        >
                            <View style={styles.iconCircle}>
                                <Image source={cat.image} style={styles.categoryImage} resizeMode="contain" />
                            </View>
                            <Text style={styles.categoryLabel}>{cat.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.rewardBanner}>
                    <View style={styles.rewardInfo}>
                        <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>FREE</Text>
                        </View>
                        <Text style={styles.rewardTitle}>Post now at zero cost</Text>
                        <Text style={styles.rewardSub}>Start your construction journey today</Text>
                    </View>
                    <MaterialCommunityIcons name="ticket-percent-outline" size={32} color="#000" />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/post-contract')}>
                            <View style={styles.actionIcon}>
                                <Image source={require('@/assets/images/3d_contract.png')} style={styles.realisticActionIcon} />
                            </View>
                            <View style={styles.actionInfo}>
                                <View style={styles.actionTitleRow}>
                                    <Text style={styles.actionTitle}>Post a Contract</Text>
                                    <View style={styles.miniBadge}>
                                        <Text style={styles.miniBadgeText}>FREE</Text>
                                    </View>
                                </View>
                                <Text style={styles.actionSub}>Hire contractors for major works</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/post-job')}>
                            <View style={styles.actionIcon}>
                                <Image source={require('@/assets/images/3d_job.png')} style={styles.realisticActionIcon} />
                            </View>
                            <View style={styles.actionInfo}>
                                <View style={styles.actionTitleRow}>
                                    <Text style={styles.actionTitle}>Request a Worker</Text>
                                    <View style={styles.miniBadge}>
                                        <Text style={styles.miniBadgeText}>FREE</Text>
                                    </View>
                                </View>
                                <Text style={styles.actionSub}>Find helpers for daily tasks</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.exploreCard} onPress={() => router.push('/explore')}>
                    <View style={styles.exploreCardContent}>
                        <View style={styles.exploreCardTag}>
                            <Text style={styles.exploreCardTagText}>New Experience</Text>
                        </View>
                        <Text style={styles.exploreCardTitle}>Explore MAHTO</Text>
                        <Text style={styles.exploreCardSub}>
                            Discover verified professionals and major material shops in your neighborhood.
                        </Text>
                    </View>
                    <View style={styles.exploreCardImageContainer}>
                        <Image
                            source={require('@/assets/images/3d_explore.png')}
                            style={styles.exploreCardImage}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableOpacity>

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
    headerWrapper: {
        backgroundColor: '#FFF',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginTop: 24,
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    categoryGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    categoryCard: {
        width: (width - 64) / 3, // Roughly calculate width for 3 columns with gaps and padding
        aspectRatio: 1,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F3F3',
        // Elevation/Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    iconCircle: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    categoryImage: {
        width: 68,
        height: 68,
    },
    categoryLabel: {
        fontSize: 11,
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
    actionGrid: {
        gap: 16,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    realisticActionIcon: {
        width: 32,
        height: 32,
    },
    actionInfo: {
        flex: 1,
        marginLeft: 16,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    actionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    miniBadge: {
        backgroundColor: '#000',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    miniBadgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
    },
    actionSub: {
        fontSize: 14,
        color: '#545454',
        marginTop: 2,
    },
    exploreCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    exploreCardContent: {
        flex: 1.8,
        paddingRight: 12,
    },
    exploreCardTag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    exploreCardTagText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    exploreCardTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 8,
    },
    exploreCardSub: {
        fontSize: 13,
        color: '#AFAFAF',
        lineHeight: 18,
    },
    exploreCardImageContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    exploreCardImage: {
        width: 140,
        height: 140,
        marginRight: -25,
    },
    resultsContainer: {
        marginTop: 24,
        backgroundColor: '#FFF',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    clearText: {
        color: '#545454',
        fontSize: 14,
        fontWeight: '600',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    resultAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    resultInfo: {
        flex: 1,
        marginLeft: 16,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    resultSub: {
        fontSize: 13,
        color: '#545454',
        marginTop: 2,
    },
    loading: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        marginBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#AFAFAF',
        fontWeight: '600',
    },
    rewardBanner: {
        backgroundColor: '#F3F3F3',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    rewardInfo: {
        flex: 1,
    },
    freeBadge: {
        backgroundColor: '#000',
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
        color: '#000',
    },
    rewardSub: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
        fontWeight: '500',
    },
});
