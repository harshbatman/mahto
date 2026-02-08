import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const roles = [
    {
        id: 'worker',
        title: 'Worker',
        subtitle: 'Find daily jobs & steady work',
        icon: 'account-hard-hat',
    },
    {
        id: 'contractor',
        title: 'Contractor',
        subtitle: 'Post jobs & bid on contracts',
        icon: 'briefcase-account',
    },
    {
        id: 'homeowner',
        title: 'Homeowner',
        subtitle: 'Build or renovate your home',
        icon: 'home-account',
    },
    {
        id: 'shop',
        title: 'Shop Owner',
        subtitle: 'Sell construction materials',
        icon: 'storefront',
    },
];

export default function RoleSelection() {
    const router = useRouter();

    const handleRoleSelect = (roleId: string) => {
        // In a real app, we'd save this to context/storage
        // For now, we navigate to the specific role group
        router.replace(`/${roleId}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.logo}>MAHTO</Text>
                    <Text style={styles.title}>What's your role?</Text>
                    <Text style={styles.subtitle}>Select how you want to use the platform</Text>
                </View>

                <View style={styles.grid}>
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={styles.card}
                            onPress={() => handleRoleSelect(role.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons name={role.icon as any} size={32} color="black" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.cardTitle}>{role.title}</Text>
                                <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>By continuing, you agree to our Terms & Privacy Policy.</Text>
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
        flex: 1,
    },
    header: {
        marginTop: Spacing.xxl,
        marginBottom: Spacing.xl,
    },
    logo: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.light.text,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.muted,
        marginTop: Spacing.xs,
    },
    grid: {
        marginTop: Spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        // Minimal shadow for white theme
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        width: 60,
        height: 60,
        backgroundColor: Colors.light.surface,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
    },
    cardSubtitle: {
        fontSize: 13,
        color: Colors.light.muted,
        marginTop: 2,
    },
    footer: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: Colors.light.muted,
        textAlign: 'center',
    },
});
