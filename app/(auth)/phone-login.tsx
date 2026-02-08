import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { loginUser } from '@/services/auth/authService';
import { getUserProfile } from '@/services/db/userProfile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PhoneLoginScreen() {
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { user } = await loginUser(phone, password);
            const profile = await getUserProfile(user.uid);

            if (profile) {
                router.replace(`/${profile.role}`);
            } else {
                router.replace('/(auth)/login');
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
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
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Log in using your phone number</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="10-digit mobile number"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            maxLength={10}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter your password"
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
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitBtnText}>Log In</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
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
});
