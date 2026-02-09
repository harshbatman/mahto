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
                    renderItem={({ item }) => {
                        if (item.role === 'contractor') {
                            const bannerUri = isValidUri(item.companyBanner) ? item.companyBanner : 'https://images.unsplash.com/photo-1541963463532-d68292c34b19';
                            return (
                                <TouchableOpacity style={styles.contractorCard} onPress={() => handleNavigate(item)}>
                                    <Image
                                        source={{ uri: bannerUri }}
                                        style={styles.cardCover}
                                    />
                                    <View style={styles.contractorCardContent}>
                                        <View style={styles.cardAvatarContainer}>
                                            {isValidUri(item.companyLogo) ? (
                                                <Image source={{ uri: item.companyLogo }} style={styles.cardAvatar} />
                                            ) : (
                                                <View style={styles.avatarPlaceholder}>
                                                    <MaterialCommunityIcons name="briefcase" size={20} color="black" />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.contractorHeaderRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cardName} numberOfLines={1}>{item.companyName || item.name}</Text>
                                                <View style={styles.ratingRow}>
                                                    <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                                                    <Text style={styles.ratingText}>{item.averageRating || '4.5'} ({item.ratingCount || 0})</Text>
                                                </View>
                                            </View>
                                            <View style={styles.viewProfileBtn}>
                                                <Text style={styles.viewProfileText}>View Profile</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardSub} numberOfLines={1}>{item.contractorServices?.join(', ') || 'General Construction'}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        } else if (item.role === 'worker') {
                            return (
                                <TouchableOpacity style={styles.premiumWorkerCard} onPress={() => handleNavigate(item)}>
                                    <View style={styles.workerAvatarContainer}>
                                        {isValidUri(item.photoURL) ? (
                                            <Image source={{ uri: item.photoURL }} style={styles.workerAvatar} />
                                        ) : (
                                            <View style={[styles.workerAvatar, styles.avatarPlaceholder]}>
                                                <MaterialCommunityIcons name="account" size={40} color="black" />
                                            </View>
                                        )}
                                        {item.isAvailable !== false && <View style={styles.availableBadge} />}
                                    </View>
                                    <View style={styles.workerInfo}>
                                        <View style={styles.workerHeaderRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.premiumWorkerName} numberOfLines={1}>{item.name}</Text>
                                                <Text style={styles.workerSkill} numberOfLines={1}>{item.skills?.[0] || 'Worker'}</Text>
                                            </View>
                                            <View style={styles.viewProfileBtn}>
                                                <Text style={styles.viewProfileText}>View Profile</Text>
                                            </View>
                                        </View>
                                        <View style={styles.workerBottom}>
                                            <Text style={styles.workerRate}>₹{item.dailyRate || '500'}/day</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        } else if (item.role === 'shop') {
                            const isOpen = isShopOpen(item.openingTime, item.closingTime);
                            const shopBannerUri = isValidUri(item.shopBanner) ? item.shopBanner : 'https://images.unsplash.com/photo-1578575437130-527eed3abbec';
                            return (
                                <TouchableOpacity style={styles.premiumShopCard} onPress={() => handleNavigate(item)}>
                                    <Image
                                        source={{ uri: shopBannerUri }}
                                        style={styles.shopCover}
                                    />
                                    <View style={[
                                        styles.shopStatusBadge,
                                        { backgroundColor: isOpen ? '#10b981' : '#ef4444' }
                                    ]}>
                                        <Text style={styles.shopStatusText}>{isOpen ? 'OPEN' : 'CLOSED'}</Text>
                                    </View>
                                    <View style={styles.shopContent}>
                                        <View style={styles.shopLogoContainer}>
                                            {isValidUri(item.shopLogo) ? (
                                                <Image source={{ uri: item.shopLogo }} style={styles.shopLogo} />
                                            ) : (
                                                <View style={styles.avatarPlaceholder}>
                                                    <MaterialCommunityIcons name="store" size={24} color="black" />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.shopHeaderRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.premiumShopName} numberOfLines={1}>{item.shopName}</Text>
                                                <Text style={styles.shopCat} numberOfLines={1}>{item.shopCategories?.join(', ') || 'Materials'}</Text>
                                            </View>
                                            <View style={styles.viewProfileBtn}>
                                                <Text style={styles.viewProfileText}>View Shop</Text>
                                            </View>
                                        </View>
                                        <View style={styles.shopFooter}>
                                            <MaterialCommunityIcons name="map-marker" size={12} color="#64748b" />
                                            <Text style={styles.shopDist}>{item.location || 'Nearby'}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        }
                        return null;
                    }}
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
        paddingBottom: 40,
    },
    // Premium Contractor Card
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
        marginBottom: 20,
    },
    cardCover: {
        width: '100%',
        height: 120,
        backgroundColor: '#f1f5f9',
    },
    contractorCardContent: {
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
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    cardSub: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 6,
        fontWeight: '500',
    },
    // Premium Worker Card
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
        marginBottom: 20,
    },
    workerAvatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        position: 'relative',
        marginRight: 16,
    },
    workerAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
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
    workerInfo: {
        flex: 1,
    },
    workerHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
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
    // Premium Shop Card
    premiumShopCard: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 4,
        marginBottom: 20,
    },
    shopCover: {
        width: '100%',
        height: 110,
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
    shopContent: {
        padding: 16,
        paddingTop: 36,
    },
    shopHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    premiumShopName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e293b',
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
});
