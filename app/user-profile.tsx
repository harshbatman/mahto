import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getChatId } from '@/services/db/messageService';
import { getShopProducts, Product } from '@/services/db/productService';
import { getWorkerReviews, Review, submitRating } from '@/services/db/ratingService';
import { getUserProfile, UserProfile } from '@/services/db/userProfile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Linking, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
    const router = useRouter();
    const { user: currentUser, profile: currentProfile } = useAuth();
    const params = useLocalSearchParams();
    const { id: profileUid, name, shopOwnerName, role, category, rating, distance, phoneNumber, location, skills: skillsStr, experienceYears, about, dailyRate, isAvailable, shopCategories: shopCategoriesStr, shopLogo: paramShopLogo, shopBanner: paramShopBanner, openingTime: paramOpeningTime, closingTime: paramClosingTime, address: paramAddress, companyName, companyLogo, companyBanner, ownerName, contractorServices: contractorServicesStr, yearsInBusiness: paramYearsInBusiness } = params;
    const [freshProfile, setFreshProfile] = useState<UserProfile | null>(null);
    const [displayPhoto, setDisplayPhoto] = useState<string | undefined>(undefined);
    const [displayBanner, setDisplayBanner] = useState<string | undefined>(undefined);

    const isActuallyAvailable = isAvailable === 'true' || freshProfile?.isAvailable;
    const skills = freshProfile?.skills || (skillsStr ? JSON.parse(skillsStr as string) : []);
    const shopCategories = freshProfile?.shopCategories || (shopCategoriesStr ? JSON.parse(shopCategoriesStr as string) : []);
    const contractorServices = freshProfile?.contractorServices || (contractorServicesStr ? JSON.parse(contractorServicesStr as string) : []);
    const displayAbout = freshProfile?.about || about;
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    // Products State
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productModalVisible, setProductModalVisible] = useState(false);

    useEffect(() => {
        const uid = Array.isArray(params.id) ? params.id[0] : params.id;
        if (!uid) return;

        const sanitizeUri = (uri: string | undefined): string | undefined => {
            if (!uri) return undefined;
            if (uri.startsWith('file://')) return undefined; // Don't try to render local URIs
            return uri;
        };

        const fetchData = async () => {
            try {
                // Fetch Profile
                const userProfile = await getUserProfile(uid);
                if (userProfile) {
                    setFreshProfile(userProfile);

                    const photo = sanitizeUri(userProfile.shopLogo || userProfile.companyLogo || userProfile.photoURL);
                    if (photo) setDisplayPhoto(photo);

                    const banner = sanitizeUri(userProfile.shopBanner || userProfile.companyBanner);
                    if (banner) setDisplayBanner(banner);
                }

                // Fetch Products if it's a shop
                if (role === 'shop' || userProfile?.role === 'shop') {
                    const shopProducts = await getShopProducts(uid);
                    setProducts(shopProducts);
                }

                // Fetch Reviews
                const data = await getWorkerReviews(uid);
                setReviews(data.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
            } catch (error) {
                console.error("Profile Fetch Error:", error);
            } finally {
                setLoadingReviews(false);
            }
        };

        // Initialize with params if available
        const paramPhoto = sanitizeUri((paramShopLogo || companyLogo || params.photoURL) as string);
        if (paramPhoto) setDisplayPhoto(paramPhoto);

        const paramBanner = sanitizeUri((paramShopBanner || companyBanner) as string);
        if (paramBanner) setDisplayBanner(paramBanner);

        fetchData();
    }, [params.id, paramShopLogo, paramShopBanner, params.photoURL, companyLogo, companyBanner]);

    const handleCall = () => {
        if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleMessage = () => {
        if (!currentUser) {
            router.push('/(auth)/phone-login');
            return;
        }
        const otherUid = Array.isArray(profileUid) ? profileUid[0] : profileUid;
        if (!otherUid) return;
        const chatId = getChatId(currentUser.uid, otherUid);
        router.push({
            pathname: '/messages/[id]',
            params: { id: chatId, otherUserId: otherUid, otherUserName: name as string }
        });
    };

    const openProduct = (product: Product) => {
        setSelectedProduct(product);
        setProductModalVisible(true);
    };

    const handleRatingSubmit = async () => {
        if (!selectedRating || !currentUser) return;
        setSubmitting(true);
        try {
            const uid = Array.isArray(params.id) ? params.id[0] : params.id;
            await submitRating({
                workerId: uid as string,
                reviewerId: currentUser.uid,
                reviewerName: currentProfile?.name || 'Homeowner',
                rating: selectedRating,
                comment,
                createdAt: new Date()
            });
            Alert.alert('Success', 'Rating submitted successfully');
            setRatingModalVisible(false);
            // Refresh reviews
            const data = await getWorkerReviews(uid as string);
            setReviews(data.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
        } catch (error) {
            Alert.alert('Error', 'Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity style={styles.productCard} onPress={() => openProduct(item)}>
            <Image source={{ uri: item.images[0] }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.productPrice}>
                    {item.contactForPrice ? 'Contact for Price' : `₹${item.price}`}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{freshProfile?.name || name || 'Profile'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {(role === 'shop' || role === 'contractor') && displayBanner && (
                    <View style={styles.profileBannerContainer}>
                        <Image source={{ uri: displayBanner }} style={styles.profileBanner} />
                    </View>
                )}

                <View style={[
                    styles.profileHero,
                    ((role === 'shop' || role === 'contractor') && displayBanner) && styles.shopProfileHero,
                    ((role === 'shop' || role === 'contractor') && !displayBanner) && { paddingVertical: 40 }
                ]}>
                    <View style={[styles.avatarContainer, (role === 'shop' || role === 'contractor') && styles.shopAvatarContainer]}>
                        {displayPhoto ? (
                            <Image source={{ uri: displayPhoto }} style={styles.avatarImage} />
                        ) : (
                            <MaterialCommunityIcons name={role === 'shop' ? "store" : role === 'contractor' ? "briefcase" : "account"} size={60} color="#9ca3af" />
                        )}
                    </View>
                    <Text style={styles.userName}>
                        {role === 'shop' || freshProfile?.role === 'shop' ? (freshProfile?.shopName || freshProfile?.name || name) : role === 'contractor' || freshProfile?.role === 'contractor' ? (freshProfile?.companyName || companyName || freshProfile?.name || name) : (freshProfile?.name || name)}
                    </Text>
                    <Text style={styles.userRole}>
                        {role === 'shop' || freshProfile?.role === 'shop' ? (freshProfile?.shopCategories?.join(', ') || category) : role === 'contractor' || freshProfile?.role === 'contractor' ? (freshProfile?.contractorServices?.join(', ') || contractorServices?.join(', ') || category) : (freshProfile?.category || category)}
                    </Text>
                    {(role === 'shop' || freshProfile?.role === 'shop') && (freshProfile?.shopOwnerName || shopOwnerName) && (
                        <Text style={[styles.userRole, { marginTop: 2, fontSize: 13, fontWeight: '600' }]}>
                            Owner: {freshProfile?.shopOwnerName || shopOwnerName}
                        </Text>
                    )}
                    {(role === 'contractor' || freshProfile?.role === 'contractor') && (freshProfile?.ownerName || ownerName) && (
                        <Text style={[styles.userRole, { marginTop: 2, fontSize: 13, fontWeight: '600' }]}>
                            Owner: {freshProfile?.ownerName || ownerName}
                        </Text>
                    )}

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{freshProfile?.averageRating || rating || '0'}</Text>
                            <Text style={styles.statLabel}>{freshProfile?.ratingCount || 0} Ratings</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{freshProfile?.yearsInBusiness || paramYearsInBusiness || freshProfile?.experienceYears || experienceYears || '0'}yr</Text>
                            <Text style={styles.statLabel}>{role === 'shop' || role === 'contractor' ? 'In Business' : 'Experience'}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{distance || 'Nearby'}</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>



                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{role === 'shop' || freshProfile?.role === 'shop' ? 'Shop Information' : 'Contact & Location'}</Text>
                        <View style={styles.infoCard}>
                            {role === 'shop' || freshProfile?.role === 'shop' ? (
                                <>
                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.light.muted} />
                                        <Text style={styles.infoText}>
                                            Business Hours: {freshProfile?.openingTime || paramOpeningTime || '8:00 AM'} - {freshProfile?.closingTime || paramClosingTime || '8:00 PM'}
                                        </Text>
                                    </View>
                                    <View style={[styles.infoRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.light.muted} />
                                        <Text style={styles.infoText}>{freshProfile?.address || paramAddress || freshProfile?.location || location || 'Address not provided'}</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons name="map-marker-radius" size={20} color={Colors.light.muted} />
                                    <Text style={styles.infoText}>{freshProfile?.address || paramAddress || freshProfile?.location || location || 'Address not provided'}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {displayAbout && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <View style={styles.infoCard}>
                                <Text style={styles.aboutText}>{displayAbout}</Text>
                            </View>
                        </View>
                    )}

                    {((role === 'worker' || freshProfile?.role === 'worker') && skills.length > 0) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Skills & Expertise</Text>
                            <View style={styles.skillsContainer}>
                                {skills.map((skill: string, index: number) => (
                                    <View key={index} style={styles.skillBadge}>
                                        <Text style={styles.skillBadgeText}>{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {((role === 'contractor' || freshProfile?.role === 'contractor') && contractorServices.length > 0) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Services Offered</Text>
                            <View style={styles.skillsContainer}>
                                {contractorServices.map((service: string, index: number) => (
                                    <View key={index} style={styles.skillBadge}>
                                        <Text style={styles.skillBadgeText}>{service}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}



                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.primaryBtn} onPress={handleCall}>
                            <MaterialCommunityIcons name="phone" size={20} color="white" />
                            <Text style={styles.primaryBtnText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn} onPress={handleMessage}>
                            <MaterialCommunityIcons name="message-text" size={20} color="black" />
                            <Text style={styles.secondaryBtnText}>Message</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Rating Section - Always visible for layout/testing */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={[styles.ratingBtn, { backgroundColor: '#fff7ed', borderColor: '#fdba74', borderWidth: 2 }]}
                            onPress={() => {
                                if (!currentUser) {
                                    router.push('/(auth)/phone-login');
                                    return;
                                }
                                setSelectedRating(0);
                                setComment('');
                                setRatingModalVisible(true);
                            }}
                        >
                            <MaterialCommunityIcons name="star" size={26} color="#f59e0b" />
                            <Text style={[styles.ratingBtnText, { color: '#9a3412', fontSize: 18 }]}>Rate this {role === 'shop' ? 'Shop' : role === 'contractor' ? 'Company' : 'Business'}</Text>
                        </TouchableOpacity>
                    </View>


                    {/* Reviews Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
                        </View>

                        {reviews.length > 0 ? (
                            reviews.map((rev, idx) => (
                                <View key={rev.id || idx} style={styles.reviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.reviewerInfo}>
                                            <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
                                            <View style={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <MaterialCommunityIcons
                                                        key={s}
                                                        name={s <= rev.rating ? "star" : "star-outline"}
                                                        size={14}
                                                        color="#f59e0b"
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                        <Text style={styles.reviewDate}>
                                            {rev.createdAt?.toDate ? rev.createdAt.toDate().toLocaleDateString() : new Date(rev.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    {rev.comment ? (
                                        <Text style={styles.reviewComment}>{rev.comment}</Text>
                                    ) : null}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyReviews}>
                                <MaterialCommunityIcons name="comment-outline" size={32} color="#cbd5e1" />
                                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                            </View>
                        )}
                    </View>

                    {/* Products Section for Shops - Moved to Bottom */}
                    {role === 'shop' && products.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Product Catalog</Text>
                            <FlatList
                                data={products}
                                renderItem={renderProductItem}
                                keyExtractor={(item) => item.id!}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.productList}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Rating Modal */}
            <Modal visible={ratingModalVisible} transparent={true} animationType="slide">
                <View style={styles.ratingModalOverlay}>
                    <View style={styles.ratingModalContent}>
                        <Text style={styles.ratingModalTitle}>Rate {role === 'shop' ? 'Shop' : 'Worker'}</Text>
                        <Text style={styles.ratingModalSub}>How was your experience with {name}?</Text>

                        <View style={styles.starRow}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                                    <MaterialCommunityIcons
                                        name={star <= selectedRating ? "star" : "star-outline"}
                                        size={40}
                                        color="#f59e0b"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Add a comment (optional)"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                        />

                        <View style={styles.ratingModalButtons}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setRatingModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitRatingBtn, !selectedRating && { opacity: 0.5 }]}
                                onPress={handleRatingSubmit}
                                disabled={!selectedRating || submitting}
                            >
                                <Text style={styles.submitRatingBtnText}>
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Product Detail Modal with Horizontal Image Slider */}
            <Modal
                visible={productModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setProductModalVisible(false)}
            >
                <View style={styles.productModalOverlay}>
                    <View style={styles.productModalContent}>
                        <TouchableOpacity
                            style={styles.closeModalBtn}
                            onPress={() => setProductModalVisible(false)}
                        >
                            <MaterialCommunityIcons name="close" size={28} color="black" />
                        </TouchableOpacity>

                        {selectedProduct && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Horizontal Image Slider */}
                                <FlatList
                                    data={selectedProduct?.images || []}
                                    keyExtractor={(img, index) => index.toString()}
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <Image source={{ uri: item }} style={styles.fullProductImage} />
                                    )}
                                />

                                <View style={styles.productDetailInfo}>
                                    <Text style={styles.productDetailTitle}>{selectedProduct?.title}</Text>
                                    <View style={styles.priceContainer}>
                                        {selectedProduct?.contactForPrice ? (
                                            <View style={styles.contactBadge}>
                                                <Text style={styles.contactBadgeText}>Contact for Price</Text>
                                            </View>
                                        ) : (
                                            <Text style={styles.productDetailPrice}>₹{selectedProduct?.price}</Text>
                                        )}
                                    </View>

                                    <Text style={styles.productDetailDescLabel}>Description</Text>
                                    <Text style={styles.productDetailDesc}>{selectedProduct?.description || 'No description provided.'}</Text>

                                    <TouchableOpacity style={styles.inquiryBtn} onPress={handleCall}>
                                        <MaterialCommunityIcons name="phone" size={20} color="white" />
                                        <Text style={styles.inquiryBtnText}>Call for Inquiry</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    callHeaderBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 12 },
    profileHero: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#f8fafc', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowOpacity: 0.1, overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    userName: { fontSize: 22, fontWeight: '900', marginTop: 12 },
    userRole: { fontSize: 14, color: '#64748b', marginTop: 4 },
    statsRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
    statItem: { alignItems: 'center', paddingHorizontal: 24 },
    statValue: { fontSize: 18, fontWeight: '800' },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
    statDivider: { width: 1, height: 24, backgroundColor: '#e2e8f0' },
    profileBannerContainer: {
        width: width - (Spacing.lg * 2),
        height: 180,
        alignSelf: 'center',
        borderRadius: 24,
        overflow: 'hidden',
        marginTop: 8,
    },
    profileBanner: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f1f5f9',
        borderRadius: 24,
    },
    bannerPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    shopProfileHero: {
        marginTop: -50,
        backgroundColor: 'transparent',
    },
    shopAvatarContainer: {
        borderWidth: 4,
        borderColor: 'white',
    },
    content: { padding: Spacing.lg },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
    productList: { gap: 12 },
    productCard: { width: 160, backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
    productImage: { width: '100%', aspectRatio: 1 },
    productInfo: { padding: 12 },
    productTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    productPrice: { fontSize: 12, fontWeight: '800', color: '#10b981', marginTop: 4 },
    aboutText: { fontSize: 15, color: '#475569', lineHeight: 24 },
    infoCard: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoText: { fontSize: 14, color: '#1e293b', flex: 1 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 40 },
    primaryBtn: { flex: 1.5, backgroundColor: 'black', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 8 },
    primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
    secondaryBtn: { flex: 1, backgroundColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 8 },
    secondaryBtnText: { color: 'black', fontWeight: '800', fontSize: 16 },
    ratingBtn: {
        backgroundColor: '#fffbeb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: '#fef3c7',
        marginBottom: 32,
    },
    ratingBtnText: {
        color: '#b45309',
        fontSize: 16,
        fontWeight: '800',
    },
    ratingModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    ratingModalContent: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 28,
        alignItems: 'center',
    },
    ratingModalTitle: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 8,
        color: '#1e293b',
    },
    ratingModalSub: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    starRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    reviewInput: {
        width: '100%',
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 16,
        height: 120,
        textAlignVertical: 'top',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        fontSize: 15,
    },
    ratingModalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelBtnText: {
        fontWeight: '800',
        color: '#64748b',
        fontSize: 15,
    },
    submitRatingBtn: {
        flex: 1,
        backgroundColor: 'black',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    submitRatingBtnText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 15,
    },
    reviewCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reviewerInfo: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    reviewStars: {
        flexDirection: 'row',
        marginTop: 2,
    },
    reviewDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    reviewComment: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    emptyReviews: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        borderStyle: 'dashed',
    },
    emptyReviewsText: {
        marginTop: 8,
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
    },
    productModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    productModalContent: { width: width * 0.9, maxHeight: '85%', backgroundColor: 'white', borderRadius: 32, overflow: 'hidden', position: 'relative' },
    closeModalBtn: { position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: 'white', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    fullProductImage: { width: width * 0.9, aspectRatio: 1 },
    productDetailInfo: { padding: 24 },
    productDetailTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    priceContainer: { marginTop: 12, marginBottom: 20 },
    productDetailPrice: { fontSize: 22, fontWeight: '800', color: '#10b981' },
    contactBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#bbf7d0' },
    contactBadgeText: { color: '#166534', fontWeight: '800', fontSize: 14 },
    productDetailDescLabel: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
    productDetailDesc: { fontSize: 15, color: '#64748b', lineHeight: 22, marginBottom: 24 },
    inquiryBtn: { backgroundColor: 'black', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, gap: 10 },
    inquiryBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillBadge: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    skillBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1d4ed8',
    },
});
