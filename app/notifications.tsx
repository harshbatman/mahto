import { useAuth } from '@/context/AuthContext';
import { getNotifications, Notification } from '@/services/db/notificationService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const data = await getNotifications(user.uid);
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleNotificationPress = (notification: Notification) => {
        // Here you would mark as read and navigate
        if (notification.link) {
            router.push(notification.link as any);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => {/* Mark all as read */ }}>
                    <MaterialCommunityIcons name="check-all" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
                ) : notifications.length > 0 ? (
                    notifications.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.notificationItem, !item.read && styles.unreadItem]}
                            onPress={() => handleNotificationPress(item)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: item.type === 'error' ? '#fee2e2' : item.type === 'warning' ? '#fef3c7' : '#e0f2fe' }]}>
                                <MaterialCommunityIcons
                                    name={item.type === 'error' ? 'alert-circle' : item.type === 'warning' ? 'alert' : 'information'}
                                    size={24}
                                    color={item.type === 'error' ? '#ef4444' : item.type === 'warning' ? '#f59e0b' : '#0ea5e9'}
                                />
                            </View>
                            <View style={styles.contentBox}>
                                <View style={styles.topRow}>
                                    <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                                    <Text style={styles.timeText}>Just now</Text>
                                </View>
                                <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
                            </View>
                            {!item.read && <View style={styles.dot} />}
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <MaterialCommunityIcons name="bell-off-outline" size={60} color="#94a3b8" />
                        </View>
                        <Text style={styles.emptyTitle}>No Notifications</Text>
                        <Text style={styles.emptySub}>You're all caught up!</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentBox: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
        marginRight: 8,
    },
    unreadText: {
        fontWeight: '800',
        color: '#000',
    },
    timeText: {
        fontSize: 11,
        color: '#94a3b8',
    },
    messageText: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#000',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 14,
        color: '#94a3b8',
    }
});
