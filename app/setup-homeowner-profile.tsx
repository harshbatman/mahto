import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { saveUserProfile } from '@/services/db/userProfile';
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
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function SetupHomeownerProfileScreen() {
    const { user, profile } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(profile?.name || '');
    const [phone, setPhone] = useState(profile?.phoneNumber || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [locLoading, setLocLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            if (!name && profile.name) setName(profile.name);
            if (!phone && profile.phoneNumber) setPhone(profile.phoneNumber);
            if (!address && profile.address) setAddress(profile.address);
        }
    }, [profile]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload your photo!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhoto(result.assets[0].uri);
        }
    };

    const detectLocation = async () => {
        setLocLoading(true);
        try {
            // Specific request with reason is handled by the OS using the message in app.json
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'MAHTO use your location to show nearby worekr, contractor and shops. Please enable it in settings.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode.length > 0) {
                const loc = reverseGeocode[0];
                const parts = [
                    loc.name,
                    loc.street,
                    loc.district,
                    loc.city,
                    loc.region,
                    loc.postalCode
                ].filter(part => part && part !== "").join(", ");

                setAddress(parts);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Could not detect location. Please type your address manually.');
        } finally {
            setLocLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        if (!name || !address) {
            Alert.alert('Missing Info', 'Please provide your name and address.');
            return;
        }

        setLoading(true);
        try {
            let photoURL = profile?.photoURL || "";
            if (photo) {
                photoURL = await uploadImage(photo, `profiles/${user.uid}.jpg`);
            }

            await saveUserProfile({
                ...profile,
                uid: user.uid,
                name: name,
                phoneNumber: phone,
                address: address,
                photoURL: photoURL,
                email: user.email || '',
                role: 'homeowner',
                createdAt: profile?.createdAt || Date.now(),
                isProfileSetup: true
            } as any);

            Alert.alert('Profile Setup', 'Your profile has been created successfully!', [
                { text: 'Great', onPress: () => router.replace('/homeowner') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', sanitizeError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Setup Your Profile</Text>
                        <Text style={styles.headerSubtitle}>Complete your profile to start exploring MAHTO</Text>
                    </View>

                    <View style={styles.photoSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.photoUpload}>
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.photo} />
                            ) : profile?.photoURL ? (
                                <Image source={{ uri: profile.photoURL }} style={styles.photo} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <MaterialCommunityIcons name="camera-plus" size={40} color={Colors.light.muted} />
                                    <Text style={styles.uploadText}>Upload Photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.readOnlyInput}>
                                <MaterialCommunityIcons name="phone" size={20} color="#9ca3af" />
                                <Text style={styles.readOnlyText}>{phone}</Text>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Your Address</Text>
                            <View style={styles.addressContainer}>
                                <TextInput
                                    style={[styles.input, styles.addressInput]}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Enter your property address"
                                    multiline
                                />
                                <TouchableOpacity
                                    onPress={detectLocation}
                                    style={styles.locationBtn}
                                    disabled={locLoading}
                                >
                                    {locLoading ? (
                                        <ActivityIndicator size="small" color="#6366f1" />
                                    ) : (
                                        <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#6366f1" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.helperText}>knowing your location helps us show you nearby worker, contractor & shops</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, loading && styles.disabledBtn]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.saveBtnText}>Complete Setup</Text>
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
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: 'black',
    },
    headerSubtitle: {
        fontSize: 15,
        color: Colors.light.muted,
        marginTop: 4,
        textAlign: 'center',
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    photoUpload: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#eee',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        alignItems: 'center',
    },
    uploadText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.muted,
        marginTop: 4,
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
        borderWidth: 1.5,
        borderColor: '#eee',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        backgroundColor: '#fcfcfc',
        color: 'black',
    },
    readOnlyInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#eee',
        gap: 12,
    },
    readOnlyText: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '600',
    },
    addressContainer: {
        position: 'relative',
    },
    addressInput: {
        paddingRight: 50,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    locationBtn: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
    },
    helperText: {
        fontSize: 12,
        color: Colors.light.muted,
        marginTop: 4,
        fontStyle: 'italic',
    },
    saveBtn: {
        backgroundColor: 'black',
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    disabledBtn: {
        opacity: 0.6,
    }
});
