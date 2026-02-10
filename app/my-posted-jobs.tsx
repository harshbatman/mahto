import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getPostedJobs, Job } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MyPostedJobsScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            if (profile?.uid) {
                const data = await getPostedJobs(profile.uid);
                setJobs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderJob = ({ item }: { item: Job }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: '/view-applicants',
                params: { jobId: item.id, title: item.title }
            })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
                    <Text style={[styles.statusText, item.status === 'open' ? styles.statusTextOpen : styles.statusTextClosed]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="cash" size={16} color="#666" />
                    <Text style={styles.detailText}>₹{item.wage}/day</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.location}</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

            <View style={styles.footer}>
                <View style={styles.applicantInfo}>
                    <MaterialCommunityIcons name="account-group" size={18} color="#6366f1" />
                    <Text style={styles.applicantCount}>
                        {item.applicantCount} {item.applicantCount === 1 ? 'Applicant' : 'Applicants'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={18} color="#6366f1" />
                </View>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Posted Jobs</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : jobs.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="briefcase-off-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>You haven't posted any jobs yet.</Text>
                    <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/post-job')}>
                        <Text style={styles.postBtnText}>Post a Job</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    renderItem={renderJob}
                    keyExtractor={item => item.id!}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    list: {
        padding: Spacing.lg,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    category: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusOpen: {
        backgroundColor: '#ecfdf5',
    },
    statusClosed: {
        backgroundColor: '#fef2f2',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    statusTextOpen: {
        color: '#059669',
    },
    statusTextClosed: {
        color: '#dc2626',
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        color: '#4b5563',
    },
    description: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    applicantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    applicantCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366f1',
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    postBtn: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    postBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
});
