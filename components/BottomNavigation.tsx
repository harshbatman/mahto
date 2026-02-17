import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BottomNavigation() {
    const { profile } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        {
            label: 'Home',
            icon: 'home-variant',
            activeIcon: 'home-variant',
            path: `/${profile?.role}` as any,
        },
        {
            label: 'Post',
            icon: 'plus-circle-outline',
            activeIcon: 'plus-circle',
            path: profile?.role === 'worker' ? '/browse-jobs' : '/post-job',
        },
        {
            label: 'Profile',
            icon: 'account-circle-outline',
            activeIcon: 'account-circle',
            path: '/profile-menu',
            isProfile: true,
        }
    ];

    return (
        <View style={styles.container}>
            {navItems.map((item, index) => {
                const active = isActive(item.path);

                return (
                    <TouchableOpacity
                        key={index}
                        style={styles.navItem}
                        onPress={() => router.push(item.path)}
                    >
                        {item.isProfile && (profile?.photoURL || profile?.shopLogo || profile?.companyLogo) ? (
                            <View style={[styles.avatarWrapper, active && styles.activeAvatar]}>
                                <Image
                                    source={{ uri: profile.photoURL || profile.shopLogo || profile.companyLogo }}
                                    style={styles.avatarImg}
                                />
                            </View>
                        ) : (
                            <MaterialCommunityIcons
                                name={(active ? item.activeIcon : item.icon) as any}
                                size={28}
                                color={active ? '#000' : '#8E8E93'}
                            />
                        )}
                        <Text style={[styles.label, active && styles.activeLabel]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        color: '#8E8E93',
        marginTop: 4,
    },
    activeLabel: {
        color: '#000',
    },
    avatarWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#8E8E93',
    },
    activeAvatar: {
        borderColor: '#000',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    }
});
