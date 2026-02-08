import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { saveUserProfile } from '@/services/db/userProfile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditShopScreen() {
    const router = useRouter();
    const { profile, user } = useAuth();

    const [shopBanner, setShopBanner] = useState<string | null>(profile?.shopBanner || null);
    const [shopLogo, setShopLogo] = useState<string | null>(profile?.shopLogo || null);
    const [shopName, setShopName] = useState(profile?.shopName || '');
    const [shopOwnerName, setShopOwnerName] = useState(profile?.shopOwnerName || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [openingTime, setOpeningTime] = useState(profile?.openingTime || '09:00 AM');
    const [closingTime, setClosingTime] = useState(profile?.closingTime || '08:00 PM');
    const [isHomeDelivery, setIsHomeDelivery] = useState(profile?.isHomeDeliveryAvailable || false);
    const [yearsInBusiness, setYearsInBusiness] = useState(profile?.yearsInBusiness?.toString() || '');
    const [gstNumber, setGstNumber] = useState(profile?.gstNumber || '');
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(
        profile?.latitude && profile?.longitude ? { latitude: profile.latitude, longitude: profile.longitude } : null
    );

    // Sync state with profile if it updates (important if profile loads after component mounts)
    useEffect(() => {
        if (profile) {
            if (profile.shopBanner) setShopBanner(profile.shopBanner);
            if (profile.shopLogo) setShopLogo(profile.shopLogo);
            if (profile.shopName) setShopName(profile.shopName);
            if (profile.shopOwnerName) setShopOwnerName(profile.shopOwnerName);
            if (profile.address) setAddress(profile.address);
            if (profile.openingTime) setOpeningTime(profile.openingTime);
            if (profile.closingTime) setClosingTime(profile.closingTime);
            if (profile.isHomeDeliveryAvailable !== undefined) setIsHomeDelivery(profile.isHomeDeliveryAvailable);
            if (profile.yearsInBusiness) setYearsInBusiness(profile.yearsInBusiness.toString());
            if (profile.gstNumber) setGstNumber(profile.gstNumber);
            if (profile.latitude && profile.longitude) setCoords({ latitude: profile.latitude, longitude: profile.longitude });
        }
    }, [profile]);

    const pickImage = async (type: 'banner' | 'logo') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: type === 'banner' ? [16, 9] : [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            if (type === 'banner') setShopBanner(result.assets[0].uri);
            else setShopLogo(result.assets[0].uri);
        }
    };

    const getCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCoords({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            let reverseData = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseData.length > 0) {
                const item = reverseData[0];
                const addr = `${item.name || ''}, ${item.street || ''}, ${item.city || ''}, ${item.region || ''}, ${item.postalCode || ''}`;
                setAddress(addr.replace(/^, /, ''));
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not fetch your location');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSave = async () => {
        if (!shopName || !shopOwnerName || !address) {
            Alert.alert('Missing info', 'Please fill in shop name, owner name and address');
            return;
        }

        setLoading(true);
        try {
            if (!user) return;

            await saveUserProfile({
                ...profile!,
                shopName,
                shopOwnerName,
                address,
                shopBanner: shopBanner || undefined,
                shopLogo: shopLogo || undefined,
                openingTime,
                closingTime,
                isHomeDeliveryAvailable: isHomeDelivery,
                yearsInBusiness: parseInt(yearsInBusiness) || 0,
                gstNumber: gstNumber || undefined,
                latitude: coords?.latitude,
                longitude: coords?.longitude,
            });

            Alert.alert('Success', 'Shop details updated successfully');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update shop profile');
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
                <Text style={styles.title}>Edit Shop Details</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Banner Upload */}
                <TouchableOpacity style={styles.bannerUpload} onPress={() => pickImage('banner')}>
                    {shopBanner ? (
                        <Image source={{ uri: shopBanner }} style={styles.bannerImage} />
                    ) : (
                        <View style={styles.bannerPlaceholder}>
                            <MaterialCommunityIcons name="image-plus" size={32} color="#9ca3af" />
                            <Text style={styles.uploadText}>Change Banner</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Logo Upload */}
                <View style={styles.logoUploadContainer}>
                    <TouchableOpacity style={styles.logoUpload} onPress={() => pickImage('logo')}>
                        {shopLogo ? (
                            <Image source={{ uri: shopLogo }} style={styles.logoImage} />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <MaterialCommunityIcons name="storefront-outline" size={32} color="#9ca3af" />
                            </View>
                        )}
                        <View style={styles.editIconBadge}>
                            <MaterialCommunityIcons name="camera" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Shop Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Shop Name"
                            value={shopName}
                            onChangeText={setShopName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Shop Owner Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Owner Name"
                            value={shopOwnerName}
                            onChangeText={setShopOwnerName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Shop Address</Text>
                            <TouchableOpacity onPress={getCurrentLocation} style={styles.geoBtn}>
                                {locationLoading ? (
                                    <ActivityIndicator size="small" color="#6366f1" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="map-marker-radius" size={16} color="#6366f1" />
                                        <Text style={styles.geoBtnText}>Refresh Location</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Full Shop Address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Opening Time</Text>
                            <TextInput
                                style={styles.input}
                                value={openingTime}
                                onChangeText={setOpeningTime}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Closing Time</Text>
                            <TextInput
                                style={styles.input}
                                value={closingTime}
                                onChangeText={setClosingTime}
                            />
                        </View>
                    </View>

                    <View style={styles.toggleGroup}>
                        <View>
                            <Text style={styles.toggleLabel}>Home Delivery Available</Text>
                        </View>
                        <Switch
                            value={isHomeDelivery}
                            onValueChange={setIsHomeDelivery}
                            trackColor={{ false: '#767577', true: '#10b981' }}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Years in Business</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 5"
                            value={yearsInBusiness}
                            onChangeText={setYearsInBusiness}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Shop Categories</Text>
                            <TouchableOpacity onPress={() => router.push({
                                pathname: '/select-shop-category',
                                params: {
                                    initialCategories: JSON.stringify(profile?.shopCategories || []),
                                    mode: 'edit'
                                }
                            })}>
                                <Text style={styles.geoBtnText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#f5f5f5' }]}
                            value={profile?.shopCategories?.join(', ')}
                            editable={false}
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>GST Number (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter GST Number"
                            value={gstNumber}
                            onChangeText={setGstNumber}
                            autoCapitalize="characters"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, loading && styles.disabledBtn]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveBtnText}>Update Profile</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        padding: Spacing.lg,
        paddingTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
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
    bannerUpload: {
        width: '92%',
        height: 180,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        overflow: 'hidden',
        alignSelf: 'center',
        marginTop: 10,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    bannerPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    uploadText: {
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '600',
    },
    logoUploadContainer: {
        alignItems: 'center',
        marginTop: -50,
        zIndex: 10,
    },
    logoUpload: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        borderWidth: 4,
        borderColor: 'white',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
    },
    logoPlaceholder: {
        alignItems: 'center',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'black',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    form: {
        padding: Spacing.lg,
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    geoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    geoBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6366f1',
    },
    row: {
        flexDirection: 'row',
    },
    toggleGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    saveBtn: {
        backgroundColor: 'black',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '900',
    },
});
