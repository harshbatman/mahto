import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { postContract } from '@/services/db/contractService';
import { uploadImage } from '@/services/storage/imageService';
import { sanitizeError } from '@/utils/errorHandler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
    View
} from 'react-native';

const CATEGORIES = ['Full Construction', 'Renovation', 'Interior'] as const;
const WORK_TYPES = ['Material + Labour', 'Labour Only'] as const;
const QUALITY_LEVELS = ['Basic', 'Standard', 'Premium'] as const;
const DIMENSION_UNITS = ['ft', 'gaj'] as const;
const BUDGET_TYPES = ['Total', 'Per sq.ft', 'Per sq.gaj'] as const;

export default function PostContractScreen() {
    const { profile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const getCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please allow location access to use this feature.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const [address] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (address) {
                const formattedLocation = [
                    address.street,
                    address.subregion || address.district,
                    address.city,
                ].filter(Boolean).join(', ');
                setForm({ ...form, location: formattedLocation });
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not get your current location.');
        } finally {
            setLocationLoading(false);
        }
    };
    const [images, setImages] = useState<string[]>([]);

    const [form, setForm] = useState({
        title: '',
        category: 'Full Construction' as typeof CATEGORIES[number],
        budget: '',
        budgetType: 'Total' as typeof BUDGET_TYPES[number],
        description: '',
        location: profile?.address || '',
        duration: '',
        dimensionUnit: 'ft' as typeof DIMENSION_UNITS[number],
        // Property Details
        length: '',
        breadth: '',
        plotSize: '',
        builtUpArea: '',
        floors: '',
        bedrooms: '',
        kitchens: '',
        bathrooms: '',
        hasBasement: false,
        // Work Requirements
        workType: 'Material + Labour' as typeof WORK_TYPES[number],
        materialQuality: 'Standard' as typeof QUALITY_LEVELS[number],
        // Timeline
        startDate: '',
        completionDate: '',
    });

    useEffect(() => {
        if (form.length && form.breadth) {
            const size = parseFloat(form.length) * parseFloat(form.breadth);
            if (!isNaN(size)) {
                setForm(prev => ({ ...prev, plotSize: size.toString() }));
            }
        }
    }, [form.length, form.breadth]);

    const pickImages = async () => {
        if (images.length >= 7) {
            Alert.alert('Limit Reached', 'You can upload up to 7 images only.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
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

            // 2. Post contract with new details
            await postContract({
                homeownerId: profile?.uid || '',
                homeownerName: profile?.name || 'Anonymous',
                title: form.title,
                category: form.category,
                budget: form.budgetType === 'Total' ? form.budget : `${form.budget} / ${form.budgetType.replace('Per ', '')}`,
                description: form.description,
                location: form.location,
                duration: form.duration,
                images: uploadedUrls,
                dimensionUnit: form.dimensionUnit,
                // Property Details
                length: form.length,
                breadth: form.breadth,
                plotSize: form.plotSize,
                builtUpArea: form.builtUpArea,
                floors: form.floors,
                bedrooms: form.bedrooms,
                kitchens: form.kitchens,
                bathrooms: form.bathrooms,
                hasBasement: form.hasBasement,
                // Work Type
                workType: form.workType,
                materialQuality: form.workType === 'Material + Labour' ? form.materialQuality : undefined,
                // Timeline (stored as strings/dates depending on your preference, here keeping as strings for simplicity or converting if needed)
                startDate: Date.parse(form.startDate) || undefined,
                completionDate: Date.parse(form.completionDate) || undefined,
            });

            Alert.alert('Success', 'Your contract has been posted and is now visible to contractors!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', sanitizeError(error));
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
                        {/* Basic Info Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>
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
                        </View>

                        {/* Property Details Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <Text style={styles.sectionTitle}>Property Details</Text>
                                <View style={styles.unitToggleRow}>
                                    {DIMENSION_UNITS.map((u) => (
                                        <TouchableOpacity
                                            key={u}
                                            style={[
                                                styles.dimUnitBtn,
                                                form.dimensionUnit === u && styles.dimUnitBtnActive
                                            ]}
                                            onPress={() => setForm({ ...form, dimensionUnit: u })}
                                        >
                                            <Text style={[
                                                styles.dimUnitText,
                                                form.dimensionUnit === u && styles.dimUnitTextActive
                                            ]}>{u}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Length ({form.dimensionUnit})</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="50"
                                        keyboardType="numeric"
                                        value={form.length}
                                        onChangeText={(t) => setForm({ ...form, length: t })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Breadth ({form.dimensionUnit})</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="30"
                                        keyboardType="numeric"
                                        value={form.breadth}
                                        onChangeText={(t) => setForm({ ...form, breadth: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Plot Size (sq.{form.dimensionUnit})</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1500"
                                        keyboardType="numeric"
                                        value={form.plotSize}
                                        onChangeText={(t) => setForm({ ...form, plotSize: t })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Built-up Area (sq.{form.dimensionUnit})</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="2500"
                                        keyboardType="numeric"
                                        value={form.builtUpArea}
                                        onChangeText={(t) => setForm({ ...form, builtUpArea: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Floors</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="2"
                                        keyboardType="numeric"
                                        value={form.floors}
                                        onChangeText={(t) => setForm({ ...form, floors: t })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Bedrooms</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="3"
                                        keyboardType="numeric"
                                        value={form.bedrooms}
                                        onChangeText={(t) => setForm({ ...form, bedrooms: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Kitchen</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1"
                                        keyboardType="numeric"
                                        value={form.kitchens}
                                        onChangeText={(t) => setForm({ ...form, kitchens: t })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Bathrooms</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="3"
                                        keyboardType="numeric"
                                        value={form.bathrooms}
                                        onChangeText={(t) => setForm({ ...form, bathrooms: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.toggleRow}>
                                <View style={styles.toggleLabelGroup}>
                                    <MaterialCommunityIcons name="office-building-marker" size={20} color="#666" />
                                    <Text style={styles.toggleLabel}>Basement Needed?</Text>
                                </View>
                                <Switch
                                    value={form.hasBasement}
                                    onValueChange={(v) => setForm({ ...form, hasBasement: v })}
                                    trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
                                    thumbColor={form.hasBasement ? '#6366f1' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        {/* Work Requirement Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Work Requirement</Text>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Type of Contract</Text>
                                <View style={styles.workTypeRow}>
                                    {WORK_TYPES.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.workTypeBtn,
                                                form.workType === type && styles.workTypeBtnActive
                                            ]}
                                            onPress={() => setForm({ ...form, workType: type })}
                                        >
                                            <Text style={[
                                                styles.workTypeBtnText,
                                                form.workType === type && styles.workTypeBtnTextActive
                                            ]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {form.workType === 'Material + Labour' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Material Quality</Text>
                                    <View style={styles.qualityRow}>
                                        {QUALITY_LEVELS.map((level) => (
                                            <TouchableOpacity
                                                key={level}
                                                style={[
                                                    styles.qualityBtn,
                                                    form.materialQuality === level && styles.qualityBtnActive
                                                ]}
                                                onPress={() => setForm({ ...form, materialQuality: level })}
                                            >
                                                <Text style={[
                                                    styles.qualityBtnText,
                                                    form.materialQuality === level && styles.qualityBtnTextActive
                                                ]}>{level}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Budget & Timeline Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Budget & Timeline</Text>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Estimated Budget / Rate</Text>
                                <View style={styles.budgetTypeSelector}>
                                    {BUDGET_TYPES.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.budgetTypeBtn,
                                                form.budgetType === type && styles.budgetTypeBtnActive
                                            ]}
                                            onPress={() => setForm({ ...form, budgetType: type })}
                                        >
                                            <Text style={[
                                                styles.budgetTypeBtnText,
                                                form.budgetType === type && styles.budgetTypeBtnTextActive
                                            ]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.currencyWrapper}>
                                    <Text style={styles.currencySymbol}>₹</Text>
                                    <TextInput
                                        style={[styles.input, { paddingLeft: 35 }]}
                                        placeholder={form.budgetType === 'Total' ? "e.g. 50 Lakh" : "e.g. 1800"}
                                        value={form.budget}
                                        onChangeText={(t) => setForm({ ...form, budget: t })}
                                    />
                                    {form.budgetType !== 'Total' && <Text style={styles.perUnit}>/{form.budgetType.split(' ')[1]}</Text>}
                                </View>
                            </View>

                            <View style={[styles.row, { marginTop: 8 }]}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Start Date</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        value={form.startDate}
                                        onChangeText={(t) => setForm({ ...form, startDate: t })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Complete By</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        value={form.completionDate}
                                        onChangeText={(t) => setForm({ ...form, completionDate: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>Project Location</Text>
                                    <TouchableOpacity
                                        onPress={getCurrentLocation}
                                        disabled={locationLoading}
                                        style={styles.locationBtn}
                                    >
                                        {locationLoading ? (
                                            <ActivityIndicator size="small" color="#000" />
                                        ) : (
                                            <>
                                                <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color="#000" />
                                                <Text style={styles.locationBtnText}>Use current location</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Area, City"
                                    value={form.location}
                                    onChangeText={(t) => setForm({ ...form, location: t })}
                                />
                            </View>
                        </View>

                        {/* Media Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Project Media</Text>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Images (Max 7)</Text>
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
                        </View>

                        {/* Description Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Work Details</Text>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Describe the specific scope of work, technical requirements, or any other preferences..."
                                    multiline
                                    numberOfLines={5}
                                    value={form.description}
                                    onChangeText={(t) => setForm({ ...form, description: t })}
                                />
                            </View>
                        </View>

                        {form.title.length > 0 && (
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>Contract Summary</Text>
                                <View style={styles.summaryHeader}>
                                    <Text style={styles.summaryProjectName}>{form.title}</Text>
                                    <View style={styles.summaryBadge}>
                                        <Text style={styles.summaryBadgeText}>{form.category}</Text>
                                    </View>
                                </View>

                                <View style={styles.summaryDivider} />

                                <View style={styles.summarySection}>
                                    <Text style={styles.summaryLabel}>Property Details</Text>
                                    <Text style={styles.summaryValue}>
                                        {form.length && form.breadth ? `${form.length}x${form.breadth} (${form.plotSize} sq.${form.dimensionUnit})` : `${form.plotSize || '0'} sq.${form.dimensionUnit}`} Plot
                                    </Text>
                                    <Text style={styles.summaryValue}>
                                        {form.builtUpArea || '0'} sq.{form.dimensionUnit} Built-up • {form.floors || '0'} Floors
                                    </Text>
                                    <Text style={styles.summaryValue}>
                                        {form.bedrooms || '0'} BHK • {form.kitchens || '0'} Kitchen • {form.bathrooms || '0'} Bath • {form.hasBasement ? 'Basement Included' : 'No Basement'}
                                    </Text>
                                </View>

                                <View style={styles.summaryDivider} />

                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryColumn}>
                                        <Text style={styles.summaryLabel}>Work Type</Text>
                                        <Text style={styles.summaryValue}>{form.workType}</Text>
                                    </View>
                                    {form.workType === 'Material + Labour' && (
                                        <View style={styles.summaryColumn}>
                                            <Text style={styles.summaryLabel}>Quality</Text>
                                            <Text style={styles.summaryValue}>{form.materialQuality}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.summaryDivider} />

                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryColumn}>
                                        <Text style={styles.summaryLabel}>Timeline</Text>
                                        <Text style={styles.summaryValue}>Start: {form.startDate || 'Not set'}</Text>
                                        <Text style={styles.summaryValue}>End: {form.completionDate || 'Not set'}</Text>
                                    </View>
                                    <View style={styles.summaryColumn}>
                                        <Text style={styles.summaryLabel}>Budget</Text>
                                        <Text style={styles.summaryAmount}>₹{form.budget || '0'} {form.budgetType !== 'Total' ? `/${form.budgetType.split(' ')[1]}` : ''}</Text>
                                    </View>
                                </View>

                                <View style={styles.summaryDivider} />

                                <View style={styles.summaryRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.summaryLabel}>Location</Text>
                                        <Text style={styles.summaryValue} numberOfLines={1}>{form.location}</Text>
                                    </View>
                                    <View style={styles.summaryImagesBox}>
                                        <MaterialCommunityIcons name="image-multiple" size={16} color="white" />
                                        <Text style={styles.summaryImagesCount}>{images.length}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.postBtn, loading && styles.disabledBtn]}
                            onPress={handlePost}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.postBtnText}>Post contract</Text>
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    form: {
        gap: 24,
    },
    section: {
        gap: 12,
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 4,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    locationBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        padding: 14,
        fontSize: 15,
        backgroundColor: '#fff',
        color: '#1e293b',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    categoryBtnActive: {
        borderColor: '#000',
        backgroundColor: '#000',
    },
    categoryBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
    },
    categoryBtnTextActive: {
        color: 'white',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    toggleLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    workTypeRow: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        padding: 4,
        borderRadius: 12,
        gap: 4,
    },
    workTypeBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    workTypeBtnActive: {
        backgroundColor: 'white',
    },
    workTypeBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
    },
    workTypeBtnTextActive: {
        color: '#6366f1',
    },
    qualityRow: {
        flexDirection: 'row',
        gap: 8,
    },
    qualityBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    qualityBtnActive: {
        borderColor: '#6366f1',
        backgroundColor: '#f5f3ff',
    },
    qualityBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1e293b',
    },
    qualityBtnTextActive: {
        color: '#6366f1',
    },
    qualitySub: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 2,
    },
    currencyWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    currencySymbol: {
        position: 'absolute',
        left: 14,
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        zIndex: 1,
    },
    imagesScroll: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    addImageBtn: {
        width: 100,
        height: 100,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginRight: 12,
    },
    addImageText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '800',
        marginTop: 4,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    postBtn: {
        backgroundColor: '#000',
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    postBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    summaryCard: {
        backgroundColor: '#1e293b',
        padding: 24,
        borderRadius: 28,
        gap: 16,
    },
    summaryTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '900',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryProjectName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    summaryBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#6366f1',
    },
    summaryBadgeText: {
        color: '#818cf8',
        fontSize: 10,
        fontWeight: '800',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    summarySection: {
        gap: 4,
    },
    summaryLabel: {
        color: '#94a3b8',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryValue: {
        color: '#e2e8f0',
        fontSize: 14,
        fontWeight: '600',
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 20,
    },
    summaryColumn: {
        flex: 1,
        gap: 4,
    },
    summaryAmount: {
        color: '#4ade80',
        fontSize: 18,
        fontWeight: '800',
    },
    summaryImagesBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    summaryImagesCount: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    budgetRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    unitSelector: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        padding: 4,
        borderRadius: 12,
        gap: 4,
    },
    unitBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 44,
        alignItems: 'center',
    },
    unitBtnActive: {
        backgroundColor: 'white',
    },
    unitBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    unitBtnTextActive: {
        color: '#6366f1',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    unitToggleRow: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        padding: 3,
        borderRadius: 10,
        gap: 2,
    },
    dimUnitBtn: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 7,
        minWidth: 36,
        alignItems: 'center',
    },
    dimUnitBtnActive: {
        backgroundColor: 'white',
    },
    dimUnitText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
    },
    dimUnitTextActive: {
        color: '#6366f1',
    },
    budgetTypeSelector: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        padding: 4,
        borderRadius: 12,
        gap: 4,
        marginBottom: 8,
    },
    budgetTypeBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    budgetTypeBtnActive: {
        backgroundColor: 'white',
    },
    budgetTypeBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    budgetTypeBtnTextActive: {
        color: '#6366f1',
    },
    perUnit: {
        position: 'absolute',
        right: 14,
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
});
