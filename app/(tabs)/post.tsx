import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostTab() {
    const router = useRouter();

    const postOptions = [
        {
            title: 'Post Contract',
            subtitle: 'For major construction or renovation works',
            icon: 'file-document-outline',
            route: '/post-contract',
            color: '#6366f1'
        },
        {
            title: 'Post Job',
            subtitle: 'Find workers for daily or small tasks',
            icon: 'account-hard-hat-outline',
            route: '/post-job',
            color: '#22c55e'
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Post</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.mainTitle}>What are you{'\n'}looking for today?</Text>

                <View style={styles.optionsContainer}>
                    {postOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => router.push(option.route as any)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: option.color + '15' }]}>
                                <MaterialCommunityIcons name={option.icon as any} size={32} color={option.color} />
                            </View>
                            <View style={styles.cardText}>
                                <Text style={styles.cardTitle}>{option.title}</Text>
                                <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="information" size={20} color="#64748b" />
                    <Text style={styles.infoText}>
                        Posting is free! Your post will be visible to verified professionals in your area.
                    </Text>
                </View>
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
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
    },
    content: {
        padding: 24,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000',
        letterSpacing: -1,
        marginBottom: 32,
    },
    optionsContainer: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardText: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 2,
    },
    infoBox: {
        flexDirection: 'row',
        marginTop: 40,
        padding: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
        fontWeight: '500',
    }
});
