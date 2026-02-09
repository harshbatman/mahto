import { Spacing } from '@/constants/theme';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
    const router = useRouter();
    const [contractors, setContractors] = useState<any[]>([]);
    const [workers, setWorkers] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]);
    const [filteredContractors, setFilteredContractors] = useState<any[]>([]);
    const [filteredWorkers, setFilteredWorkers] = useState<any[]>([]);
    const [filteredShops, setFilteredShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [cData, wData, sData] = await Promise.all([
                    searchUsers('contractor'),
                    searchUsers('worker'),
                    searchUsers('shop'),
                ]);
                setContractors(cData);
                setWorkers(wData);
                setShops(sData);
                setFilteredContractors(cData);
                setFilteredWorkers(wData);
                setFilteredShops(sData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const lowerText = text.toLowerCase();

        if (!text) {
            setFilteredContractors(contractors);
            setFilteredWorkers(workers);
            setFilteredShops(shops);
            return;
        }

        setFilteredContractors(contractors.filter(item =>
            (item.companyName || item.name || '').toLowerCase().includes(lowerText) ||
            (item.contractorServices || []).some((s: string) => s.toLowerCase().includes(lowerText))
        ));

        setFilteredWorkers(workers.filter(item =>
            (item.name || '').toLowerCase().includes(lowerText) ||
            (item.skills || []).some((s: string) => s.toLowerCase().includes(lowerText)) ||
            (item.category || '').toLowerCase().includes(lowerText)
        ));

        setFilteredShops(shops.filter(item =>
            (item.shopName || '').toLowerCase().includes(lowerText) ||
            (item.shopCategories || []).some((s: string) => s.toLowerCase().includes(lowerText))
        ));
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
                photoURL: user.photoURL || user.shopLogo || user.companyLogo,
                skills: JSON.stringify(user.skills || []),
                experienceYears: user.experienceYears?.toString() || '0',
                dailyRate: user.dailyRate?.toString() || '0',
                isAvailable: user.isAvailable?.toString() || 'true',
                about: user.about || "",
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

    const renderContractorItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.contractorCard} onPress={() => handleNavigate(item)}>
            <Image
                source={{ uri: item.companyBanner || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19' }}
                style={styles.cardCover}
            />
            <View style={styles.cardContent}>
                <View style={styles.cardAvatarContainer}>
                    {item.companyLogo ? (
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

    const renderWorkerItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.workerCard} onPress={() => handleNavigate(item)}>
            <View style={styles.workerAvatarContainer}>
                {item.photoURL ? (
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
                        <Text style={styles.workerName} numberOfLines={1}>{item.name}</Text>
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

    const renderShopItem = ({ item }: { item: any }) => {
        const isOpen = isShopOpen(item.openingTime, item.closingTime);
        return (
            <TouchableOpacity style={styles.shopCard} onPress={() => handleNavigate(item)}>
                <Image
                    source={{ uri: item.shopBanner || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec' }}
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
                        {item.shopLogo ? (
                            <Image source={{ uri: item.shopLogo }} style={styles.shopLogo} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <MaterialCommunityIcons name="store" size={24} color="black" />
                            </View>
                        )}
                    </View>
                    <View style={styles.shopHeaderRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
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
    };

    const [activeTab, setActiveTab] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleTabPress = (index: number) => {
        setActiveTab(index);
        scrollRef.current?.scrollTo({ x: index * width, animated: true });
    };

    const handleScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setActiveTab(index);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Explore MAHTO</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${['contractors', 'workers', 'shops'][activeTab]}...`}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#94a3b8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <MaterialCommunityIcons name="tune-variant" size={20} color="black" />
                </TouchableOpacity>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {['Contractors', 'Workers', 'Materials'].map((tab, index) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabItem, activeTab === index && styles.activeTabItem]}
                        onPress={() => handleTabPress(index)}
                    >
                        <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Contractors Tab */}
                <View style={{ width }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                        {loading ? (
                            <ActivityIndicator style={{ marginTop: 100 }} color="#6366f1" />
                        ) : filteredContractors.length > 0 ? (
                            filteredContractors.map((item, index) => (
                                <View key={item.id || item.uid || index} style={styles.verticalItem}>
                                    {renderContractorItem({ item })}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="account-search-outline" size={64} color="#e2e8f0" />
                                <Text style={styles.emptyText}>No contractors found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Workers Tab */}
                <View style={{ width }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                        {loading ? (
                            <ActivityIndicator style={{ marginTop: 100 }} color="#6366f1" />
                        ) : filteredWorkers.length > 0 ? (
                            filteredWorkers.map((item, index) => (
                                <View key={item.id || item.uid || index} style={styles.verticalItem}>
                                    {renderWorkerItem({ item })}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="account-search-outline" size={64} color="#e2e8f0" />
                                <Text style={styles.emptyText}>No workers found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Materials Tab */}
                <View style={{ width }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                        {loading ? (
                            <ActivityIndicator style={{ marginTop: 100 }} color="#6366f1" />
                        ) : filteredShops.length > 0 ? (
                            filteredShops.map((item, index) => (
                                <View key={item.id || item.uid || index} style={styles.verticalItem}>
                                    {renderShopItem({ item })}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="store-search-outline" size={64} color="#e2e8f0" />
                                <Text style={styles.emptyText}>No shops found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: 'black',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    tabItem: {
        paddingVertical: 14,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabItem: {
        borderBottomColor: '#6366f1',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b',
    },
    activeTabText: {
        color: '#6366f1',
    },
    tabContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    verticalItem: {
        marginBottom: 16,
    },
    verticalList: {
        paddingHorizontal: Spacing.lg,
        gap: 16,
    },
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
    workerCard: {
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
    workerHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    workerInfo: {
        flex: 1,
    },
    workerName: {
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
    shopCard: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 4,
    },
    shopCover: {
        width: '100%',
        height: 110,
    },
    shopContent: {
        padding: 16,
        paddingTop: 36,
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
    shopName: {
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
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        backgroundColor: 'white',
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 14,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
        padding: 0,
    },
    filterBtn: {
        width: 48,
        height: 48,
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '600',
    },
});
