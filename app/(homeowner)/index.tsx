import DashboardHeader from '@/components/DashboardHeader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeownerDashboard() {
    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title="My Home" subtitle="Build & Maintain" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Build your Dream Home</Text>
                    <Text style={styles.heroSubtitle}>Find the best contractors and workers for your project.</Text>
                    <TouchableOpacity style={styles.postBtn}>
                        <Text style={styles.postBtnText}>Post a Contract</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Labour</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>More</Text></TouchableOpacity>
                </View>

                <View style={styles.labourGrid}>
                    {[
                        { name: 'Electrician', icon: 'lightning-bolt' },
                        { name: 'Plumber', icon: 'water-pump' },
                        { name: 'Painter', icon: 'format-paint' },
                        { name: 'Mason', icon: 'wall' }
                    ].map(item => (
                        <TouchableOpacity key={item.name} style={styles.labourItem}>
                            <View style={styles.labourIcon}><MaterialCommunityIcons name={item.icon as any} size={24} color="black" /></View>
                            <Text style={styles.labourName}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Ongoing Projects</Text>
                </View>

                <View style={styles.projectProgressCard}>
                    <View style={styles.projInfo}>
                        <Text style={styles.projName}>Ground Floor Slab</Text>
                        <Text style={styles.projContractor}>by AR Constructions</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '65%' }]} />
                    </View>
                    <View style={styles.progressMeta}>
                        <Text style={styles.progressText}>65% Completed</Text>
                        <TouchableOpacity><Text style={styles.payBtnText}>Make Payment</Text></TouchableOpacity>
                    </View>
                </View>

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
    heroCard: {
        backgroundColor: 'black',
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    heroTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    heroSubtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    postBtn: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    postBtnText: {
        color: 'black',
        fontWeight: '700',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        marginTop: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    seeAll: {
        color: Colors.light.muted,
        fontWeight: '600',
    },
    labourGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    labourItem: {
        width: (Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md * 3) / 4,
        alignItems: 'center',
    },
    labourIcon: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    labourName: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    projectProgressCard: {
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: BorderRadius.lg,
    },
    projInfo: {
        marginBottom: 16,
    },
    projName: {
        fontSize: 17,
        fontWeight: '700',
    },
    projContractor: {
        fontSize: 13,
        color: Colors.light.muted,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: Colors.light.surface,
        borderRadius: 4,
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: 'black',
        borderRadius: 4,
    },
    progressMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.muted,
    },
    payBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: 'black',
    }
});

import { Dimensions } from 'react-native';
