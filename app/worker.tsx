import DashboardHeader from '@/components/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { applyForJob, getAvailableJobs, Job } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WorkerDashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchJobs = async () => {
        try {
            const data = await getAvailableJobs();
            setJobs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const handleApply = async (id: string, title: string) => {
        try {
            await applyForJob(id);
            Alert.alert('Applied!', `You have applied for: ${title}. The homeowner will contact you if interested.`);
            fetchJobs(); // Update counts
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const heartScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(heartScale, {
                    toValue: 1.3,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(heartScale, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <DashboardHeader title="Worker Dashboard" showSearch={false} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: '#10b981' }]}>
                        <Text style={styles.statValue}>₹12,400</Text>
                        <Text style={styles.statLabel}>Earnings</Text>
                    </View>
                    <View style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: '#6366f1' }]}>
                        <Text style={styles.statValue}>{jobs.length}</Text>
                        <Text style={styles.statLabel}>New Jobs</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Jobs for You</Text>
                    <TouchableOpacity onPress={onRefresh}><Text style={styles.seeAll}>Refresh</Text></TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator color="black" style={{ marginTop: 20 }} />
                ) : jobs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="briefcase-off-outline" size={48} color={Colors.light.border} />
                        <Text style={styles.emptyText}>No new jobs available right now</Text>
                    </View>
                ) : (
                    jobs.map(job => (
                        <View key={job.id} style={styles.jobCard}>
                            <View style={styles.jobHeader}>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{job.category}</Text>
                                </View>
                                <Text style={styles.applicantCount}>{job.applicantCount} applied</Text>
                            </View>

                            <View style={styles.jobBody}>
                                <View style={styles.jobInfo}>
                                    <Text style={styles.jobTitle}>{job.title}</Text>
                                    <Text style={styles.jobLocation}>
                                        <MaterialCommunityIcons name="map-marker" size={12} color={Colors.light.muted} /> {job.location}
                                    </Text>
                                </View>
                                <View style={styles.payInfo}>
                                    <Text style={styles.jobPay}>₹{job.wage}</Text>
                                    <Text style={styles.paySub}>per day</Text>
                                </View>
                            </View>

                            <Text style={styles.description} numberOfLines={2}>{job.description}</Text>

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => handleApply(job.id!, job.title)}
                            >
                                <Text style={styles.applyBtnText}>Apply Now</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                <View style={styles.profileSection}>
                    <Text style={styles.sectionTitle}>Your Profile</Text>
                    <View style={styles.skillsContainer}>
                        {['Masonry', 'Plumbing', 'Painting'].map(skill => (
                            <View key={skill} style={styles.skillBadge}>
                                <Text style={styles.skillBadgeText}>{skill}</Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addSkill}>
                            <MaterialCommunityIcons name="plus" size={16} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Made in India 🇮🇳 with </Text>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                    <MaterialCommunityIcons name="heart" size={18} color="#ff0000" />
                </Animated.View>
            </View>
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
        backgroundColor: 'white',
        padding: Spacing.md,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.muted,
        fontWeight: '600',
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
        color: '#6366f1',
        fontWeight: '700',
    },
    jobCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4b5563',
    },
    applicantCount: {
        fontSize: 11,
        color: '#059669',
        fontWeight: '600',
    },
    jobBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: 'black',
    },
    jobLocation: {
        fontSize: 13,
        color: Colors.light.muted,
        marginTop: 4,
    },
    payInfo: {
        alignItems: 'flex-end',
    },
    jobPay: {
        fontSize: 18,
        fontWeight: '900',
        color: '#10b981',
    },
    paySub: {
        fontSize: 10,
        color: Colors.light.muted,
    },
    description: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
        marginVertical: 12,
    },
    applyBtn: {
        backgroundColor: '#6366f1',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    profileSection: {
        marginTop: Spacing.xl,
        paddingBottom: 40,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    skillBadge: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    skillBadgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    addSkill: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
        gap: 12,
    },
    emptyText: {
        color: Colors.light.muted,
        fontSize: 15,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        marginBottom: 20,
        opacity: 1,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    }
});
