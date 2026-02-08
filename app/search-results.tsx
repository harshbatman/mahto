import { Colors, Spacing } from '@/constants/theme';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchResultsScreen() {
    const { role, title } = useLocalSearchParams<{ role: string; title: string }>();
    const router = useRouter();
    const [results, setResults] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await searchUsers(role);
                setResults(data);
                setFilteredResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [role]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredResults(results);
            return;
        }
        const lowerText = text.toLowerCase();
        const filtered = results.filter(item =>
            item.name?.toLowerCase().includes(lowerText) ||
            item.category?.toLowerCase().includes(lowerText) ||
            item.shopCategories?.some((c: string) => c.toLowerCase().includes(lowerText)) ||
            item.location?.toLowerCase().includes(lowerText)
        );
        setFilteredResults(filtered);
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
                photoURL: user.shopLogo || user.photoURL,
                shopLogo: user.shopLogo,
                shopBanner: user.shopBanner,
                openingTime: user.openingTime,
                closingTime: user.closingTime,
                address: user.address || user.location,
                skills: JSON.stringify(user.skills || []),
                experienceYears: user.experienceYears?.toString() || '0',
                dailyRate: user.dailyRate?.toString() || '0',
                isAvailable: user.isAvailable?.toString() || 'true',
                about: user.about || "",
                shopOwnerName: user.shopOwnerName,
                shopCategories: JSON.stringify(user.shopCategories || []),
                // Contractor params
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
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={Colors.light.muted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${title?.toLowerCase()}...`}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor={Colors.light.muted}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color={Colors.light.muted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="black" />
                </View>
            ) : (
                <FlatList
                    data={filteredResults}
                    keyExtractor={(item) => item.uid || item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={[styles.resultCard, (item.role === 'shop' || item.role === 'contractor') && styles.shopCard]} onPress={() => handleNavigate(item)}>
                            {(item.role === 'shop' || item.role === 'contractor') && (
                                <View style={styles.cardBannerContainer}>
                                    {(item.shopBanner || item.companyBanner) ? (
                                        <Image source={{ uri: item.shopBanner || item.companyBanner }} style={styles.cardBanner} />
                                    ) : (
                                        <View style={[styles.cardBanner, styles.bannerPlaceholder]}>
                                            <MaterialCommunityIcons name="image" size={32} color="#cbd5e1" />
                                        </View>
                                    )}
                                </View>
                            )}
                            <View style={styles.cardContent}>
                                <View style={styles.avatar}>
                                    {(item.role === 'shop' && item.shopLogo) || (item.role === 'contractor' && item.companyLogo) ? (
                                        <Image
                                            source={{ uri: item.shopLogo || item.companyLogo }}
                                            style={styles.avatarImage}
                                            resizeMode="cover"
                                        />
                                    ) : item.photoURL ? (
                                        <Image
                                            source={{ uri: item.photoURL }}
                                            style={styles.avatarImage}
                                            resizeMode="cover"
                                            onError={(e) => console.log('List Image Error:', e.nativeEvent.error, 'for URL:', item.photoURL)}
                                        />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name={item.role === 'shop' ? 'store' : 'account'}
                                            size={24}
                                            color="black"
                                        />
                                    )}
                                    {item.role === 'worker' && item.isAvailable !== false && (
                                        <View style={styles.availableDot} />
                                    )}
                                </View>
                                <View style={styles.info}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.name}>{item.companyName || item.shopName || item.name}</Text>
                                        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.light.border} />
                                    </View>
                                    <Text style={styles.sub} numberOfLines={1}>
                                        {(item.contractorServices?.join(', ') || item.shopCategories?.join(', ') || item.category)} • {item.location || 'Nearby'}
                                    </Text>
                                    <View style={styles.ratingRow}>
                                        <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                                        <Text style={styles.ratingText}>
                                            {item.averageRating || item.rating || '0'} ({item.ratingCount || 0}) • {item.distance || '0.5 km'}
                                        </Text>
                                        {item.dailyRate > 0 && (
                                            <Text style={styles.priceTag}>₹{item.dailyRate}/day</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="account-search-outline" size={64} color={Colors.light.border} />
                            <Text style={styles.emptyText}>No matches found</Text>
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
        backgroundColor: 'white',
    },
    header: {
        paddingBottom: Spacing.md,
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
        fontWeight: '700',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginHorizontal: Spacing.lg,
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: 'black',
        padding: 0,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.lg,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    shopCard: {
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 0,
        overflow: 'hidden',
    },
    cardBannerContainer: {
        width: '100%',
        height: 120,
    },
    cardBanner: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f1f5f9',
    },
    bannerPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: 'black',
    },
    sub: {
        fontSize: 13,
        color: Colors.light.muted,
        marginTop: 2,
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
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.light.muted,
        fontWeight: '500',
    },
    availableDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4ade80',
        borderWidth: 2,
        borderColor: 'white',
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
});
