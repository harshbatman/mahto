import { Colors, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
}

export default function DashboardHeader({ title, subtitle, showSearch = true }: DashboardHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                <TouchableOpacity style={styles.profileBtn}>
                    <MaterialCommunityIcons name="account-circle-outline" size={32} color="black" />
                </TouchableOpacity>
            </View>

            {showSearch && (
                <TouchableOpacity style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color={Colors.light.muted} />
                    <Text style={styles.searchText}>Search for jobs, materials, or people...</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.light.background,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
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
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        padding: Spacing.md,
        borderRadius: 12,
        gap: Spacing.sm,
    },
    searchText: {
        color: Colors.light.muted,
        fontSize: 15,
    },
});
