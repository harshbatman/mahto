import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const { profile } = useAuth();

    const insets = useSafeAreaInsets();

    // Get the display name based on role, fallback to 'Profile'
    const displayName = profile?.shopName || profile?.companyName || profile?.name?.split(' ')[0] || 'Profile';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 60 + (Platform.OS === 'ios' ? insets.bottom : (insets.bottom > 0 ? insets.bottom : 12)),
                    paddingBottom: Platform.OS === 'ios' ? insets.bottom : (insets.bottom > 0 ? insets.bottom : 12),
                    paddingTop: 12,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                },
                tabBarActiveTintColor: '#000',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialCommunityIcons name={focused ? "home" : "home-outline"} size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="post"
                options={{
                    title: 'Post',
                    tabBarIcon: () => (
                        <View style={styles.postIconContainer}>
                            <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: displayName,
                    tabBarIcon: ({ color, focused }) => {
                        const profileImage = profile?.shopLogo || profile?.companyLogo || profile?.photoURL;

                        return profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    borderWidth: focused ? 2 : 0,
                                    borderColor: color
                                }}
                            />
                        ) : (
                            <MaterialCommunityIcons name={focused ? "account" : "account-outline"} size={32} color={color} />
                        );
                    },
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: Platform.OS === 'ios' ? 88 : 74,
        paddingBottom: Platform.OS === 'ios' ? 30 : 14,
        paddingTop: 14,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '800',
        marginTop: 4,
    },
    postIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30, // Lift it up
        borderWidth: 4,
        borderColor: '#f1f5f9', // Creates a cutout effect
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    }
});
