import DashboardHeader from '@/components/DashboardHeader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const jobs = [
    { id: '1', title: 'Brick Layer Needed', location: 'Okhla, Delhi', pay: '₹800/day', type: 'Residential' },
    { id: '2', title: 'Plumbing Works', location: 'HSR Layout, Bangalore', pay: '₹1200/day', type: 'Renovation' },
    { id: '3', title: 'Tile Fixer', location: 'Powai, Mumbai', pay: '₹1000/day', type: 'Apartment' },
];

export default function WorkerDashboard() {
    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title="Hello, Worker" subtitle="3 New jobs in your area" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>₹12,400</Text>
                        <Text style={styles.statLabel}>Earnings</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Jobs Done</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Jobs for You</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                </View>

                {jobs.map(job => (
                    <TouchableOpacity key={job.id} style={styles.jobCard}>
                        <View style={styles.jobInfo}>
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <Text style={styles.jobMeta}>{job.location} • {job.type}</Text>
                        </View>
                        <View style={styles.jobAction}>
                            <Text style={styles.jobPay}>{job.pay}</Text>
                            <TouchableOpacity style={styles.applyBtn}>
                                <Text style={styles.applyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={styles.profileSection}>
                    <Text style={styles.sectionTitle}>Your Profile</Text>
                    <View style={styles.skillsContainer}>
                        {['Masonry', 'Plumbing', 'Painting'].map(skill => (
                            <View key={skill} style={styles.skillBadge}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addSkill}>
                            <MaterialCommunityIcons name="plus" size={16} color="black" />
                        </TouchableOpacity>
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
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: Colors.light.border,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.muted,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    seeAll: {
        color: Colors.light.muted,
        fontWeight: '600',
    },
    jobCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        marginBottom: Spacing.sm,
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    jobMeta: {
        fontSize: 13,
        color: Colors.light.muted,
        marginTop: 4,
    },
    jobAction: {
        alignItems: 'flex-end',
    },
    jobPay: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 8,
    },
    applyBtn: {
        backgroundColor: 'black',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    applyText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
    },
    profileSection: {
        marginTop: Spacing.xl,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    skillBadge: {
        backgroundColor: Colors.light.surface,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: BorderRadius.round,
    },
    skillText: {
        fontSize: 13,
        fontWeight: '600',
    },
    addSkill: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Colors.light.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
