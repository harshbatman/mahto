import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getMyJobApplications, JobApplication } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AppliedJobsScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        if (!profile?.uid) return;
        try {
            const data = await getMyJobApplications(profile.uid);
            setApplications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, [profile?.uid]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Applications</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="black" />
                </View>
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={(item) => item.id!}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.appCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    item.status === 'accepted' ? styles.acceptedBadge :
                                        item.status === 'rejected' ? styles.rejectedBadge : styles.pendingBadge
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        item.status === 'accepted' ? styles.acceptedText :
                                            item.status === 'rejected' ? styles.rejectedText : styles.pendingText
                                    ]}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="map-marker" size={16} color={Colors.light.muted} />
                                    <Text style={styles.infoText}>{item.jobLocation}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <MaterialCommunityIcons name="calendar" size={16} color={Colors.light.muted} />
                                    <Text style={styles.infoText}>
                                        Applied on {new Date(item.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    Current Job Status: <Text style={styles.highlightText}>{(item as any).jobStatus || 'Open'}</Text>
                                </Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={Colors.light.border} />
                            <Text style={styles.emptyText}>You haven't applied for any jobs yet.</Text>
                            <TouchableOpacity
                                style={styles.browseBtn}
                                onPress={() => router.push('/browse-jobs')}
                            >
                                <Text style={styles.browseBtnText}>Browse Available Jobs</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
        fontWeight: '800',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.lg,
    },
    appCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: 'black',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    pendingBadge: {
        backgroundColor: '#fef3c7',
    },
    acceptedBadge: {
        backgroundColor: '#dcfce7',
    },
    rejectedBadge: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
    },
    pendingText: {
        color: '#b45309',
    },
    acceptedText: {
        color: '#15803d',
    },
    rejectedText: {
        color: '#b91c1c',
    },
    infoRow: {
        marginBottom: 16,
        gap: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 13,
        color: '#666',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    footerText: {
        fontSize: 12,
        color: '#666',
    },
    highlightText: {
        color: 'black',
        fontWeight: '700',
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.light.muted,
        fontWeight: '600',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    browseBtn: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    browseBtnText: {
        color: 'white',
        fontWeight: '700',
    }
});
