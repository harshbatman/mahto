import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { saveUserProfile } from '@/services/db/userProfile';
import { uploadImage } from '@/services/storage/imageService';
import { sanitizeError } from '@/utils/errorHandler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SetupContractorProfileScreen() {
    const router = useRouter();
    const { profile, user } = useAuth();

    const [companyBanner, setCompanyBanner] = useState<string | null>(profile?.companyBanner || null);
    const [companyLogo, setCompanyLogo] = useState<string | null>(profile?.companyLogo || null);
    const [companyName, setCompanyName] = useState(profile?.companyName || '');
    const [ownerName, setOwnerName] = useState(profile?.ownerName || profile?.name || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [services, setServices] = useState(profile?.contractorServices?.join(', ') || '');
    const [yearsInBusiness, setYearsInBusiness] = useState(profile?.yearsInBusiness?.toString() || '');
    const [about, setAbout] = useState(profile?.about || '');
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(
        profile?.latitude && profile?.longitude ? { latitude: profile.latitude, longitude: profile.longitude } : null
    );

    useEffect(() => {
        if (profile) {
            if (profile.companyBanner) setCompanyBanner(profile.companyBanner);
            if (profile.companyLogo) setCompanyLogo(profile.companyLogo);
            if (profile.companyName) setCompanyName(profile.companyName);
            if (profile.ownerName) setOwnerName(profile.ownerName);
            // Default to profile name if owner name not set
            else if (profile.name) setOwnerName(profile.name);

            if (profile.address) setAddress(profile.address);
            if (profile.contractorServices) setServices(profile.contractorServices.join(', '));
            if (profile.yearsInBusiness) setYearsInBusiness(profile.yearsInBusiness.toString());
            if (profile.about) setAbout(profile.about);
            if (profile.latitude && profile.longitude) setCoords({ latitude: profile.latitude, longitude: profile.longitude });
        }
    }, [profile]);

    const pickImage = async (type: 'banner' | 'logo') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            if (type === 'banner') setCompanyBanner(result.assets[0].uri);
            else setCompanyLogo(result.assets[0].uri);
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
                setAddress(addr.replace(/^, /, '')); // Remove leading comma if any
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not fetch your location');
        } finally {
            setLocationLoading(false);
        }
    };

    const handleSave = async () => {
        if (!companyName || !ownerName || !address) {
            Alert.alert('Missing Info', 'Please fill in Company Name, Owner Name, and Address.');
            return;
        }

        setLoading(true);
        try {
            if (!user || !profile) return;

            let bannerUrl = companyBanner || undefined;
            if (companyBanner && companyBanner.startsWith('file://')) {
                bannerUrl = await uploadImage(companyBanner, `contractors/banners/${user.uid}_${Date.now()}.jpg`);
            }

            let logoUrl = companyLogo || undefined;
            if (companyLogo && companyLogo.startsWith('file://')) {
                logoUrl = await uploadImage(companyLogo, `contractors/logos/${user.uid}_${Date.now()}.jpg`);
            }

            // Process services string into array
            const servicesArray = services.split(',').map(s => s.trim()).filter(s => s.length > 0);

            await saveUserProfile({
                ...profile,
                companyName,
                ownerName,
                address,
                companyBanner: bannerUrl,
                companyLogo: logoUrl,
                photoURL: logoUrl,
                contractorServices: servicesArray,
                yearsInBusiness: parseInt(yearsInBusiness) || 0,
                about,
                latitude: coords?.latitude,
                longitude: coords?.longitude,
                isProfileSetup: true, // Mark profile as setup
            });

            Alert.alert('Success', 'Profile setup complete!');
            router.replace('/contractor'); // Navigate to contractor dashboard
        } catch (error) {
            console.error(error);
            Alert.alert('Error', sanitizeError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Setup Company Profile</Text>
                    <Text style={styles.headerSub}>Let's get your business profile ready.</Text>
                </View>

                {/* Banner Upload */}
                <TouchableOpacity style={styles.bannerUpload} onPress={() => pickImage('banner')}>
                    {companyBanner ? (
                        <Image source={{ uri: companyBanner }} style={styles.bannerImage} />
                    ) : (
                        <View style={styles.bannerPlaceholder}>
                            <MaterialCommunityIcons name="image-plus" size={32} color="#9ca3af" />
                            <Text style={styles.uploadText}>Upload Company Banner</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Logo Upload */}
                <View style={styles.logoUploadContainer}>
                    <TouchableOpacity style={styles.logoUpload} onPress={() => pickImage('logo')}>
                        {companyLogo ? (
                            <Image source={{ uri: companyLogo }} style={styles.logoImage} />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <MaterialCommunityIcons name="briefcase-outline" size={32} color="#9ca3af" />
                            </View>
                        )}
                        <View style={styles.editIconBadge}>
                            <MaterialCommunityIcons name="camera" size={14} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.logoLabel}>Company Logo</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Company Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Company Name"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Owner Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Owner Name"
                            value={ownerName}
                            onChangeText={setOwnerName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#f3f4f6', color: '#6b7280' }]}
                            value={profile?.phoneNumber || ''}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Company Address</Text>
                            <TouchableOpacity onPress={getCurrentLocation} style={styles.geoBtn}>
                                {locationLoading ? (
                                    <ActivityIndicator size="small" color="#6366f1" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="map-marker-radius" size={16} color="#6366f1" />
                                        <Text style={styles.geoBtnText}>Get Location</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Full Company Address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Services Offered</Text>
                        <Text style={styles.helperText}>e.g. Renovation, Interior Design, Construction (comma separated)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="List your services here..."
                            value={services}
                            onChangeText={setServices}
                            multiline
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
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell us about your company..."
                            value={about}
                            onChangeText={setAbout}
                            multiline
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
                            <Text style={styles.saveBtnText}>Save & Continue</Text>
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
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        padding: Spacing.lg,
        paddingTop: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
        textAlign: 'center',
    },
    headerSub: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
        textAlign: 'center',
    },
    bannerUpload: {
        width: '92%',
        height: 180,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        overflow: 'hidden',
        alignSelf: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed'
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
    logoLabel: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
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
    helperText: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: '#111827',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    geoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    geoBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6366f1',
    },
    saveBtn: {
        backgroundColor: 'black',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
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
