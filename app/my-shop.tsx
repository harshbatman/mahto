import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { deleteProduct, getShopProducts, Product } from '@/services/db/productService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function MyShopViewScreen() {
    const { profile, user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productModalVisible, setProductModalVisible] = useState(false);

    const fetchProducts = async () => {
        if (!user) return;
        try {
            const data = await getShopProducts(user.uid);
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const handleDeleteProduct = (id: string) => {
        Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteProduct(id);
                        setProducts(products.filter(p => p.id !== id));
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete product');
                    }
                }
            }
        ]);
    };

    const openProduct = (product: Product) => {
        setSelectedProduct(product);
        setProductModalVisible(true);
    };

    const renderProductItem = (item: Product) => (
        <View key={item.id} style={styles.productCard}>
            <TouchableOpacity onPress={() => openProduct(item)}>
                <Image source={{ uri: item.images[0] }} style={styles.productImage} />
            </TouchableOpacity>
            <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.productPrice}>
                    {item.contactForPrice ? 'Contact for Price' : `₹${item.price}`}
                </Text>
            </View>
            <View style={styles.productActions}>
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/manage-product',
                        params: {
                            id: item.id,
                            title: item.title,
                            description: item.description,
                            price: item.price?.toString(),
                            contactForPrice: item.contactForPrice.toString(),
                            images: JSON.stringify(item.images)
                        }
                    })}
                    style={styles.actionBtn}
                >
                    <MaterialCommunityIcons name="pencil" size={18} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteProduct(item.id!)}
                    style={styles.actionBtn}
                >
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Shop</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Shop Banner */}
                {profile?.shopBanner && (
                    <View style={styles.bannerContainer}>
                        <Image source={{ uri: profile.shopBanner }} style={styles.banner} />
                    </View>
                )}

                {/* Profile Hero Section - Matching user-profile.tsx */}
                <View style={[styles.profileHero, !profile?.shopBanner && { marginTop: 20 }]}>
                    <View style={styles.avatarContainer}>
                        {profile?.shopLogo ? (
                            <Image source={{ uri: profile.shopLogo }} style={styles.avatarImage} />
                        ) : (
                            <MaterialCommunityIcons name="store" size={60} color="#9ca3af" />
                        )}
                    </View>
                    <Text style={styles.userName}>{profile?.shopName || 'My Shop'}</Text>
                    <Text style={styles.userRole}>
                        {profile?.shopCategories?.join(', ') || 'General Supplier'}
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile?.averageRating || '0'}</Text>
                            <Text style={styles.statLabel}>{profile?.ratingCount || 0} Ratings</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile?.experienceYears || '0'}yr</Text>
                            <Text style={styles.statLabel}>In Business</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>Self</Text>
                            <Text style={styles.statLabel}>Dashboard</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>


                    {/* Shop Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shop Information</Text>
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.light.muted} />
                                <Text style={styles.infoText}>
                                    Business Hours: {profile?.openingTime || '8:00 AM'} - {profile?.closingTime || '8:00 PM'}
                                </Text>
                            </View>
                            <View style={[styles.infoRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
                                <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.light.muted} />
                                <Text style={styles.infoText}>{profile?.address || 'Address not provided'}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editProfileFullBtn}
                        onPress={() => router.push('/edit-shop' as any)}
                    >
                        <MaterialCommunityIcons name="store-edit-outline" size={22} color="white" />
                        <Text style={styles.editBtnFullText}>Edit Shop Profile</Text>
                    </TouchableOpacity>

                    {/* Product Catalog Section - Moved to Bottom */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Product Catalog</Text>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => router.push('/manage-product')}
                            >
                                <MaterialCommunityIcons name="plus" size={20} color="white" />
                                <Text style={styles.addBtnText}>Add Product</Text>
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="small" color="black" style={{ marginTop: 20 }} />
                        ) : products.length > 0 ? (
                            <View style={styles.productGrid}>
                                {products.map(renderProductItem)}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="package-variant" size={48} color="#e2e8f0" />
                                <Text style={styles.emptyText}>No products added yet</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Product Detail Modal - Matching user-profile.tsx */}
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

                                    <View style={styles.modalActionRow}>
                                        <TouchableOpacity
                                            style={styles.modalEditBtn}
                                            onPress={() => {
                                                setProductModalVisible(false);
                                                router.push({
                                                    pathname: '/manage-product',
                                                    params: {
                                                        id: selectedProduct.id,
                                                        title: selectedProduct.title,
                                                        description: selectedProduct.description,
                                                        price: selectedProduct.price?.toString(),
                                                        contactForPrice: selectedProduct.contactForPrice.toString(),
                                                        images: JSON.stringify(selectedProduct.images)
                                                    }
                                                });
                                            }}
                                        >
                                            <MaterialCommunityIcons name="pencil" size={20} color="white" />
                                            <Text style={styles.modalBtnText}>Edit Product</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    editHeaderBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 12 },
    bannerContainer: { width: width - (Spacing.lg * 2), height: 180, alignSelf: 'center', borderRadius: 24, overflow: 'hidden', marginTop: 8 },
    banner: { width: '100%', height: '100%', backgroundColor: '#f1f5f9', borderRadius: 24 },
    bannerPlaceholder: { justifyContent: 'center', alignItems: 'center' },
    profileHero: { alignItems: 'center', marginTop: -50, backgroundColor: 'transparent' },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOpacity: 0.1, overflow: 'hidden', borderWidth: 4, borderColor: 'white' },
    avatarImage: { width: '100%', height: '100%' },
    userName: { fontSize: 22, fontWeight: '900', marginTop: 12 },
    userRole: { fontSize: 14, color: '#64748b', marginTop: 4 },
    statsRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
    statItem: { alignItems: 'center', paddingHorizontal: 24 },
    statValue: { fontSize: 18, fontWeight: '800' },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
    statDivider: { width: 1, height: 24, backgroundColor: '#e2e8f0' },
    content: { padding: Spacing.lg },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
    addBtn: { backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4 },
    addBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
    productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    productCard: { width: '48%', backgroundColor: 'white', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
    productImage: { width: '100%', aspectRatio: 1 },
    productInfo: { padding: 12 },
    productTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    productPrice: { fontSize: 12, fontWeight: '800', color: '#10b981', marginTop: 4 },
    productActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRightWidth: 0.5, borderRightColor: '#f1f5f9' },
    emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', borderStyle: 'dashed' },
    emptyText: { marginTop: 12, fontSize: 14, color: '#94a3b8', fontWeight: '600' },
    aboutText: { fontSize: 15, color: '#475569', lineHeight: 24 },
    infoCard: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoText: { fontSize: 14, color: '#1e293b', flex: 1 },
    editProfileFullBtn: { backgroundColor: 'black', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 10, marginTop: 8, marginBottom: 40 },
    editBtnFullText: { color: 'white', fontSize: 16, fontWeight: '800' },
    // Modal Styles
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
    modalActionRow: { marginTop: 8 },
    modalEditBtn: { backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 10 },
    modalBtnText: { color: 'white', fontWeight: '800', fontSize: 16 }
});
