import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { postContract } from '@/services/db/contractService';
import { uploadImage } from '@/services/storage/imageService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
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
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const CATEGORIES = ['Full Construction', 'Renovation', 'Interior'] as const;

export default function PostContractScreen() {
    const { profile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const [form, setForm] = useState({
        title: '',
        category: 'Full Construction' as typeof CATEGORIES[number],
        budget: '',
        description: '',
        location: profile?.address || '',
        duration: '',
    });

    const pickImages = async () => {
        if (images.length >= 7) {
            Alert.alert('Limit Reached', 'You can upload up to 7 images only.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 7 - images.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages].slice(0, 7));
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handlePost = async () => {
        if (!form.title || !form.budget || !form.description) {
            Alert.alert('Missing Fields', 'Please fill in the title, budget, and description.');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload images if any
            const uploadedUrls: string[] = [];
            for (let i = 0; i < images.length; i++) {
                const path = `contracts/${profile?.uid}/${Date.now()}_${i}.jpg`;
                const url = await uploadImage(images[i], path);
                uploadedUrls.push(url);
            }

            // 2. Post contract with image URLs
            await postContract({
                homeownerId: profile?.uid || '',
                homeownerName: profile?.name || 'Anonymous',
                title: form.title,
                category: form.category,
                budget: form.budget,
                description: form.description,
                location: form.location,
                duration: form.duration,
                images: uploadedUrls
            });

            Alert.alert('Success', 'Your contract has been posted and is now visible to contractors!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
                <Text style={styles.headerTitle}>Post New Contract</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 3BHK Villa Construction"
                                value={form.title}
                                onChangeText={(t) => setForm({ ...form, title: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.categoryRow}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryBtn,
                                            form.category === cat && styles.categoryBtnActive
                                        ]}
                                        onPress={() => setForm({ ...form, category: cat })}
                                    >
                                        <Text style={[
                                            styles.categoryBtnText,
                                            form.category === cat && styles.categoryBtnTextActive
                                        ]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Estimated Budget (₹)</Text>
                            <View style={styles.currencyWrapper}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <TextInput
                                    style={[styles.input, { paddingLeft: 35 }]}
                                    placeholder="50,0,000"
                                    keyboardType="numeric"
                                    value={form.budget}
                                    onChangeText={(t) => setForm({ ...form, budget: t })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Expected Duration</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 6 Months"
                                value={form.duration}
                                onChangeText={(t) => setForm({ ...form, duration: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Location</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Area, City"
                                value={form.location}
                                onChangeText={(t) => setForm({ ...form, location: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Images (Max 7)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
                                <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                                    <MaterialCommunityIcons name="camera-plus" size={32} color="#666" />
                                    <Text style={styles.addImageText}>{images.length}/7</Text>
                                </TouchableOpacity>

                                {images.map((uri, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <Image source={{ uri }} style={styles.selectedImage} />
                                        <TouchableOpacity
                                            style={styles.removeImageBtn}
                                            onPress={() => removeImage(index)}
                                        >
                                            <MaterialCommunityIcons name="close-circle" size={20} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Project Details</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe the scope of work..."
                                multiline
                                numberOfLines={5}
                                value={form.description}
                                onChangeText={(t) => setForm({ ...form, description: t })}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.postBtn, loading && styles.disabledBtn]}
                            onPress={handlePost}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.postBtnText}>Publish Contract</Text>
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
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
    },
    categoryBtnActive: {
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
    },
    categoryBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    categoryBtnTextActive: {
        color: 'white',
    },
    currencyWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    currencySymbol: {
        position: 'absolute',
        left: 14,
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        zIndex: 1,
    },
    imagesScroll: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    addImageBtn: {
        width: 100,
        height: 100,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        marginRight: 12,
    },
    addImageText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '700',
        marginTop: 4,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 16,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    postBtn: {
        backgroundColor: '#6366f1',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
        elevation: 4,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    postBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
});

