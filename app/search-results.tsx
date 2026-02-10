import { CONTRACTOR_SERVICES } from '@/constants/contractorServices';
import { SHOP_CATEGORIES } from '@/constants/shopCategories';
import { SKILLS_DATA } from '@/constants/skills';
import { Colors, Spacing } from '@/constants/theme';
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

                <View style={styles.searchBarContainer}>
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
                    <TouchableOpacity
                        style={[styles.filterBtn, (minRating > 0 || onlyAvailable) && styles.filterBtnActive]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <MaterialCommunityIcons
                            name="tune-variant"
                            size={20}
                            color={(minRating > 0 || onlyAvailable) ? 'white' : 'black'}
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
                    renderItem={({ item }) => {
                        if (item.role === 'contractor') {
                            return (
                                <TouchableOpacity style={styles.contractorCard} onPress={() => handleNavigate(item)}>
                                    {isValidUri(item.companyBanner) ? (
                                        <Image
                                            source={{ uri: item.companyBanner }}
                                            style={styles.cardCover}
                                        />
                                    ) : (
                                        <View style={[styles.cardCover, { justifyContent: 'center', alignItems: 'center' }]}>
                                            <MaterialCommunityIcons name="briefcase-outline" size={40} color="#cbd5e1" />
                                        </View>
                                    )}
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
                            return (
                                <TouchableOpacity style={styles.premiumShopCard} onPress={() => handleNavigate(item)}>
                                    {isValidUri(item.shopBanner) ? (
                                        <Image
                                            source={{ uri: item.shopBanner }}
                                            style={styles.shopCover}
                                        />
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

            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Search</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.filterLabel}>Minimum Rating</Text>
                            <View style={styles.ratingOptions}>
                                {[0, 3, 4, 4.5].map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[styles.ratingOption, minRating === r && styles.ratingOptionActive]}
                                        onPress={() => setMinRating(r)}
                                    >
                                        <Text style={[styles.ratingOptionText, minRating === r && styles.ratingOptionTextActive]}>
                                            {r === 0 ? 'Any' : `${r}+ ⭐`}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {role === 'worker' && (
                                <>
                                    <Text style={styles.filterLabel}>Availability</Text>
                                    <TouchableOpacity
                                        style={styles.switchRow}
                                        onPress={() => setOnlyAvailable(!onlyAvailable)}
                                    >
                                        <Text style={styles.switchLabel}>Only Show Available Workers</Text>
                                        <View style={[styles.switch, onlyAvailable && styles.switchOn]}>
                                            <View style={[styles.switchKnob, onlyAvailable && styles.switchKnobOn]} />
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={styles.filterLabel}>Worker Skills</Text>
                                    <View style={styles.skillsGrid}>
                                        {SKILLS_DATA.map((item) => {
                                            const isSelected = selectedSkills.includes(item.name);
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[styles.smallSkillCard, isSelected && styles.smallSelectedCard]}
                                                    onPress={() => toggleSkill(item.name)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Image source={item.image} style={styles.smallSkillImage} resizeMode="cover" />
                                                    <View style={[styles.smallOverlay, isSelected && styles.smallSelectedOverlay]}>
                                                        <Text style={[styles.smallSkillName, isSelected && styles.smallSelectedText]} numberOfLines={1}>{item.name}</Text>
                                                    </View>
                                                    {isSelected && (
                                                        <View style={styles.smallCheckIcon}>
                                                            <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </>
                            )}

                            {role === 'shop' && (
                                <>
                                    <Text style={styles.filterLabel}>Shop Categories</Text>
                                    <View style={styles.skillsGrid}>
                                        {SHOP_CATEGORIES.map((item) => {
                                            const isSelected = selectedShopCategories.includes(item.name);
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[styles.smallSkillCard, isSelected && styles.smallSelectedCard]}
                                                    onPress={() => toggleShopCategory(item.name)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Image source={item.image} style={styles.smallSkillImage} resizeMode="cover" />
                                                    <View style={[styles.smallOverlay, isSelected && styles.smallSelectedOverlay]}>
                                                        <Text style={[styles.smallSkillName, isSelected && styles.smallSelectedText]} numberOfLines={1}>{item.name}</Text>
                                                    </View>
                                                    {isSelected && (
                                                        <View style={styles.smallCheckIcon}>
                                                            <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </>
                            )}

                            {role === 'contractor' && (
                                <>
                                    <Text style={styles.filterLabel}>Contractor Services</Text>
                                    <View style={styles.skillsGrid}>
                                        {CONTRACTOR_SERVICES.map((item) => {
                                            const isSelected = selectedContractorServices.includes(item.name);
                                            return (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[styles.smallSkillCard, isSelected && styles.smallSelectedCard, styles.iconCard]}
                                                    onPress={() => toggleContractorService(item.name)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={styles.iconContainer}>
                                                        <MaterialCommunityIcons
                                                            name={item.icon as any}
                                                            size={32}
                                                            color={isSelected ? Colors.light.tint || 'black' : '#64748b'}
                                                        />
                                                    </View>
                                                    <View style={[styles.smallOverlay, isSelected && styles.smallSelectedOverlay]}>
                                                        <Text style={[styles.smallSkillName, isSelected && styles.smallSelectedText]} numberOfLines={1}>{item.name}</Text>
                                                    </View>
                                                    {isSelected && (
                                                        <View style={styles.smallCheckIcon}>
                                                            <MaterialCommunityIcons name="check-circle" size={16} color="#10b981" />
                                                        </View>
                                                    )}
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
                                <Text style={styles.applyBtnText}>Apply Filters</Text>
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
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
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
    filterBtn: {
        width: 48,
        height: 48,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBtnActive: {
        backgroundColor: 'black',
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
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
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    modalBody: {
        marginBottom: 24,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 12,
        marginTop: 12,
    },
    ratingOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    ratingOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    ratingOptionActive: {
        backgroundColor: 'black',
        borderColor: 'black',
    },
    ratingOptionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    ratingOptionTextActive: {
        color: 'white',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    switch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e2e8f0',
        padding: 2,
    },
    switchOn: {
        backgroundColor: '#10b981',
    },
    switchKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'white',
        elevation: 2,
    },
    switchKnobOn: {
        transform: [{ translateX: 22 }],
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    resetBtn: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    resetBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#475569',
    },
    applyBtn: {
        flex: 2,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    applyBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
    // New Skill Filter Styles
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    smallSkillCard: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        position: 'relative',
        marginBottom: 4,
    },
    smallSelectedCard: {
        borderWidth: 2,
        borderColor: 'black',
    },
    smallSkillImage: {
        width: '100%',
        height: '100%',
        zIndex: 1,
    },
    smallSelectedOverlay: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        zIndex: 2,
    },
    smallOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 2,
    },
    smallSkillName: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    smallSelectedText: {
        color: 'black',
    },
    smallCheckIcon: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'white',
        borderRadius: 10,
        zIndex: 10,
    },
    iconCard: {
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20, // Space for label overlay
    },
});
