import { Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const roles = [
    {
        id: 'homeowner',
        title: 'Homeowner',
        subtitle: 'I want to hire pros for my property',
        icon: 'home-account',
        color: '#6366f1'
    },
    {
        id: 'worker',
        title: 'Worker / Labour',
        subtitle: 'I am looking for daily wage work',
        icon: 'account-hard-hat',
        color: '#a855f7'
    },
    {
        id: 'contractor',
        title: 'Contractor',
        subtitle: 'I manage construction projects',
        icon: 'briefcase-account',
        color: '#ec4899'
    },
    {
        id: 'shop',
        title: 'Shop Owner',
        subtitle: 'I sell construction materials',
        icon: 'storefront',
        color: '#f59e0b'
    }
];

export default function SelectRoleScreen() {
    const router = useRouter();

    const handleSelect = (roleId: string) => {
        router.push({
            pathname: '/(auth)/register',
            params: { role: roleId }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome to MAHTO</Text>
                    <Text style={styles.subtitle}>How would you like to use the app?</Text>
                </View>

                <View style={styles.grid}>
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={styles.card}
                            onPress={() => handleSelect(role.id)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: role.color + '15' }]}>
                                <MaterialCommunityIcons name={role.icon as any} size={32} color={role.color} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardTitle}>{role.title}</Text>
                                <Text style={styles.cardSub}>{role.subtitle}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.push('/(auth)/phone-login')}
                >
                    <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Login</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: Spacing.lg,
        paddingTop: 60,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        fontWeight: '500',
    },
    grid: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    cardSub: {
        fontSize: 13,
        color: '#777',
        marginTop: 2,
    },
    loginLink: {
        marginTop: 40,
        alignItems: 'center',
    },
    loginText: {
        fontSize: 15,
        color: '#666',
    },
    loginBold: {
        color: '#000',
        fontWeight: '800',
    },
});
