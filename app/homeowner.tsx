import DashboardHeader from '@/components/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeownerDashboard() {
    const { profile } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [resultsTitle, setResultsTitle] = useState('');
    const heartScale = useRef(new Animated.Value(1)).current;

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
                phoneNumber: user.phoneNumber,
                location: user.location,
                photoURL: user.photoURL,
                skills: JSON.stringify(user.skills || []),
                experienceYears: user.experienceYears?.toString() || '0',
                dailyRate: user.dailyRate?.toString() || '0',
                isAvailable: user.isAvailable?.toString() || 'true',
                about: user.about || ""
            }
        });
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
                        {searchResults.map((user, i) => (
                            <TouchableOpacity key={i} style={styles.resultCard} onPress={() => handleNavigate(user)}>
                                <View style={styles.resultAvatar}>
                                    {user.photoURL ? (
                                        <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                                    ) : (
                                        <MaterialCommunityIcons name={user.role === 'shop' ? 'store' : 'account'} size={24} color="black" />
                                    )}
                                    {user.role === 'worker' && user.isAvailable !== false && (
                                        <View style={styles.availableDot} />
                                    )}
                                </View>
                                <View style={styles.resultInfo}>
                                    <Text style={styles.resultName}>{user.name}</Text>
                                    <Text style={styles.resultSub}>{user.category} • {user.role}</Text>
                                    <View style={styles.ratingRow}>
                                        <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                                        <Text style={styles.ratingText}>{user.rating || '4.5'} • {user.distance || '0.5 km'}</Text>
                                        {user.role === 'worker' && user.dailyRate > 0 && (
                                            <Text style={styles.priceTag}>₹{user.dailyRate}/day</Text>
                                        )}
                                    </View>
                                    {user.skills && user.skills.length > 0 && (
                                        <View style={styles.skillsPreview}>
                                            <MaterialCommunityIcons name="tools" size={12} color="#666" />
                                            <Text style={styles.skillsText} numberOfLines={1}>
                                                {user.skills.join(', ')}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.light.border} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {isSearching && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="black" />
                    </View>
                )}
                {/* Search Bar - Handled by DashboardHeader but adding a custom search prompt here if needed */}

                {/* Post Contract & Job Cards */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/post-contract')}>
                        <MaterialCommunityIcons name="file-document-edit" size={24} color="black" />
                        <Text style={styles.actionTitle}>{t.postContract}</Text>
                        <Text style={styles.actionSub}>{t.hireContractor}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBox} onPress={() => router.push('/post-job')}>
                        <MaterialCommunityIcons name="account-hard-hat" size={24} color="black" />
                        <Text style={styles.actionTitle}>{t.postJob}</Text>
                        <Text style={styles.actionSub}>{t.hireWorker}</Text>
                    </TouchableOpacity>
                </View>

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
        gap: 12,
        marginBottom: Spacing.xl,
    },
    actionBox: {
        flex: 1,
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
        paddingVertical: 16,
        marginBottom: 80,
        opacity: 1,
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
    }
});

