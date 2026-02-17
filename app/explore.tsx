import { CONTRACTOR_SERVICES } from '@/constants/contractorServices';
import { SHOP_CATEGORIES } from '@/constants/shopCategories';
import { SKILLS_DATA } from '@/constants/skills';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
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
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedShopCategories, setSelectedShopCategories] = useState<string[]>([]);
    const [selectedContractorServices, setSelectedContractorServices] = useState<string[]>([]);

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

    const applyFilters = (text: string, rating: number, available: boolean, skills: string[], shopCats: string[], contractorServices: string[]) => {
        const lowerText = text.toLowerCase();

        // Contractor filtering
        let cRes = contractors;
        if (text) {
            cRes = cRes.filter(item =>
                (item.companyName || item.name || '').toLowerCase().includes(lowerText) ||
                (item.contractorServices || []).some((s: string) => s.toLowerCase().includes(lowerText))
            );
        }
        if (rating > 0) {
            cRes = cRes.filter(item => (item.averageRating || 4.5) >= rating);
        }
        if (contractorServices.length > 0) {
            cRes = cRes.filter(item =>
                (item.contractorServices || []).some((s: string) => contractorServices.includes(s))
            );
        }
        setFilteredContractors(cRes);

        // Worker filtering
        let wRes = workers;
        if (text) {
            wRes = wRes.filter(item =>
                (item.name || '').toLowerCase().includes(lowerText) ||
                (item.skills || []).some((s: string) => s.toLowerCase().includes(lowerText)) ||
                (item.category || '').toLowerCase().includes(lowerText)
            );
        }
        if (rating > 0) {
            wRes = wRes.filter(item => (item.averageRating || 4.5) >= rating);
        }
        if (available) {
            wRes = wRes.filter(item => item.isAvailable !== false);
        }
        if (skills.length > 0) {
            wRes = wRes.filter(item =>
                (item.skills || []).some((s: string) => skills.includes(s))
            );
        }
        setFilteredWorkers(wRes);

        // Shop filtering
        let sRes = shops;
        if (text) {
            sRes = sRes.filter(item =>
                (item.shopName || '').toLowerCase().includes(lowerText) ||
                (item.shopCategories || []).some((s: string) => s.toLowerCase().includes(lowerText))
            );
        }
        if (rating > 0) {
            sRes = sRes.filter(item => (item.averageRating || 4.5) >= rating);
        }
        if (shopCats.length > 0) {
            sRes = sRes.filter(item =>
                (item.shopCategories || []).some((c: string) => shopCats.includes(c))
            );
        }
        setFilteredShops(sRes);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        applyFilters(text, minRating, onlyAvailable, selectedSkills, selectedShopCategories, selectedContractorServices);
    };

    const handleApplyFilters = () => {
        applyFilters(searchQuery, minRating, onlyAvailable, selectedSkills, selectedShopCategories, selectedContractorServices);
        setShowFilterModal(false);
    };

    const toggleSkill = (skillName: string) => {
        setSelectedSkills(prev =>
            prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName]
        );
    };

    const toggleShopCategory = (catName: string) => {
        setSelectedShopCategories(prev =>
            prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
        );
    };

    const toggleContractorService = (serviceName: string) => {
        setSelectedContractorServices(prev =>
            prev.includes(serviceName) ? prev.filter(s => s !== serviceName) : [...prev, serviceName]
        );
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
                <Text style={styles.headerTitle}>Explore</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={22} color="black" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${['contractors', 'workers', 'shops'][activeTab]}...`}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#AFAFAF"
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterBtn}
                    onPress={() => setShowFilterModal(true)}
                >
                    <MaterialCommunityIcons name="tune-variant" size={22} color="black" />
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
                            <ActivityIndicator style={{ marginTop: 100 }} color="black" />
                        ) : filteredContractors.length > 0 ? (
                            filteredContractors.map((item, index) => (
                                <TouchableOpacity key={item.id || item.uid || index} style={styles.cardItem} onPress={() => handleNavigate(item)}>
                                    <View style={styles.cardBanner}>
                                        {item.companyBanner ? (
                                            <Image source={{ uri: item.companyBanner }} style={styles.bannerImg} />
                                        ) : (
                                            <View style={styles.placeholderBanner} />
                                        )}
                                        {/* Status Badge */}
                                        <View style={[styles.statusBadge, styles.statusOpen]}>
                                            <View style={[styles.statusDot, styles.dotOpen]} />
                                            <Text style={styles.statusText}>Open Now</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardBody}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.cardAvatar}>
                                                {item.companyLogo ? (
                                                    <Image source={{ uri: item.companyLogo }} style={styles.avatarImg} />
                                                ) : (
                                                    <MaterialCommunityIcons name="briefcase" size={20} color="black" />
                                                )}
                                            </View>
                                            <View style={styles.cardTitleSection}>
                                                <Text style={styles.cardName} numberOfLines={1}>{item.companyName || item.name}</Text>
                                                <Text style={styles.cardSub} numberOfLines={1}>{item.contractorServices?.slice(0, 2).join(', ') || 'General Contractor'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardFooter}>
                                            <View style={styles.metaBadge}>
                                                <MaterialCommunityIcons name="star" size={12} color="black" />
                                                <Text style={styles.metaText}>{item.averageRating || '4.5'}</Text>
                                            </View>
                                            <Text style={styles.metaDivider}>•</Text>
                                            <Text style={styles.metaText}>{item.location || 'Nearby'}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No contractors found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Workers Tab */}
                <View style={{ width }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                        {loading ? (
                            <ActivityIndicator style={{ marginTop: 100 }} color="black" />
                        ) : filteredWorkers.length > 0 ? (
                            filteredWorkers.map((item, index) => {
                                const isOnline = item.isAvailable !== false;
                                return (
                                    <TouchableOpacity key={item.id || item.uid || index} style={styles.cardItem} onPress={() => handleNavigate(item)}>
                                        <View style={styles.cardBanner}>
                                            {item.photoURL ? (
                                                <Image source={{ uri: item.photoURL }} style={styles.bannerImg} />
                                            ) : (
                                                <View style={[styles.placeholderBanner, { backgroundColor: '#F3F4FF' }]} />
                                            )}

                                            {/* Status Badge */}
                                            <View style={[styles.statusBadge, isOnline ? styles.statusAvailable : styles.statusBusy]}>
                                                <View style={[styles.statusDot, isOnline ? styles.dotAvailable : styles.dotBusy]} />
                                                <Text style={styles.statusText}>
                                                    {isOnline ? 'Available' : 'Busy'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardBody}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.cardAvatar}>
                                                    {item.photoURL ? (
                                                        <Image source={{ uri: item.photoURL }} style={styles.avatarImg} />
                                                    ) : (
                                                        <MaterialCommunityIcons name="account" size={20} color="black" />
                                                    )}
                                                </View>
                                                <View style={styles.cardTitleSection}>
                                                    <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                                                    <Text style={styles.cardSub} numberOfLines={1}>
                                                        {item.skills?.join(', ') || 'General Worker'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.cardFooter}>
                                                <View style={styles.metaBadge}>
                                                    <MaterialCommunityIcons name="star" size={12} color="black" />
                                                    <Text style={styles.metaText}>{item.averageRating || '4.5'}</Text>
                                                </View>
                                                <Text style={styles.metaDivider}>•</Text>
                                                <Text style={styles.metaText} numberOfLines={1}>{item.location || 'Nearby'}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No workers found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Materials Tab */}
                <View style={{ width }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                        {loading ? (
                            <ActivityIndicator style={{ marginTop: 100 }} color="black" />
                        ) : filteredShops.length > 0 ? (
                            filteredShops.map((item, index) => (
                                <TouchableOpacity key={item.id || item.uid || index} style={styles.cardItem} onPress={() => handleNavigate(item)}>
                                    <View style={styles.cardBanner}>
                                        {item.shopBanner ? (
                                            <Image source={{ uri: item.shopBanner }} style={styles.bannerImg} />
                                        ) : (
                                            <View style={styles.placeholderBanner} />
                                        )}
                                        {/* Status Badge */}
                                        <View style={[styles.statusBadge, isShopOpen(item.openingTime, item.closingTime) ? styles.statusOpen : styles.statusClosed]}>
                                            <View style={[styles.statusDot, isShopOpen(item.openingTime, item.closingTime) ? styles.dotOpen : styles.dotClosed]} />
                                            <Text style={styles.statusText}>
                                                {isShopOpen(item.openingTime, item.closingTime) ? 'Open Now' : 'Closed'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardBody}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.cardAvatar}>
                                                {item.shopLogo ? (
                                                    <Image source={{ uri: item.shopLogo }} style={styles.avatarImg} />
                                                ) : (
                                                    <MaterialCommunityIcons name="store" size={20} color="black" />
                                                )}
                                            </View>
                                            <View style={styles.cardTitleSection}>
                                                <Text style={styles.cardName} numberOfLines={1}>{item.shopName}</Text>
                                                <Text style={styles.cardSub} numberOfLines={1}>{item.shopCategories?.slice(0, 2).join(', ') || 'Building Materials'}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardFooter}>
                                            <View style={styles.metaBadge}>
                                                <MaterialCommunityIcons name="star" size={12} color="black" />
                                                <Text style={styles.metaText}>{item.averageRating || '4.5'}</Text>
                                            </View>
                                            <Text style={styles.metaDivider}>•</Text>
                                            <Text style={styles.metaText} numberOfLines={1}>{item.location || 'Nearby'}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No shops found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Filter Modal */}
            <Modal visible={showFilterModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.filterTitle}>Minimum Rating</Text>
                            <View style={styles.ratingRow}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <TouchableOpacity
                                        key={star}
                                        style={[styles.starItem, minRating >= star && styles.starItemActive]}
                                        onPress={() => setMinRating(star)}
                                    >
                                        <Text style={[styles.starText, minRating >= star && styles.starTextActive]}>{star}</Text>
                                        <MaterialCommunityIcons name="star" size={14} color={minRating >= star ? "white" : "black"} />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {activeTab === 1 && (
                                <>
                                    <Text style={styles.filterTitle}>Availability</Text>
                                    <TouchableOpacity style={styles.checkRow} onPress={() => setOnlyAvailable(!onlyAvailable)}>
                                        <Text style={styles.checkLabel}>Available workers only</Text>
                                        <View style={[styles.checkbox, onlyAvailable && styles.checkboxActive]}>
                                            {onlyAvailable && <MaterialCommunityIcons name="check" size={16} color="white" />}
                                        </View>
                                    </TouchableOpacity>
                                </>
                            )}

                            <Text style={styles.filterTitle}>Categories</Text>
                            <View style={styles.chipGrid}>
                                {(activeTab === 0 ? CONTRACTOR_SERVICES : activeTab === 1 ? SKILLS_DATA : SHOP_CATEGORIES).map((item: any) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.chip,
                                            (activeTab === 0 ? selectedContractorServices.includes(item.name) : activeTab === 1 ? selectedSkills.includes(item.name) : selectedShopCategories.includes(item.name)) && styles.chipActive
                                        ]}
                                        onPress={() => activeTab === 0 ? toggleContractorService(item.name) : activeTab === 1 ? toggleSkill(item.name) : toggleShopCategory(item.name)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            (activeTab === 0 ? selectedContractorServices.includes(item.name) : activeTab === 1 ? selectedSkills.includes(item.name) : selectedShopCategories.includes(item.name)) && styles.chipTextActive
                                        ]}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetBtn} onPress={() => {
                                setMinRating(0);
                                setOnlyAvailable(false);
                                setSelectedSkills([]);
                                setSelectedShopCategories([]);
                                setSelectedContractorServices([]);
                            }}>
                                <Text style={styles.resetText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
                                <Text style={styles.applyText}>Show Results</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 16,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        paddingHorizontal: 16,
        height: 52,
        borderRadius: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    filterBtn: {
        width: 52,
        height: 52,
        backgroundColor: '#F3F3F3',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    tabItem: {
        paddingVertical: 16,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabItem: {
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: 15,
        color: '#AFAFAF',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '700',
    },
    tabContent: {
        paddingHorizontal: 20,
    },
    cardItem: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F3F3',
    },
    cardBanner: {
        width: '100%',
        height: 120,
        backgroundColor: '#F9F9F9',
    },
    bannerImg: {
        width: '100%',
        height: '100%',
    },
    placeholderBanner: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F3F3F3',
    },
    cardBody: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardTitleSection: {
        flex: 1,
    },
    statusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusAvailable: { backgroundColor: '#F0FDF4' },
    statusBusy: { backgroundColor: '#FEF2F2' },
    statusOpen: { backgroundColor: '#F0FDF4' },
    statusClosed: { backgroundColor: '#FEF2F2' },
    dotAvailable: { backgroundColor: '#22C55E' },
    dotBusy: { backgroundColor: '#EF4444' },
    dotOpen: { backgroundColor: '#22C55E' },
    dotClosed: { backgroundColor: '#EF4444' },
    cardName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    cardSub: {
        fontSize: 13,
        color: '#545454',
        marginTop: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#FDFDFD',
        paddingTop: 12,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    metaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000',
    },
    metaDivider: {
        color: '#AFAFAF',
    },
    emptyState: {
        paddingVertical: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: '#AFAFAF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    modalBody: {
        padding: 24,
    },
    filterTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
    },
    starItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F3F3F3',
        gap: 4,
    },
    starItemActive: {
        backgroundColor: '#000',
    },
    starText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
    },
    starTextActive: {
        color: '#FFF',
    },
    checkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    checkLabel: {
        fontSize: 16,
        color: '#000',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F3F3F3',
    },
    chipActive: {
        backgroundColor: '#000',
    },
    chipText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#FFF',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F3F3',
        gap: 12,
    },
    resetBtn: {
        flex: 1,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    applyBtn: {
        flex: 2,
        height: 52,
        backgroundColor: '#000',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
