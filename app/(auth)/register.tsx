import { COUNTRIES, Country } from '@/constants/countries';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { registerUser } from '@/services/auth/authService';
import { sanitizeError } from '@/utils/errorHandler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const { role } = useLocalSearchParams<{ role: string }>();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES.find(c => c.code === 'IN') || COUNTRIES[0]);
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dial_code.includes(searchQuery)
    );

    const handleRegister = async () => {
        if (!name || !phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (phone.length !== 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return;
        }

        const fullPhone = `${selectedCountry.dial_code}${phone}`;

        setLoading(true);
        try {
            await registerUser(fullPhone, password, role as any, name);
            console.log("Registration success, full phone:", fullPhone);
            if (role === 'worker') {
                router.replace('/select-skills');
            } else if (role === 'shop') {
                router.replace('/select-shop-category');
            } else if (role === 'contractor') {
                router.replace('/setup-contractor-profile');
            } else if (role === 'homeowner') {
                router.replace('/setup-homeowner-profile');
            } else {
                router.replace(`/${role}` as any);
            }
        } catch (error: any) {
            Alert.alert('Registration Failed', sanitizeError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Join as {role?.charAt(0).toUpperCase() + role?.slice(1)}</Text>
                    <Text style={styles.subtitle}>Create your profile using phone</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Harsh Mahto"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.phoneInputRow}>
                            <TouchableOpacity
                                style={styles.countryCode}
                                onPress={() => {
                                    setSearchQuery('');
                                    setShowCountryModal(true);
                                }}
                            >
                                <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                                <Text style={styles.codeText}>{selectedCountry.dial_code}</Text>
                                <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.phoneInput}
                                placeholder="Mobile Number"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                                maxLength={10}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Minimum 6 characters"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <MaterialCommunityIcons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color={Colors.light.muted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitBtnText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>By creating an account, you agree to our</Text>
                        <View style={styles.footerLinks}>
                            <TouchableOpacity onPress={() => router.push('/terms-conditions' as any)}>
                                <Text style={styles.linkText}>Terms & Conditions</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerText}> and </Text>
                            <TouchableOpacity onPress={() => router.push('/privacy-policy' as any)}>
                                <Text style={styles.linkText}>Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.loginLink}>
                        <Text style={styles.loginText}>Already have an account?</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.mahtoIdButton}
                        onPress={() => router.push('/(auth)/phone-login')}
                    >
                        <Text style={styles.mahtoIdButtonText}>Continue with MAHTO ID</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={showCountryModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Country</Text>
                            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.searchBar}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search country or code..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.code}
                            style={{ maxHeight: 500 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.countryRow}
                                    onPress={() => {
                                        setSelectedCountry(item);
                                        setShowCountryModal(false);
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                                        <Text style={styles.flagText}>{item.flag}</Text>
                                        <Text style={styles.countryName}>{item.name}</Text>
                                    </View>
                                    <Text style={styles.countryDialCode}>{item.dial_code}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        padding: Spacing.lg,
    },
    backBtn: {
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.muted,
        marginTop: 4,
    },
    form: {
        gap: Spacing.lg,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.light.border,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        fontSize: 16,
        backgroundColor: Colors.light.surface,
    },
    phoneInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.light.surface,
        overflow: 'hidden',
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#f8f9fa',
        borderRightWidth: 1,
        borderRightColor: Colors.light.border,
        height: '100%',
        gap: 6,
    },
    flagText: {
        fontSize: 18,
    },
    codeText: {
        fontSize: 16,
        fontWeight: '700',
        color: 'black',
    },
    phoneInput: {
        flex: 1,
        padding: Spacing.md,
        fontSize: 16,
        color: 'black',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    countryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    countryDialCode: {
        fontSize: 16,
        color: '#666',
        fontWeight: '700',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 8,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.light.surface,
    },
    passwordInput: {
        flex: 1,
        padding: Spacing.md,
        fontSize: 16,
    },
    eyeIcon: {
        padding: Spacing.md,
    },
    submitBtn: {
        backgroundColor: 'black',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 13,
        color: Colors.light.muted,
        textAlign: 'center',
    },
    footerLinks: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    linkText: {
        fontSize: 13,
        color: 'black',
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    loginLink: {
        marginTop: 5, // Reduced further
        marginBottom: 5,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 14,
        color: Colors.light.muted,
    },
    mahtoIdButton: {
        backgroundColor: '#000',
        borderRadius: 12, // Consistent with select-role
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#000',
    },
    mahtoIdButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
