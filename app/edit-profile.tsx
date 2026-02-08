import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { saveUserProfile } from '@/services/db/userProfile';
import { uploadImage } from '@/services/storage/imageService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function EditProfileScreen() {
    const { user, profile, logout } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(profile?.name || '');
    const [phone, setPhone] = useState(profile?.phoneNumber || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [photo, setPhoto] = useState(profile?.photoURL || null);
    const [newPhoto, setNewPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [locLoading, setLocLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setNewPhoto(result.assets[0].uri);
        }
    };

    const confirmPhoto = () => {
        if (newPhoto) {
            setPhoto(newPhoto);
            setNewPhoto(null);
        }
    };

    const detectLocation = async () => {
        setLocLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow location access to detect your address.');
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
            Alert.alert('Error', 'Could not detect location. Please type manually.');
        } finally {
            setLocLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Use new photo if picked, otherwise keep existing
            let currentPhotoPath = newPhoto || photo;
            let photoURL = currentPhotoPath;

            if (currentPhotoPath && currentPhotoPath.startsWith('file://')) {
                photoURL = await uploadImage(currentPhotoPath, `profiles/${user.uid}.jpg`);
            }

            await saveUserProfile({
                ...profile,
                uid: user.uid,
                name: name,
                phoneNumber: phone,
                address: address,
                photoURL: photoURL || "",
                email: user.email || '',
                role: profile?.role || 'homeowner',
                createdAt: profile?.createdAt || Date.now()
            } as any);

            Alert.alert('Success', 'Profile updated successfully!');
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
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="black" /> : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.photoSection}>
                    <View style={styles.photoContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            {newPhoto ? (
                                <Image source={{ uri: newPhoto }} style={[styles.avatar, { opacity: 0.6 }]} />
                            ) : photo ? (
                                <Image source={{ uri: photo }} style={styles.avatar} />
                            ) : (
                                <MaterialCommunityIcons name="camera-plus" size={32} color={Colors.light.muted} />
                            )}
                        </TouchableOpacity>

                        {newPhoto && (
                            <TouchableOpacity onPress={confirmPhoto} style={styles.confirmCircle}>
                                <MaterialCommunityIcons name="check" size={28} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.photoTip}>
                        {newPhoto ? "Click 'OK' to confirm photo" : "Tap to change profile picture"}
                    </Text>

                    {newPhoto && (
                        <TouchableOpacity style={styles.okBtn} onPress={confirmPhoto}>
                            <Text style={styles.okBtnText}>OK, Use This</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your Name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="10-digit mobile number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Home Address</Text>
                        <View style={styles.addressWrapper}>
                            <TextInput
                                style={[styles.input, styles.addressInput]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Detecting or type your address..."
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity onPress={detectLocation} style={styles.locationBtn} disabled={locLoading}>
                                {locLoading ? (
                                    <ActivityIndicator size="small" color="#6366f1" />
                                ) : (
                                    <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#6366f1" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.helperText}>Used for finding nearby workers/contractors</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email (Auto-mapped)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#f5f5f5', color: '#888' }]}
                            value={user?.email || ''}
                            editable={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={() => {
                            Alert.alert(
                                "Logout",
                                "Do you want to logout?",
                                [
                                    { text: "No", style: "cancel" },
                                    {
                                        text: "Yes",
                                        style: "destructive",
                                        onPress: async () => {
                                            try {
                                                await logout();
                                            } catch (error) {
                                                Alert.alert("Error", "Logout failed.");
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
                        <Text style={styles.logoutText}>Logout from Account</Text>
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
    saveBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6366f1',
    },
    content: {
        padding: Spacing.lg,
    },
    photoSection: {
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    photoContainer: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    confirmCircle: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#4ade80',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
        elevation: 4,
    },
    okBtn: {
        marginTop: 15,
        backgroundColor: '#4ade80',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    okBtnText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 14,
    },
    photoTip: {
        marginTop: 12,
        fontSize: 13,
        color: Colors.light.muted,
        fontWeight: '600',
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
        backgroundColor: '#fff',
    },
    addressWrapper: {
        position: 'relative',
    },
    addressInput: {
        paddingRight: 50,
        height: 80,
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
        marginTop: 2,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 40,
        marginBottom: 60,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#fff1f2',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
    }
});
