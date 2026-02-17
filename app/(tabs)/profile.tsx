import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileTab() {
    const { profile, logout } = useAuth();
    const router = useRouter();

    const menuItems = [
        {
            title: profile?.role === 'shop' ? 'Shop Profile' : profile?.role === 'contractor' ? 'Business Profile' : 'Personal Profile',
            icon: profile?.role === 'shop' ? 'store-outline' : profile?.role === 'contractor' ? 'briefcase-outline' : 'account-outline',
            route: profile?.role === 'shop' ? '/edit-shop' : profile?.role === 'contractor' ? '/edit-contractor-profile' : '/edit-profile'
        },
        { title: 'Settings', icon: 'cog-outline', route: '/settings' },
        { title: 'Help & Support', icon: 'help-circle-outline', route: '/help-support' },
        { title: 'Privacy Policy', icon: 'shield-check-outline', route: '/privacy-policy' },
        { title: 'About Us', icon: 'information-outline', route: '/about-us' },
    ];

    const handleSignOut = () => {
        Alert.alert('Sign out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                        router.replace('/(auth)/select-role');
                    } catch (error) {
                        Alert.alert('Error', 'Logout failed.');
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.avatarBox}>
                        {profile?.photoURL || profile?.shopLogo || profile?.companyLogo ? (
                            <Image source={{ uri: profile?.photoURL || profile?.shopLogo || profile?.companyLogo }} style={styles.avatarImg} />
                        ) : (
                            <MaterialCommunityIcons name="account" size={40} color="#94a3b8" />
                        )}
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{profile?.shopName || profile?.companyName || profile?.name || 'User'}</Text>
                        <Text style={styles.userRole}>{profile?.role?.toUpperCase() || 'MEMBER'}</Text>
                    </View>
                </View>

                <View style={styles.menuList}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
                            <View style={styles.menuIconBox}>
                                <MaterialCommunityIcons name={item.icon as any} size={22} color="#000" />
                            </View>
                            <Text style={styles.menuText}>{item.title}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
                    <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
                    <Text style={styles.signOutText}>Sign out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>MAHTO v1.1.16</Text>
                    <Text style={styles.madeInIndia}>Made in India 🇮🇳</Text>
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
        paddingBottom: 100,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        marginBottom: 32,
    },
    avatarBox: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    userInfo: {
        marginLeft: 16,
    },
    userName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
    },
    userRole: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748b',
        letterSpacing: 1,
        marginTop: 4,
    },
    menuList: {
        marginBottom: 32,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fee2e2',
        gap: 12,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ef4444',
    },
    footer: {
        marginTop: 48,
        alignItems: 'center',
        gap: 8,
    },
    versionText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    madeInIndia: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '700',
    }
});
