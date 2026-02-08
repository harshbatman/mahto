import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { postJob } from '@/services/db/jobService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const WORKER_CATEGORIES = ['Mason', 'Painter', 'Electrician', 'Plumber', 'Carpenter', 'Laborer'];

export default function PostJobScreen() {
    const { profile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: '',
        category: 'Laborer',
        wage: '',
        description: '',
        location: profile?.address || '',
    });

    const handlePost = async () => {
        if (!form.title || !form.wage || !form.description) {
            Alert.alert('Missing Fields', 'Please fill in all details.');
            return;
        }

        setLoading(true);
        try {
            await postJob({
                homeownerId: profile?.uid || '',
                homeownerName: profile?.name || 'Homeowner',
                title: form.title,
                category: form.category,
                wage: form.wage,
                description: form.description,
                location: form.location,
            });
            Alert.alert('Success', 'Job posted successfully! Workers can now apply.');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="close" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hire a Worker</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Job Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Mason needed for wall work"
                                value={form.title}
                                onChangeText={(t) => setForm({ ...form, title: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Worker Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                                {WORKER_CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryBtn,
                                            form.category === cat && styles.categoryBtnActive
                                        ]}
                                        onPress={() => setForm({ ...form, category: cat })}
                                    >
                                        <Text style={[
                                            styles.categoryBtnText,
                                            form.category === cat && styles.categoryBtnTextActive
                                        ]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Daily Wage (₹)</Text>
                            <View style={styles.currencyWrapper}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <TextInput
                                    style={[styles.input, { paddingLeft: 35 }]}
                                    placeholder="800"
                                    keyboardType="numeric"
                                    value={form.wage}
                                    onChangeText={(t) => setForm({ ...form, wage: t })}
                                />
                                <Text style={styles.perDay}>/ day</Text>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Job Location</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Area, City"
                                value={form.location}
                                onChangeText={(t) => setForm({ ...form, location: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Short Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe what the worker needs to do..."
                                multiline
                                numberOfLines={4}
                                value={form.description}
                                onChangeText={(t) => setForm({ ...form, description: t })}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.postBtn}
                            onPress={handlePost}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.postBtnText}>Post Job</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        fontWeight: '700',
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    categoryBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    categoryBtnActive: {
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
    },
    categoryBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    categoryBtnTextActive: {
        color: 'white',
    },
    currencyWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    currencySymbol: {
        position: 'absolute',
        left: 14,
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        zIndex: 1,
    },
    perDay: {
        position: 'absolute',
        right: 14,
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
    },
    postBtn: {
        backgroundColor: '#6366f1',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    postBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '800',
    },
});
