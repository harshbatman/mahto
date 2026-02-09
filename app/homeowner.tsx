import DashboardHeader from '@/components/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Easing, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeownerDashboard() {
    const { profile } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [resultsTitle, setResultsTitle] = useState('');
    const heartScale = useRef(new Animated.Value(1)).current;
    const floatingAnim = useRef(new Animated.Value(0)).current;
    const textTranslateX = useRef(new Animated.Value(-300)).current;

    const categories = [
        { id: 'contractor', title: t.contractors, icon: 'briefcase-check', color: '#6366f1' },
        { id: 'worker', title: t.workers, icon: 'account-hard-hat', color: '#a855f7' },
        { id: 'shop', title: t.materials, icon: 'storefront', color: '#ec4899' },
    ];

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

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatingAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(floatingAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.timing(textTranslateX, {
                toValue: width,
                duration: 7000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

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

    const isShopOpen = (openingTime: string, closingTime: string) => {
        if (!openingTime || !closingTime) return false;

        const parseTime = (timeStr: string) => {
            const parts = timeStr.split(' ');
            if (parts.length < 2) return 0;
            const [time, modifier] = parts;
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
        };

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = parseTime(openingTime);
        const endMinutes = parseTime(closingTime);

        if (endMinutes < startMinutes) {
            return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
        }
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    };


    const isValidUri = (uri: string | undefined) => {
        if (!uri) return false;
        if (uri.startsWith('file://')) return false;
        return true;
    };


    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader
                title={profile?.name || "Homeowner"}
                showSearch={false}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {searchResults.length > 0 && (
                    <View style={styles.searchResultsContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{resultsTitle}</Text>
                            <TouchableOpacity onPress={() => setSearchResults([])}>
                                <Text style={styles.seeAll}>Clear</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ gap: 16 }}>
                            {searchResults.map((user, i) => {
                                if (user.role === 'contractor') {
                                    return (
                                        <TouchableOpacity key={i} style={styles.contractorCard} onPress={() => handleNavigate(user)}>
                                            {isValidUri(user.companyBanner) ? (
                                                <Image source={{ uri: user.companyBanner }} style={styles.cardCover} />
                                            ) : (
                                                <View style={[styles.cardCover, { justifyContent: 'center', alignItems: 'center' }]}>
                                                    <MaterialCommunityIcons name="briefcase-outline" size={40} color="#cbd5e1" />
                                                </View>
                                            )}
                                            <View style={styles.cardContent}>
                                                <View style={styles.cardAvatarContainer}>
                                                    {isValidUri(user.companyLogo) ? (
                                                        <Image source={{ uri: user.companyLogo }} style={styles.cardAvatar} />
                                                    ) : (
                                                        <View style={styles.avatarPlaceholder}>
                                                            <MaterialCommunityIcons name="briefcase" size={20} color="black" />
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.contractorHeaderRow}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.cardName} numberOfLines={1}>{user.companyName || user.name}</Text>
                                                        <View style={styles.ratingRow}>
                                                            <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                                                            <Text style={styles.ratingText}>{user.averageRating || '4.5'} ({user.ratingCount || 0})</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.viewProfileBtn}>
                                                        <Text style={styles.viewProfileText}>View Profile</Text>
                                                    </View>
                                                </View>
                                                <Text style={styles.cardSub} numberOfLines={1}>{user.contractorServices?.join(', ') || 'General Construction'}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                } else if (user.role === 'worker') {
                                    return (
                                        <TouchableOpacity key={i} style={styles.premiumWorkerCard} onPress={() => handleNavigate(user)}>
                                            <View style={styles.workerAvatarContainer}>
                                                {isValidUri(user.photoURL) ? (
                                                    <Image source={{ uri: user.photoURL }} style={styles.workerAvatar} />
                                                ) : (
                                                    <View style={[styles.workerAvatar, styles.avatarPlaceholder]}>
                                                        <MaterialCommunityIcons name="account" size={40} color="black" />
                                                    </View>
                                                )}
                                                {user.isAvailable !== false && <View style={styles.availableBadge} />}
                                            </View>
                                            <View style={styles.workerInfo}>
                                                <View style={styles.workerHeaderRow}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.premiumWorkerName} numberOfLines={1}>{user.name}</Text>
                                                        <Text style={styles.workerSkill} numberOfLines={1}>{user.skills?.[0] || 'Worker'}</Text>
                                                    </View>
                                                    <View style={styles.viewProfileBtn}>
                                                        <Text style={styles.viewProfileText}>View Profile</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.workerBottom}>
                                                    <Text style={styles.workerRate}>₹{user.dailyRate || '500'}/day</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                } else if (user.role === 'shop') {
                                    const isOpen = isShopOpen(user.openingTime, user.closingTime);
                                    return (
                                        <TouchableOpacity key={i} style={styles.premiumShopCard} onPress={() => handleNavigate(user)}>
                                            {isValidUri(user.shopBanner) ? (
                                                <Image source={{ uri: user.shopBanner }} style={styles.shopCover} />
                                            ) : (
                                                <View style={[styles.shopCover, { backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' }]}>
                                                    <MaterialCommunityIcons name="storefront-outline" size={40} color="#cbd5e1" />
                                                </View>
                                            )}
                                            <View style={[
                                                styles.shopStatusBadge,
                                                { backgroundColor: isOpen ? '#10b981' : '#ef4444' }
                                            ]}>
                                                <Text style={styles.shopStatusText}>{isOpen ? 'OPEN' : 'CLOSED'}</Text>
                                            </View>
                                            <View style={styles.shopContent}>
                                                <View style={styles.shopLogoContainer}>
                                                    {isValidUri(user.shopLogo) ? (
                                                        <Image source={{ uri: user.shopLogo }} style={styles.shopLogo} />
                                                    ) : (
                                                        <View style={styles.avatarPlaceholder}>
                                                            <MaterialCommunityIcons name="store" size={24} color="black" />
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.shopHeaderRow}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.premiumShopName} numberOfLines={1}>{user.shopName}</Text>
                                                        <Text style={styles.shopCat} numberOfLines={1}>{user.shopCategories?.join(', ') || 'Materials'}</Text>
                                                    </View>
                                                    <View style={styles.viewProfileBtn}>
                                                        <Text style={styles.viewProfileText}>View Shop</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.shopFooter}>
                                                    <MaterialCommunityIcons name="map-marker" size={12} color="#64748b" />
                                                    <Text style={styles.shopDist}>{user.location || 'Nearby'}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }
                                return null;
                            })}
                        </View>
                    </View>
                )}

                {isSearching && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="black" />
                    </View>
                )}
                {/* Custom Family Hero Banner */}
                <Animated.View style={[
                    styles.familyHeroContainer,
                    {
                        transform: [{
                            translateY: floatingAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -10]
                            })
                        }]
                    }
                ]}>
                    <Image
                        source={require('@/assets/images/family_banner.png')}
                        style={styles.familyHeroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.familyHeroOverlay}>
                        <View style={{ height: 50, width: '100%', overflow: 'hidden' }}>
                            <Animated.Text
                                style={[
                                    styles.familyHeroTitle,
                                    {
                                        transform: [{ translateX: textTranslateX }],
                                        position: 'absolute',
                                        width: 800, // Significantly wider to prevent any wrapping
                                        textAlign: 'left',
                                    }
                                ]}
                                numberOfLines={1}
                            >
                                Build Your Dream Home
                            </Animated.Text>
                        </View>
                        <Text style={styles.familyHeroSub}>For your family</Text>
                    </View>
                </Animated.View>

                {/* Post Contract & Job Cards */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/post-contract')}>
                        <MaterialCommunityIcons name="file-document-edit" size={24} color="#6366f1" />
                        <Text style={styles.actionTitle}>{t.postContract}</Text>
                        <Text style={styles.actionSub}>{t.hireContractor}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/post-job')}>
                        <MaterialCommunityIcons name="account-hard-hat" size={24} color="#10b981" />
                        <Text style={styles.actionTitle}>{t.postJob}</Text>
                        <Text style={styles.actionSub}>{t.hireWorker}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/my-postings')}>
                        <MaterialCommunityIcons name="clipboard-text" size={24} color="#f59e0b" />
                        <Text style={styles.actionTitle}>My Postings</Text>
                        <Text style={styles.actionSub}>Manage Posts</Text>
                    </TouchableOpacity>
                </View>

                {/* Explore MAHTO Prominent Button */}
                <TouchableOpacity
                    style={styles.exploreMahtoCard}
                    onPress={() => router.push('/explore')}
                >
                    <View style={styles.exploreContent}>
                        <View style={styles.exploreTextContainer}>
                            <Text style={styles.exploreTitle}>Explore MAHTO</Text>
                            <Text style={styles.exploreSubtitle}>Find top Contractors, Workers & Material Shops</Text>
                        </View>
                        <View style={styles.exploreIconCircle}>
                            <MaterialCommunityIcons name="rocket-launch" size={28} color="white" />
                        </View>
                    </View>
                    <View style={styles.exploreBadge}>
                        <Text style={styles.exploreBadgeText}>NEW</Text>
                    </View>
                </TouchableOpacity>

                {/* Featured Categories */}
                <View style={styles.categoryGrid}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.categoryCard}
                            onPress={() => handleCategorySearch(cat.id, cat.title)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: cat.color + '15' }]}>
                                <MaterialCommunityIcons name={cat.icon as any} size={28} color={cat.color} />
                            </View>
                            <Text style={styles.categoryText}>{cat.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer moved inside ScrollView for natural scrolling */}
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
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    categoryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
        marginTop: 10,
    },
    categoryCard: {
        alignItems: 'center',
        width: (width - Spacing.lg * 2) / 3.5,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.text,
    },
    heroCard: {
        backgroundColor: 'black',
        borderRadius: 24,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: Spacing.xl,
    },
    heroTextContent: {
        zIndex: 1,
    },
    heroIconBg: {
        position: 'absolute',
        right: -10,
        bottom: -10,
    },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: Spacing.xl,
    },
    familyHeroContainer: {
        width: '100%',
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        backgroundColor: '#fff',
    },
    familyHeroImage: {
        width: '100%',
        height: '100%',
    },
    familyHeroOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 15,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    familyHeroTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: '900',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
        letterSpacing: 1,
    },
    familyHeroSub: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '700',
        paddingHorizontal: 20,
        marginTop: 4,
    },
    actionBox: {
        width: '48%',
        aspectRatio: 1.3,
        padding: 10,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    actionTitle: {
        color: 'black',
        fontSize: 14,
        fontWeight: '900',
        marginTop: 6,
    },
    actionSub: {
        color: '#666',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
        textAlign: 'center',
    },
    heroTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: '900',
        lineHeight: 28,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        marginTop: 8,
        marginBottom: 20,
    },
    heroBtn: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    heroBtnText: {
        color: 'black',
        fontWeight: '800',
        fontSize: 13,
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
        color: Colors.light.text,
    },
    seeAll: {
        color: '#6366f1',
        fontWeight: '700',
        fontSize: 14,
    },
    horizontalList: {
        marginHorizontal: -Spacing.lg,
        paddingLeft: Spacing.lg,
    },
    workerCard: {
        backgroundColor: Colors.light.surface,
        width: 140,
        padding: 16,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        alignItems: 'center',
    },
    workerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    workerName: {
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
    },
    workerRole: {
        fontSize: 12,
        color: Colors.light.muted,
        marginTop: 2,
    },
    workerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },
    workerMetaText: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.light.muted,
    },
    shopSection: {
        gap: 12,
    },
    shopCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 20,
    },
    shopIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.light.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    shopInfo: {
        flex: 1,
    },
    shopName: {
        fontWeight: '700',
        fontSize: 16,
    },
    shopItems: {
        fontSize: 13,
        color: Colors.light.muted,
        marginTop: 2,
    },
    shopLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    shopLocation: {
        fontSize: 11,
        color: Colors.light.muted,
    },
    searchResultsContainer: {
        marginBottom: Spacing.xl,
        backgroundColor: Colors.light.surface,
        borderRadius: 24,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    resultAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        fontWeight: '700',
        fontSize: 15,
    },
    resultSub: {
        fontSize: 12,
        color: Colors.light.muted,
        marginTop: 2,
    },
    loadingContainer: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        opacity: 0.8,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 22,
    },
    availableDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4ade80',
        borderWidth: 2,
        borderColor: 'white',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.muted,
    },
    priceTag: {
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '700',
        color: '#10b981',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    skillsPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
    },
    skillsText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginLeft: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    openBadge: {
        backgroundColor: '#10b981',
    },
    closedBadge: {
        backgroundColor: '#ef4444',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    exploreMahtoCard: {
        marginHorizontal: 0,
        marginTop: 20,
        marginBottom: 30,
        backgroundColor: '#4f46e5', // Indigo base
        borderRadius: 28,
        padding: 24,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    exploreContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    exploreTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    exploreTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -0.5,
    },
    exploreSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 6,
        fontWeight: '600',
        lineHeight: 18,
    },
    exploreIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    exploreBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#fde047', // Brighter yellow
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 16,
        zIndex: 3,
    },
    exploreBadgeText: {
        color: '#854d0e',
        fontSize: 11,
        fontWeight: '900',
    },
    // Premium Card Styles for Search Results
    contractorCard: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardCover: {
        width: '100%',
        height: 120,
        backgroundColor: '#f1f5f9',
    },
    cardContent: {
        padding: 16,
        paddingTop: 36,
    },
    cardAvatarContainer: {
        position: 'absolute',
        top: -30,
        left: 16,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        padding: 4,
        elevation: 6,
    },
    cardAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contractorHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    viewProfileBtn: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    viewProfileText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
    },
    cardName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e293b',
    },
    cardSub: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 6,
        fontWeight: '500',
    },
    premiumWorkerCard: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 4,
    },
    workerAvatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        position: 'relative',
        marginRight: 16,
    },
    availableBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: 'white',
    },
    workerHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    workerInfo: {
        flex: 1,
    },
    premiumWorkerName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e293b',
    },
    workerSkill: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '600',
    },
    workerBottom: {
        marginTop: 10,
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    workerRate: {
        fontSize: 13,
        fontWeight: '900',
        color: '#10b981',
    },
    shopLogoContainer: {
        position: 'absolute',
        top: -30,
        left: 16,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        padding: 4,
        elevation: 6,
    },
    shopLogo: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
    },
    shopHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    shopCat: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
    },
    shopFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
    },
    shopCover: {
        width: '100%',
        height: 110,
    },
    premiumShopCard: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 4,
    },
    premiumShopName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e293b',
    },
    shopContent: {
        padding: 16,
        paddingTop: 36,
    },
    shopDist: {
        fontSize: 13,
        color: '#94a3b8',
    },
    shopStatusBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        zIndex: 10,
    },
    shopStatusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '900',
    },
});

