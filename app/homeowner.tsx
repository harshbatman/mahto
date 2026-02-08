import DashboardHeader from '@/components/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const categories = [
    { id: 'contractor', title: 'Contractors', icon: 'briefcase-check', color: '#6366f1' },
    { id: 'worker', title: 'Workers', icon: 'account-hard-hat', color: '#a855f7' },
    { id: 'shop', title: 'Materials', icon: 'storefront', color: '#ec4899' },
];

export default function HomeownerDashboard() {
    const { profile } = useAuth();
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [resultsTitle, setResultsTitle] = useState('');
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
                rating: user.rating,
                distance: user.distance,
                phoneNumber: user.phoneNumber,
                location: user.location
            }
        });
    };



    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader
                title={profile?.name || "Homeowner"}
                subtitle="Manage your dream project"
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
                                    <MaterialCommunityIcons name={user.role === 'shop' ? 'store' : 'account'} size={24} color="black" />
                                </View>
                                <View style={styles.resultInfo}>
                                    <Text style={styles.resultName}>{user.name}</Text>
                                    <Text style={styles.resultSub}>{user.category} • {user.role}</Text>
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
                <View style={[styles.actionRow, { paddingHorizontal: 20 }]}>
                    <TouchableOpacity style={[styles.actionBox, { backgroundColor: 'white', borderWidth: 1, borderColor: '#f0f0f0' }]} onPress={() => router.push('/post-contract')}>
                        <MaterialCommunityIcons name="file-document-edit" size={24} color="black" />
                        <Text style={[styles.actionTitle, { color: 'black' }]}>Post Contract</Text>
                        <Text style={[styles.actionSub, { color: '#666' }]}>Hire Contractor</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBox, { backgroundColor: 'white', borderWidth: 1, borderColor: '#f0f0f0' }]} onPress={() => router.push('/post-job')}>
                        <MaterialCommunityIcons name="account-hard-hat" size={24} color="black" />
                        <Text style={[styles.actionTitle, { color: 'black' }]}>Post Job</Text>
                        <Text style={[styles.actionSub, { color: '#666' }]}>Hire Worker</Text>
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

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Made in India 🇮🇳 with </Text>
                    <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                        <MaterialCommunityIcons name="heart" size={18} color="#ef4444" />
                    </Animated.View>
                </View>
            </ScrollView>
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
        width: (width - Spacing.lg * 2) / 4.5,
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
        aspectRatio: 1,
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    actionTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: '900',
        marginTop: 6,
    },
    actionSub: {
        color: 'rgba(255,255,255,0.7)',
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
        paddingVertical: 40,
        opacity: 0.6,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.muted,
    }
});

