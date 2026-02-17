
import { useAuth } from '@/context/AuthContext';
import { deleteUserAccount } from '@/services/auth/authService';
import { sanitizeError } from '@/utils/errorHandler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileMenuScreen() {
    const { profile, logout } = useAuth();
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmPhone, setConfirmPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDeleteAccount = async () => {
        if (!confirmPhone || !confirmPassword) {
            Alert.alert('Error', 'Please enter both phone and password to confirm.');
            return;
        }

        setDeleteLoading(true);
        try {
            await deleteUserAccount(confirmPhone, confirmPassword);
            setShowDeleteModal(false);
            Alert.alert('Account Deleted', 'Your account and data have been permanently removed.');
            router.replace('/(auth)/select-role');
        } catch (error: any) {
            Alert.alert('Deletion Failed', sanitizeError(error));
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.profileHero}>
                    <View style={styles.avatarBox}>
                        {profile?.role === 'shop' ? (
                            profile.shopLogo ? (
                                <Image source={{ uri: profile.shopLogo }} style={styles.avatarImg} />
                            ) : (
                                <MaterialCommunityIcons name="store-outline" size={48} color="black" />
                            )
                        ) : profile?.role === 'contractor' ? (
                            profile.companyLogo ? (
                                <Image source={{ uri: profile.companyLogo }} style={styles.avatarImg} />
                            ) : (
                                <MaterialCommunityIcons name="briefcase-outline" size={48} color="black" />
                            )
                        ) : (
                            profile?.photoURL ? (
                                <Image source={{ uri: profile.photoURL }} style={styles.avatarImg} />
                            ) : (
                                <MaterialCommunityIcons name="account-outline" size={48} color="black" />
                            )
                        )}
                    </View>
                    <View style={styles.heroInfo}>
                        <Text style={styles.userName}>{profile?.shopName || profile?.companyName || profile?.name || 'User'}</Text>
                        <Text style={styles.userRole}>
                            {profile?.role ? profile.role.toUpperCase() : 'MEMBER'}
                        </Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push(profile?.role === 'shop' ? '/edit-shop' : profile?.role === 'contractor' ? '/edit-contractor-profile' : '/edit-profile')}
                    >
                        <MaterialCommunityIcons
                            name={profile?.role === 'shop' ? "store-outline" : profile?.role === 'contractor' ? "briefcase-outline" : "account-outline"}
                            size={24}
                            color="black"
                        />
                        <Text style={styles.menuText}>
                            {profile?.role === 'shop' ? 'Shop Profile' : profile?.role === 'contractor' ? 'Business Profile' : 'Personal Profile'}
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
                        <MaterialCommunityIcons name="cog-outline" size={24} color="black" />
                        <Text style={styles.menuText}>Settings</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/about-us')}>
                        <MaterialCommunityIcons name="information-outline" size={24} color="black" />
                        <Text style={styles.menuText}>About</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#AFAFAF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.authActions}>
                    <TouchableOpacity
                        style={styles.signOutBtn}
                        onPress={() => {
                            Alert.alert(
                                'Sign out',
                                'Are you sure you want to sign out?',
                                [
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
                                        },
                                    },
                                ]
                            );
                        }}
                    >
                        <Text style={styles.signOutText}>Sign out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.deleteLink} onPress={() => setShowDeleteModal(true)}>
                        <Text style={styles.deleteLinkText}>Delete account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={showDeleteModal} transparent={true} animationType="fade">
                <View style={styles.modalBackdrop}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalView}>
                        <View style={styles.modalInner}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Delete account</Text>
                                <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="black" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalDesc}>
                                This will permanently remove your account and all associated data from MAHTO.
                            </Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Registered phone number"
                                keyboardType="phone-pad"
                                value={confirmPhone}
                                onChangeText={setConfirmPhone}
                                placeholderTextColor="#AFAFAF"
                            />

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Your password"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholderTextColor="#AFAFAF"
                            />

                            <TouchableOpacity
                                style={[styles.modalActionBtn, deleteLoading && styles.modalActionBtnDisabled]}
                                onPress={handleDeleteAccount}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.modalActionText}>Confirm Deletion</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
        paddingHorizontal: 20,
    },
    profileHero: {
        paddingVertical: 32,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
    },
    avatarBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F3F3',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    heroInfo: {
        alignItems: 'center',
        marginTop: 16,
    },
    userName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#000',
        letterSpacing: -0.5,
    },
    userRole: {
        fontSize: 12,
        fontWeight: '800',
        color: '#545454',
        marginTop: 4,
        letterSpacing: 2,
    },
    menuContainer: {
        marginTop: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F3F3',
        gap: 20,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    authActions: {
        marginTop: 48,
        paddingBottom: 40,
        gap: 24,
    },
    signOutBtn: {
        height: 56,
        backgroundColor: '#F3F3F3',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    deleteLink: {
        alignItems: 'center',
    },
    deleteLinkText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ef4444',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 24,
    },
    modalView: {
        width: '100%',
    },
    modalInner: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    modalDesc: {
        fontSize: 15,
        color: '#545454',
        lineHeight: 22,
        marginBottom: 24,
    },
    modalInput: {
        height: 56,
        backgroundColor: '#F3F3F3',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
        marginBottom: 12,
    },
    modalActionBtn: {
        height: 56,
        backgroundColor: '#000',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    modalActionBtnDisabled: {
        opacity: 0.5,
    },
    modalActionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
