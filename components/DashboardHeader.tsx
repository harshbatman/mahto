import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    onSearch?: (text: string) => void;
    placeholder?: string;
}

export default function DashboardHeader({ title, subtitle, showSearch = true, onSearch, placeholder }: DashboardHeaderProps) {
    const { profile } = useAuth();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => router.push('/profile-menu')}
                >
                    {profile?.role === 'shop' && profile?.shopLogo ? (
                        <Image source={{ uri: profile.shopLogo }} style={styles.profileImg} />
                    ) : profile?.role === 'contractor' && profile?.companyLogo ? (
                        <Image source={{ uri: profile.companyLogo }} style={styles.profileImg} />
                    ) : profile?.photoURL ? (
                        <Image source={{ uri: profile.photoURL }} style={styles.profileImg} />
                    ) : (
                        <MaterialCommunityIcons name="account-circle" size={36} color="black" />
                    )}
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={() => router.push('/messages')}
                >
                    <MaterialCommunityIcons name="message-text" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {showSearch && (
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={Colors.light.muted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={placeholder || "Search for jobs, materials, or people..."}
                        placeholderTextColor={Colors.light.muted}
                        onChangeText={onSearch}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.light.background,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.light.text,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.muted,
    },
    profileBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    profileImg: {
        width: '100%',
        height: '100%',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        padding: Spacing.md,
        borderRadius: 12,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: Colors.light.text,
        fontSize: 15,
        padding: 0,
    },
    messageBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
});
