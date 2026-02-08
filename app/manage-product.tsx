import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { addProduct, updateProduct } from '@/services/db/productService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ManageProductScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();

    // If editing, these will be populated
    const productId = params.id as string;
    const initialTitle = params.title as string || '';
    const initialDesc = params.description as string || '';
    const initialPrice = params.price as string || '';
    const initialContact = params.contactForPrice === 'true';
    const initialImages = params.images ? JSON.parse(params.images as string) : [];

    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDesc);
    const [price, setPrice] = useState(initialPrice);
    const [contactForPrice, setContactForPrice] = useState(initialContact);
    const [images, setImages] = useState<string[]>(initialImages);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        if (images.length >= 5) {
            Alert.alert('Limit reached', 'You can upload maximum 5 images per product.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImages([...images, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!title || images.length === 0) {
            Alert.alert('Missing info', 'Please add at least one image and a product title.');
            return;
        }

        if (!contactForPrice && !price) {
            Alert.alert('Price required', 'Please enter a price or enable "Contact for Price".');
            return;
        }

        setLoading(true);
        try {
            if (!user) return;

            const productData: any = {
                shopId: user.uid,
                title,
                description: description || '',
                images,
                contactForPrice: !!contactForPrice,
            };

            if (!contactForPrice) {
                const numPrice = parseFloat(price);
                if (isNaN(numPrice)) {
                    Alert.alert('Invalid price', 'Please enter a valid numeric price.');
                    setLoading(false);
                    return;
                }
                productData.price = numPrice;
            }

            if (productId) {
                await updateProduct(productId, productData);
                Alert.alert('Success', 'Product updated successfully');
            } else {
                await addProduct(productData);
                Alert.alert('Success', 'Product added successfully');
            }
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="close" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>{productId ? 'Edit Product' : 'Add New Product'}</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.section}>
                        <Text style={styles.label}>Product Images (Max 5)</Text>
                        <View style={styles.imageGrid}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.image} />
                                    <TouchableOpacity
                                        style={styles.removeBtn}
                                        onPress={() => removeImage(index)}
                                    >
                                        <MaterialCommunityIcons name="close-circle" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {images.length < 5 && (
                                <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
                                    <MaterialCommunityIcons name="camera-plus" size={32} color="#94a3b8" />
                                    <Text style={styles.addPhotoText}>Add Photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Product Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Premium AAC Blocks"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your product details..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.pricingSection}>
                            <View style={styles.toggleRow}>
                                <View>
                                    <Text style={styles.toggleLabel}>Contact for Price</Text>
                                    <Text style={styles.toggleSub}>Hide price and ask buyers to call</Text>
                                </View>
                                <Switch
                                    value={contactForPrice}
                                    onValueChange={setContactForPrice}
                                    trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                                />
                            </View>

                            {!contactForPrice && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Price (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter amount"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, loading && styles.disabledBtn]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.saveBtnText}>Save Product</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingTop: 20,
        gap: 16,
    },
    backBtn: {},
    title: {
        fontSize: 20,
        fontWeight: '900',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    section: {
        padding: Spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 12,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    addPhotoBtn: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    addPhotoText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 4,
    },
    form: {
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: 'black',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    pricingSection: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    toggleSub: {
        fontSize: 12,
        color: '#64748b',
    },
    saveBtn: {
        backgroundColor: 'black',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    }
});
