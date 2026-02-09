import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

import { saveUserProfile } from '@/services/db/userProfile';
import { uploadImage } from '@/services/storage/imageService';
import { sanitizeError } from '@/utils/errorHandler';
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
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function EditProfileScreen() {
    const { user, profile } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(profile?.name || '');
    const [phone, setPhone] = useState(profile?.phoneNumber || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [photo, setPhoto] = useState(profile?.photoURL || null);
    const [loading, setLoading] = useState(false);
    const [locLoading, setLocLoading] = useState(false);

    // Worker specific states
    const [skills, setSkills] = useState<string[]>(profile?.skills || []);
    const [experience, setExperience] = useState(profile?.experienceYears?.toString() || '');
    const [about, setAbout] = useState(profile?.about || '');
    const [dailyRate, setDailyRate] = useState(profile?.dailyRate?.toString() || '');
    const [isAvailable, setIsAvailable] = useState(profile?.isAvailable ?? true);
    const [newSkill, setNewSkill] = useState('');



    const pickImage = async () => {
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
            const localUri = result.assets[0].uri;
            setPhoto(localUri); // Show immediately for feedback

            // Auto-save logic
            if (user) {
                setLoading(true);
                try {
                    // 1. Upload to Firebase Storage
                    const storagePath = `profiles/${user.uid}_${Date.now()}.jpg`;
                    const uploadedUrl = await uploadImage(localUri, storagePath);

                    // Update photo state with remote URL
                    setPhoto(uploadedUrl);

                    // Update Firestore immediately
                    await saveUserProfile({
                        ...profile,
                        uid: user.uid,
                        name: name,
                        phoneNumber: phone,
                        address: address,
                        email: user.email || '',
                        role: profile?.role || 'homeowner',
                        createdAt: profile?.createdAt || Date.now(),
                        photoURL: uploadedUrl,
                        skills: skills,
                        experienceYears: parseInt(experience) || 0,
                        dailyRate: parseInt(dailyRate) || 0,
                        isAvailable: isAvailable,
                        about: about,
                        isProfileSetup: true
                    } as any);

                    Alert.alert('Photo Updated', 'Your profile photo has been updated successfully.');
                } catch (error: any) {
                    console.error("Auto-save photo error:", error);
                    Alert.alert('Upload Failed', 'Could not save profile photo. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
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
            // Upload photo if it's a new local selection
            let photoURL = photo || "";
            if (photo && photo.startsWith('file://')) {
                photoURL = await uploadImage(photo, `profiles/${user.uid}.jpg`);
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
                createdAt: profile?.createdAt || Date.now(),
                skills: profile?.role === 'worker' ? skills : [],
                experienceYears: profile?.role === 'worker' ? parseInt(experience) || 0 : 0,
                dailyRate: profile?.role === 'worker' ? parseInt(dailyRate) || 0 : undefined,
                isAvailable: profile?.role === 'worker' ? isAvailable : undefined,
                about: about,
                isProfileSetup: true
            } as any);

            Alert.alert('Success', 'Profile updated successfully!');
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
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.photoSection}>
                    <View style={styles.photoContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.avatar} />
                            ) : (
                                <MaterialCommunityIcons name="camera-plus" size={32} color={Colors.light.muted} />
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.photoTip}>
                        Tap to change profile picture
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account type</Text>
                        <View style={styles.roleDisplay}>
                            <MaterialCommunityIcons
                                name={
                                    profile?.role === 'worker' ? 'account-hard-hat' :
                                        profile?.role === 'contractor' ? 'briefcase-account' :
                                            profile?.role === 'shop' ? 'storefront' : 'home-account'
                                }
                                size={20}
                                color="black"
                            />
                            <Text style={styles.roleText}>
                                {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
                            </Text>
                        </View>
                    </View>

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

                    {profile?.role === 'worker' && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Professional Details</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Years of Experience</Text>
                                <TextInput
                                    style={styles.input}
                                    value={experience}
                                    onChangeText={setExperience}
                                    placeholder="e.g. 5"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Charge per day (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={dailyRate}
                                    onChangeText={setDailyRate}
                                    placeholder="e.g. 500"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>Available for work</Text>
                                <Switch
                                    value={isAvailable}
                                    onValueChange={setIsAvailable}
                                    trackColor={{ false: '#767577', true: '#4ade80' }}
                                    thumbColor={isAvailable ? '#f4f3f4' : '#f4f3f4'}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Skills</Text>
                                <View style={styles.skillInputRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={newSkill}
                                        onChangeText={setNewSkill}
                                        placeholder="Add a skill (e.g. Masonry)"
                                    />
                                    <TouchableOpacity
                                        style={styles.addSkillBtn}
                                        onPress={() => {
                                            if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                                                setSkills([...skills, newSkill.trim()]);
                                                setNewSkill('');
                                            }
                                        }}
                                    >
                                        <MaterialCommunityIcons name="plus" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.skillsList}>
                                    {skills.map((skill, index) => (
                                        <View key={index} style={styles.skillBadge}>
                                            <Text style={styles.skillBadgeText}>{skill}</Text>
                                            <TouchableOpacity onPress={() => setSkills(skills.filter((_, i) => i !== index))}>
                                                <MaterialCommunityIcons name="close-circle" size={16} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>About Me</Text>
                                <TextInput
                                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                    value={about}
                                    onChangeText={setAbout}
                                    placeholder="Tell potential employers about your work..."
                                    multiline
                                />
                            </View>
                        </>
                    )}



                    <TouchableOpacity
                        style={styles.bottomSaveBtn}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text style={styles.bottomSaveBtnText}>Save & Update Profile</Text>
                            </>
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
    roleDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#f5f5f5',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    roleText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'black',
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
    settingsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 24,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#eee',
    },
    settingsBtnLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingsBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'black',
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
    },
    deleteInitBtn: {
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 80,
    },
    deleteInitText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalForm: {
        gap: 16,
    },
    modalInputGroup: {
        gap: 8,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    deleteBtn: {
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    deleteBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'black',
        marginBottom: 10,
    },
    skillInputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    addSkillBtn: {
        backgroundColor: 'black',
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skillsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    skillBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    skillBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    bottomSaveBtn: {
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 10,
        marginTop: 30,
        marginBottom: 40,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    bottomSaveBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        backgroundColor: '#f9fafb',
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
});
