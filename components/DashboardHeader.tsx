import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
    showSearch?: boolean;
    onSearch?: (text: string) => void;
    placeholder?: string;
}

export default function DashboardHeader({ title, subtitle, showSearch = true, onSearch, placeholder }: DashboardHeaderProps) {
    const { profile } = useAuth();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    {profile?.role === 'shop' ? (
                        profile.shopLogo ? (
                            <Image source={{ uri: profile.shopLogo }} style={styles.profileImg} />
                        ) : (
                            <MaterialCommunityIcons name="store-outline" size={40} color="black" />
                        )
                    ) : profile?.role === 'contractor' ? (
                        profile.companyLogo ? (
                            <Image source={{ uri: profile.companyLogo }} style={styles.profileImg} />
                        ) : (
                            <MaterialCommunityIcons name="briefcase-outline" size={40} color="black" />
                        )
                    ) : (
                        profile?.photoURL ? (
                            <Image source={{ uri: profile.photoURL }} style={styles.profileImg} />
                        ) : (
                            <MaterialCommunityIcons name="account-circle" size={40} color="black" />
                        )
                    )}
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                <View style={styles.actionBlock}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push('/notifications')}
                    >
                        <MaterialCommunityIcons name="bell-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push('/messages')}
                    >
                        <MaterialCommunityIcons name="message-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {
                showSearch && (
                    <View style={styles.searchBar}>
                        <View style={styles.searchIcon}>
                            <MaterialCommunityIcons name="magnify" size={24} color="#000" />
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={placeholder || "Where to?"}
                            placeholderTextColor="#545454"
                            onChangeText={onSearch}
                        />
                    </View>
                )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        color: '#545454',
    },
    profileBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    profileImg: {
        width: '100%',
        height: '100%',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEEEEE',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 30,
        gap: 10,
    },
    searchIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        color: '#000',
        fontSize: 18,
        fontWeight: '600',
        padding: 0,
    },
    actionBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
    },
});
