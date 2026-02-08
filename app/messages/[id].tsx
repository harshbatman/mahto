import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Message, sendMessage, subscribeToMessages } from '@/services/db/messageService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
    const { id, otherUserId, otherUserName } = useLocalSearchParams<{ id: string, otherUserId: string, otherUserName: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!id) return;

        const unsubscribe = subscribeToMessages(id, (newMessages) => {
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [id]);

    const handleSend = async () => {
        if (!inputText.trim() || !user || !otherUserId) return;

        const text = inputText.trim();
        setInputText('');

        try {
            await sendMessage(user.uid, otherUserId, text);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

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
            return `Yesterday, ${timeStr}`;
        }

        return `${date.toLocaleDateString([], { day: '2-digit', month: 'short' })}, ${timeStr}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{otherUserName || 'Chat'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id || Math.random().toString()}
                contentContainerStyle={styles.messageList}
                renderItem={({ item }) => {
                    const isMine = item.senderId === user?.uid;
                    return (
                        <View style={[styles.messageRow, isMine ? styles.myMessageRow : styles.theirMessageRow]}>
                            <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                                <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                                    {item.text}
                                </Text>
                                <Text style={[styles.messageTime, isMine ? styles.myTime : styles.theirTime]}>
                                    {formatTime(item.createdAt)}
                                </Text>
                            </View>
                        </View>
                    );
                }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[
                    styles.inputContainer,
                    { paddingBottom: Math.max(insets.bottom, 12) }
                ]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                        onPress={handleSend}
                    >
                        <MaterialCommunityIcons name="send" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    messageList: {
        padding: 16,
        paddingBottom: 32,
    },
    messageRow: {
        marginVertical: 4,
        flexDirection: 'row',
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: 'black',
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: 'white',
    },
    theirMessageText: {
        color: 'black',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTime: {
        color: 'rgba(255,255,255,0.6)',
    },
    theirTime: {
        color: '#999',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
        fontSize: 15,
        color: 'black',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        backgroundColor: '#ccc',
    },
});
