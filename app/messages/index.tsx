import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Chat, subscribeToMyChats } from '@/services/db/messageService';
import { getUserProfile } from '@/services/db/userProfile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MessagesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToMyChats(user.uid, async (myChats) => {
            try {
                // Fetch other user details for each chat
                const chatsWithDetails = await Promise.all(myChats.map(async (chat) => {
                    const otherUserId = chat.participants.find(id => id !== user.uid);
                    if (otherUserId) {
                        const profile = await getUserProfile(otherUserId);
                        return {
                            ...chat,
                            otherUser: {
                                name: profile?.name || 'User',
                                photoURL: profile?.photoURL
                            }
                        };
                    }
                    return chat;
                }));

                // Sort locally since we removed orderBy (to avoid indexing issues)
                const sortedChats = chatsWithDetails.sort((a: any, b: any) => {
                    const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt || 0);
                    const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt || 0);
                    return timeB - timeA;
                });

                setChats(sortedChats);
            } catch (error) {
                console.error("Error loading chats:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (date.toDateString() === now.toDateString()) {
            return timeStr;
        }

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Messages</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="black" />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.chatCard}
                            onPress={() => router.push({
                                pathname: '/messages/[id]',
                                params: {
                                    id: item.id,
                                    otherUserId: item.participants.find(p => p !== user?.uid),
                                    otherUserName: item.otherUser?.name
                                }
                            })}
                        >
                            <View style={styles.avatar}>
                                {item.otherUser?.photoURL ? (
                                    <Image source={{ uri: item.otherUser.photoURL }} style={styles.avatarImg} />
                                ) : (
                                    <MaterialCommunityIcons name="account-circle" size={50} color="#ddd" />
                                )}
                            </View>
                            <View style={styles.chatInfo}>
                                <View style={styles.chatHeader}>
                                    <Text style={styles.userName}>{item.otherUser?.name}</Text>
                                    <Text style={styles.time}>{formatTime(item.lastTimestamp)}</Text>
                                </View>
                                <Text style={styles.lastMessage} numberOfLines={1}>
                                    {item.lastMessage}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="message-text-outline" size={64} color="#ddd" />
                            <Text style={styles.emptyText}>No messages yet</Text>
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
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
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
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: 'black',
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        marginTop: 100,
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
});
