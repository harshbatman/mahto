import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Bid, getMyBids } from '@/services/db/contractService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BidWithContract extends Bid {
    contractTitle: string;
    contractLocation: string;
    contractStatus: string;
}

export default function MyBidsScreen() {
    const router = useRouter();
    const { profile } = useAuth();
    const [bids, setBids] = useState<BidWithContract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBids();
    }, []);

    const loadBids = async () => {
        try {
            if (profile?.uid) {
                const data = await getMyBids(profile.uid);
                setBids(data as BidWithContract[]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderBid = ({ item }: { item: BidWithContract }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <Text style={styles.contractTitle}>{item.contractTitle}</Text>
                    <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={14} color="#6b7280" />
                        <Text style={styles.locationText}>{item.contractLocation}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge,
                item.status === 'pending' ? styles.statusPending :
                    item.status === 'accepted' ? styles.statusAccepted : styles.statusRejected]}>
                    <Text style={[styles.statusText,
                    item.status === 'pending' ? styles.statusTextPending :
                        item.status === 'accepted' ? styles.statusTextAccepted : styles.statusTextRejected]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.bidDetails}>
                <View style={styles.bidAmountRow}>
                    <Text style={styles.bidLabel}>My Bid:</Text>
                    <Text style={styles.bidAmount}>₹{item.amount}</Text>
                </View>
                <Text style={styles.proposalLabel}>Proposal:</Text>
                <Text style={styles.proposalText} numberOfLines={3}>{item.proposal}</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/browse-contracts' })}>
                    <Text style={styles.viewContract}>View Contract</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Bids</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : bids.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="file-document-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>You haven't placed any bids yet.</Text>
                    <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/browse-contracts')}>
                        <Text style={styles.browseBtnText}>Find Contracts</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={bids}
                    renderItem={renderBid}
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
    contractTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#6b7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusPending: {
        backgroundColor: '#fef3c7',
    },
    statusAccepted: {
        backgroundColor: '#ecfdf5',
    },
    statusRejected: {
        backgroundColor: '#fef2f2',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    statusTextPending: {
        color: '#d97706',
    },
    statusTextAccepted: {
        color: '#059669',
    },
    statusTextRejected: {
        color: '#dc2626',
    },
    bidDetails: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    bidAmountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    bidLabel: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '600',
    },
    bidAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#10b981',
    },
    proposalLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    proposalText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
    viewContract: {
        fontSize: 13,
        fontWeight: '700',
        color: '#6366f1',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    browseBtn: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    browseBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 15,
    },
});
