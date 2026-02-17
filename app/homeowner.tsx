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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/post-contract')}>
                            <View style={styles.actionIcon}>
                                <MaterialCommunityIcons name="file-document-outline" size={24} color="black" />
                            </View>
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionTitle}>Post a Contract</Text>
                                <Text style={styles.actionSub}>Hire contractors for major works</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/post-job')}>
                            <View style={styles.actionIcon}>
                                <MaterialCommunityIcons name="hammer" size={24} color="black" />
                            </View>
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionTitle}>Request a Worker</Text>
                                <Text style={styles.actionSub}>Find helpers for daily tasks</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.exploreBar} onPress={() => router.push('/explore')}>
                    <View style={styles.exploreIcon}>
                        <MaterialCommunityIcons name="map-search-outline" size={24} color="black" />
                    </View>
                    <View style={styles.exploreInfo}>
                        <Text style={styles.exploreTitle}>Explore MAHTO</Text>
                        <Text style={styles.exploreSub}>Browse all verified professionals and shops nearby</Text>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="black" />
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
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
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
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    categoryImage: {
        width: 60,
        height: 60,
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
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
    actionInfo: {
        flex: 1,
        marginLeft: 16,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    actionSub: {
        fontSize: 14,
        color: '#545454',
        marginTop: 2,
    },
    exploreBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        padding: 20,
        borderRadius: 16,
        marginTop: 8,
    },
    exploreIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exploreInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    exploreTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    exploreSub: {
        fontSize: 13,
        color: '#545454',
        marginTop: 2,
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
});
