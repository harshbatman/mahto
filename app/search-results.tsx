import { CONTRACTOR_SERVICES } from '@/constants/contractorServices';
import { SHOP_CATEGORIES } from '@/constants/shopCategories';
import { SKILLS_DATA } from '@/constants/skills';
import { searchUsers } from '@/services/db/searchService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchResultsScreen() {
    const { role, title } = useLocalSearchParams<{ role: string; title: string }>();
    const router = useRouter();
    const [results, setResults] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [onlyAvailable, setOnlyAvailable] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedShopCategories, setSelectedShopCategories] = useState<string[]>([]);
    const [selectedContractorServices, setSelectedContractorServices] = useState<string[]>([]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await searchUsers(role);
                setResults(data);
                applyFilters(data, searchQuery, minRating, onlyAvailable, selectedSkills, selectedShopCategories, selectedContractorServices);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [role]);

    const applyFilters = (data: any[], query: string, rating: number, available: boolean, skills: string[], shopCats: string[], contractorServices: string[]) => {
        let filtered = [...data];

        if (query) {
            const lowerText = query.toLowerCase();
            filtered = filtered.filter(item =>
                (item.name || '').toLowerCase().includes(lowerText) ||
                (item.category || '').toLowerCase().includes(lowerText) ||
                (item.shopCategories || []).some((c: string) => c.toLowerCase().includes(lowerText)) ||
                (item.location || '').toLowerCase().includes(lowerText)
            );
        }

        if (rating > 0) {
            filtered = filtered.filter(item => (item.averageRating || 4.5) >= rating);
        }

        if (available && role === 'worker') {
            filtered = filtered.filter(item => item.isAvailable !== false);
        }

        if (skills.length > 0 && role === 'worker') {
            filtered = filtered.filter(item =>
                (item.skills || []).some((s: string) => skills.includes(s))
            );
        }

        if (shopCats.length > 0 && role === 'shop') {
            filtered = filtered.filter(item =>
                (item.shopCategories || []).some((c: string) => shopCats.includes(c))
            );
        }

        if (contractorServices.length > 0 && role === 'contractor') {
            filtered = filtered.filter(item =>
                (item.contractorServices || []).some((s: string) => contractorServices.includes(s))
            );
        }

        setFilteredResults(filtered);
    };

    const toggleSkill = (skillName: string) => {
        if (selectedSkills.includes(skillName)) {
            setSelectedSkills((prev: string[]) => prev.filter((s: string) => s !== skillName));
        } else {
            setSelectedSkills((prev: string[]) => [...prev, skillName]);
        }
    };

    const toggleShopCategory = (catName: string) => {
        if (selectedShopCategories.includes(catName)) {
            setSelectedShopCategories((prev: string[]) => prev.filter((c: string) => c !== catName));
        } else {
            setSelectedShopCategories((prev: string[]) => [...prev, catName]);
        }
    };

    const toggleContractorService = (serviceName: string) => {
        if (selectedContractorServices.includes(serviceName)) {
            setSelectedContractorServices((prev: string[]) => prev.filter((s: string) => s !== serviceName));
        } else {
            setSelectedContractorServices((prev: string[]) => [...prev, serviceName]);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        applyFilters(results, text, minRating, onlyAvailable, selectedSkills, selectedShopCategories, selectedContractorServices);
    };

    const handleApplyFilters = () => {
        applyFilters(results, searchQuery, minRating, onlyAvailable, selectedSkills, selectedShopCategories, selectedContractorServices);
        setShowFilterModal(false);
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
                contractorServices: JSON.stringify(user.contractorServices || []),
                workerBanner: user.workerBanner
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

                <View style={styles.searchBarContainer}>
                    <View style={styles.searchBar}>
                        <MaterialCommunityIcons name="magnify" size={20} color="#545454" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search ${title?.toLowerCase()}...`}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            placeholderTextColor="#545454"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <MaterialCommunityIcons name="close-circle" size={18} color="#545454" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <MaterialCommunityIcons
                            name="tune-variant"
                            size={20}
                            color="#000"
                        />
                    </TouchableOpacity>
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
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const isOpen = role === 'shop' ? isShopOpen(item.openingTime, item.closingTime) : false;
                        const isOnline = role === 'worker' ? (item.isAvailable !== false) : true;

                        return (
                            <TouchableOpacity style={styles.cardItem} onPress={() => handleNavigate(item)}>
                                <View style={styles.cardBanner}>
                                    {isValidUri(item.shopBanner || item.companyBanner || item.workerBanner) ? (
                                        <Image
                                            source={{ uri: item.shopBanner || item.companyBanner || item.workerBanner }}
                                            style={styles.bannerImg}
                                        />
                                    ) : (
                                        <View style={[styles.placeholderBanner, { backgroundColor: role === 'worker' ? '#F3F4FF' : '#F9F9F9' }]} />
                                    )}

                                    {/* Status Badge */}
                                    <View style={[
                                        styles.statusBadge,
                                        role === 'shop' ? (isOpen ? styles.statusOpen : styles.statusClosed) : (isOnline ? styles.statusAvailable : styles.statusBusy)
                                    ]}>
                                        <View style={[
                                            styles.statusDot,
                                            role === 'shop' ? (isOpen ? styles.dotOpen : styles.dotClosed) : (isOnline ? styles.dotAvailable : styles.dotBusy)
                                        ]} />
                                        <Text style={styles.statusText}>
                                            {role === 'shop' ? (isOpen ? 'Open Now' : 'Closed') : (isOnline ? 'Available' : 'Busy')}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.cardBody}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardAvatar}>
                                            {role === 'shop' ? (
                                                item.shopLogo ? (
                                                    <Image source={{ uri: item.shopLogo }} style={styles.avatarImg} />
                                                ) : (
                                                    <MaterialCommunityIcons name="store" size={20} color="black" />
                                                )
                                            ) : role === 'contractor' ? (
                                                item.companyLogo ? (
                                                    <Image source={{ uri: item.companyLogo }} style={styles.avatarImg} />
                                                ) : (
                                                    <MaterialCommunityIcons name="briefcase" size={20} color="black" />
                                                )
                                            ) : (
                                                item.photoURL ? (
                                                    <Image source={{ uri: item.photoURL }} style={styles.avatarImg} />
                                                ) : (
                                                    <MaterialCommunityIcons name="account" size={20} color="black" />
                                                )
                                            )}
                                        </View>
                                        <View style={styles.cardTitleSection}>
                                            <Text style={styles.cardName} numberOfLines={1}>
                                                {item.shopName || item.companyName || item.name}
                                            </Text>
                                            <Text style={styles.cardSub} numberOfLines={1}>
                                                {role === 'worker' ? (item.skills?.join(', ') || 'General Worker') :
                                                    role === 'shop' ? (item.shopCategories?.slice(0, 2).join(', ') || 'Building Materials') :
                                                        (item.contractorServices?.slice(0, 2).join(', ') || 'General Contractor')}
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
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="account-search-outline" size={64} color="#EEE" />
                            <Text style={styles.emptyText}>No matches found</Text>
                        </View>
                    }
                />
            )}

            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={styles.filterLabel}>Rating</Text>
                            <View style={styles.filterOptions}>
                                {[0, 3, 4, 4.5].map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[styles.filterOption, minRating === r && styles.filterOptionSelected]}
                                        onPress={() => setMinRating(r)}
                                    >
                                        <Text style={[styles.filterOptionText, minRating === r && styles.filterOptionTextSelected]}>
                                            {r === 0 ? 'Any' : `${r}+ ⭐`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {role === 'worker' && (
                                <>
                                    <Text style={styles.filterLabel}>Status</Text>
                                    <TouchableOpacity
                                        style={styles.switchRow}
                                        onPress={() => setOnlyAvailable(!onlyAvailable)}
                                    >
                                        <Text style={styles.switchLabel}>Only available workers</Text>
                                        <View style={[styles.switch, onlyAvailable && styles.switchOn]}>
                                            <View style={[styles.switchKnob, onlyAvailable && styles.switchKnobOn]} />
                                        </View>
                                    </TouchableOpacity>

                                    <Text style={styles.filterLabel}>Skills</Text>
                                    <View style={styles.chipGrid}>
                                        {SKILLS_DATA.map((item) => {
                                            const isSelected = selectedSkills.includes(item.name);
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[styles.chip, isSelected && styles.chipSelected]}
                                                    onPress={() => toggleSkill(item.name)}
                                                >
                                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.name}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </>
                            )}

                            {role === 'shop' && (
                                <>
                                    <Text style={styles.filterLabel}>Categories</Text>
                                    <View style={styles.chipGrid}>
                                        {SHOP_CATEGORIES.map((item) => {
                                            const isSelected = selectedShopCategories.includes(item.name);
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[styles.chip, isSelected && styles.chipSelected]}
                                                    onPress={() => toggleShopCategory(item.name)}
                                                >
                                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.name}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </>
                            )}

                            {role === 'contractor' && (
                                <>
                                    <Text style={styles.filterLabel}>Services</Text>
                                    <View style={styles.chipGrid}>
                                        {CONTRACTOR_SERVICES.map((item) => {
                                            const isSelected = selectedContractorServices.includes(item.name);
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[styles.chip, isSelected && styles.chipSelected]}
                                                    onPress={() => toggleContractorService(item.name)}
                                                >
                                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.name}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.resetBtn}
                                onPress={() => {
                                    setMinRating(0);
                                    setOnlyAvailable(false);
                                    setSelectedSkills([]);
                                    setSelectedShopCategories([]);
                                    setSelectedContractorServices([]);
                                }}
                            >
                                <Text style={styles.resetBtnText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={handleApplyFilters}
                            >
                                <Text style={styles.applyBtnText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    headerTop: {
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
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        padding: 0,
    },
    filterBtn: {
        width: 48,
        height: 48,
        backgroundColor: '#F3F3F3',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
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
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    cardTitleSection: {
        flex: 1,
    },
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
        gap: 8,
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
        marginHorizontal: 8,
        color: '#CCC',
        fontSize: 12,
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
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    statusAvailable: { backgroundColor: '#F0FDF4' },
    statusBusy: { backgroundColor: '#FEF2F2' },
    statusOpen: { backgroundColor: '#F0FDF4' },
    statusClosed: { backgroundColor: '#FEF2F2' },
    dotAvailable: { backgroundColor: '#22C55E' },
    dotBusy: { backgroundColor: '#EF4444' },
    dotOpen: { backgroundColor: '#22C55E' },
    dotClosed: { backgroundColor: '#EF4444' },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#AFAFAF',
        fontWeight: '600',
        marginTop: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    modalBody: {
        marginBottom: 24,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        marginTop: 16,
    },
    filterOptions: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    filterOption: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F3F3F3',
    },
    filterOptionSelected: {
        backgroundColor: '#000',
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    filterOptionTextSelected: {
        color: '#FFF',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
    },
    switch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#DDD',
        padding: 2,
    },
    switchOn: {
        backgroundColor: '#000',
    },
    switchKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF',
    },
    switchKnobOn: {
        transform: [{ translateX: 22 }],
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F3F3F3',
    },
    chipSelected: {
        backgroundColor: '#000',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
    },
    chipTextSelected: {
        color: '#FFF',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 16,
    },
    resetBtn: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F3F3F3',
    },
    resetBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    applyBtn: {
        flex: 2,
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#000',
    },
    applyBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
