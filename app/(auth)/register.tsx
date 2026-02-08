import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { registerUser } from '@/services/auth/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const { role } = useLocalSearchParams<{ role: string }>();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            await registerUser(phone, password, role as any, name);
            router.replace(`/${role}`);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
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
                        <TextInput
                            style={styles.input}
                            placeholder="Minimum 6 characters"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
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
