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

export default function SetupWorkerProfile() {
    const { user, profile } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(profile?.name || '');
    const [phone, setPhone] = useState(profile?.phoneNumber || '');
    const [address, setAddress] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [skills, setSkills] = useState<string[]>([]);
    const [experience, setExperience] = useState('');
    const [about, setAbout] = useState('');
    const [newSkill, setNewSkill] = useState('');

    const [loading, setLoading] = useState(false);
    const [locLoading, setLocLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.6,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
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
        if (!address || !experience || skills.length === 0) {
            Alert.alert('Missing Info', 'Please provide your address, experience, and at least one skill.');
            return;
        }

        setLoading(true);
        try {
            let photoURL = "";
            if (photo) {
                photoURL = await uploadImage(photo, `profiles/${user.uid}.jpg`);
            }

            await saveUserProfile({
                ...profile,
                uid: user.uid,
                name: name,
                phoneNumber: phone,
                address: address,
                photoURL: photoURL || profile?.photoURL || "",
                email: user.email || '',
                role: 'worker',
                createdAt: profile?.createdAt || Date.now(),
                skills: skills,
                experienceYears: parseInt(experience) || 0,
                about: about,
                isProfileSetup: true
            } as any);

            Alert.alert('All Set!', 'Your worker profile is ready.', [
                { text: 'Let\'s Go', onPress: () => router.replace('/worker') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Setup Your Profile</Text>
                        <Text style={styles.headerSubtitle}>Complete these details to start getting work</Text>
                    </View>

                    <View style={styles.photoSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.photoUpload}>
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.photo} />
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
                                placeholder="Confirmed name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#f5f5f5' }]}
                                value={phone}
                                editable={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Work Address (Current Location)</Text>
                            <View style={styles.addressContainer}>
                                <TextInput
                                    style={[styles.input, styles.addressInput]}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Click GPS icon to detect address"
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
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Years of Experience</Text>
                                <TextInput
                                    style={styles.input}
                                    value={experience}
                                    onChangeText={setExperience}
                                    placeholder="e.g. 8"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Add Your Skills</Text>
                            <View style={styles.skillInputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={newSkill}
                                    onChangeText={setNewSkill}
                                    placeholder="e.g. Plastering"
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
                                        <Text style={styles.skillText}>{skill}</Text>
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
                                style={[styles.input, styles.aboutInput]}
                                value={about}
                                onChangeText={setAbout}
                                placeholder="Tell us about yourself and your work experience..."
                                multiline
                                numberOfLines={4}
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
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
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
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    photoUpload: {
        width: 120,
        height: 120,
        borderRadius: 60,
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
        borderRadius: 14,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#fcfcfc',
        color: 'black',
    },
    addressContainer: {
        position: 'relative',
    },
    addressInput: {
        paddingRight: 45,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    locationBtn: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    skillInputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    addSkillBtn: {
        backgroundColor: 'black',
        width: 54,
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skillsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    skillBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4ff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: '#e0e4ff',
    },
    skillText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6366f1',
    },
    aboutInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    saveBtn: {
        backgroundColor: 'black',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
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
