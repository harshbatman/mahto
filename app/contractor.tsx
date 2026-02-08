import DashboardHeader from '@/components/DashboardHeader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ContractorDashboard() {
    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title="MAHTO Contractor" subtitle="Manage your projects & team" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard}>
                        <View style={styles.actionIcon}><MaterialCommunityIcons name="plus-box" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>Post Job</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionCard}>
                        <View style={[styles.actionIcon, { backgroundColor: '#333' }]}><MaterialCommunityIcons name="file-document-plus" size={24} color="white" /></View>
                        <Text style={styles.actionLabel}>New Contract</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Projects</Text>
                </View>

                <View style={styles.projectCard}>
                    <View style={styles.projectHeader}>
                        <Text style={styles.projectTitle}>Green Valley Villa</Text>
                        <View style={styles.statusBadge}><Text style={styles.statusText}>In Progress</Text></View>
                    </View>
                    <Text style={styles.projectLocation}>Sector 45, Gurgaon</Text>
                    <View style={styles.projectStats}>
                        <View><Text style={styles.statSub}>Workers</Text><Text style={styles.statVal}>8/12</Text></View>
                        <View><Text style={styles.statSub}>Timeline</Text><Text style={styles.statVal}>45 Days left</Text></View>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Homeowner Contracts</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>Browse</Text></TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.contractListCard}>
                    <Text style={styles.contractTitle}>Luxury Penthouse Renovation</Text>
                    <Text style={styles.contractBudget}>Est. Budget: ₹15L - ₹20L</Text>
                    <Text style={styles.contractMeta}>Bids: 4 Received • Closes in 2d</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    actionCard: {
        flex: 1,
        backgroundColor: Colors.light.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'black',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    actionLabel: {
        fontWeight: '700',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    seeAll: {
        color: Colors.light.muted,
        fontWeight: '600',
    },
    projectCard: {
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    statusBadge: {
        backgroundColor: '#E6F4EA',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    statusText: {
        color: '#1E7E34',
        fontSize: 11,
        fontWeight: '700',
    },
    projectLocation: {
        color: Colors.light.muted,
        marginTop: 4,
    },
    projectStats: {
        flexDirection: 'row',
        marginTop: Spacing.md,
        gap: Spacing.xl,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.light.surface,
    },
    statSub: {
        fontSize: 11,
        color: Colors.light.muted,
        textTransform: 'uppercase',
    },
    statVal: {
        fontSize: 15,
        fontWeight: '700',
    },
    contractListCard: {
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    contractTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    contractBudget: {
        marginTop: 4,
        fontWeight: '600',
    },
    contractMeta: {
        fontSize: 12,
        color: Colors.light.muted,
        marginTop: 4,
    }
});
