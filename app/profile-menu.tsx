
import { Colors, Spacing } from '@/constants/theme';
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
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileSummary}>
                    {(profile?.role === 'shop' || profile?.role === 'contractor') ? (
                        <>
                            <View style={styles.avatarContainer}>
                                {(profile?.shopLogo || profile?.companyLogo) ? (
                                    <Image source={{ uri: profile.shopLogo || profile?.companyLogo }} style={styles.avatar} />
                                ) : (
                                    <MaterialCommunityIcons name={profile?.role === 'shop' ? "store" : "briefcase"} size={60} color="#9ca3af" />
                                )}
                            </View>
                            <Text style={styles.userName}>{profile?.shopName || profile?.companyName || profile?.name || (profile?.role === 'shop' ? 'Shop' : 'Company')}</Text>
                        </>
                    ) : (
                        <>
                            <View style={styles.avatarContainer}>
                                {profile?.photoURL ? (
                                    <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                                ) : (
                                    <MaterialCommunityIcons name="account-circle" size={80} color="#9ca3af" />
                                )}
                            </View>
                            <Text style={styles.userName}>{profile?.name || 'User'}</Text>
                            <Text style={styles.userRole}>{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}</Text>
                        </>
                    )}
                </View>

                <View style={styles.menuList}>
                    {/* Display Account Type */}
                    <View style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <MaterialCommunityIcons name="shield-account" size={24} color="#6366f1" />
                            <Text style={styles.menuItemText}>
                                {profile?.role === 'shop' ? 'Shop Owner' : (profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User')}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push(profile?.role === 'shop' ? '/edit-shop' : profile?.role === 'contractor' ? '/edit-contractor-profile' : '/edit-profile')}
                    >
                        <View style={styles.menuItemLeft}>
                            <MaterialCommunityIcons
                                name={profile?.role === 'shop' ? "storefront-outline" : profile?.role === 'contractor' ? "briefcase-edit-outline" : "account-edit-outline"}
                                size={24}
                                color="black"
                            />
                            <Text style={styles.menuItemText}>
                                {profile?.role === 'shop' ? 'Edit Shop' : profile?.role === 'contractor' ? 'Edit Company' : 'Edit Profile'}
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.light.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
                        <View style={styles.menuItemLeft}>
                            <MaterialCommunityIcons name="cog-outline" size={24} color="black" />
                            <Text style={styles.menuItemText}>App Settings</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.light.muted} />
                    </TouchableOpacity>

                    <View style={styles.dangerZone}>
                        <Text style={styles.dangerTitle}>Account Actions</Text>
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={() => {
                                Alert.alert(
                                    'Logout Confirmation',
                                    'Are you sure you want to log out of your MAHTO account? You will need to sign in again to access your data.',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Yes, Logout',
                                            style: 'destructive',
                                            onPress: async () => {
                                                try {
                                                    await logout();
                                                    router.replace('/(auth)/select-role');
                                                } catch (error) {
                                                    Alert.alert('Error', 'Logout failed. Please try again.');
                                                }
                                            },
                                        },
                                    ]
                                );
                            }}
                        >
                            <View style={styles.menuItemLeft}>
                                <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
                                <Text style={styles.logoutText}>Logout from Account</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteInitBtn} onPress={() => setShowDeleteModal(true)}>
                            <View style={styles.menuItemLeft}>
                                <MaterialCommunityIcons name="delete-forever-outline" size={24} color="#999" />
                                <Text style={styles.deleteInitText}>Permanently Delete Account</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <Modal visible={showDeleteModal} transparent={true} animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Confirm account deletion</Text>
                            <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            This action is permanent and cannot be undone. Enter your credentials to proceed.
                        </Text>

                        <View style={styles.modalForm}>
                            <View style={styles.modalInputGroup}>
                                <Text style={styles.modalLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your phone number"
                                    keyboardType="phone-pad"
                                    value={confirmPhone}
                                    onChangeText={setConfirmPhone}
                                />
                            </View>

                            <View style={styles.modalInputGroup}>
                                <Text style={styles.modalLabel}>Password</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your password"
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.deleteBtn, deleteLoading && styles.disabledBtn]}
                                onPress={handleDeleteAccount}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.deleteBtnText}>Confirm Deletion</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    content: {
        padding: Spacing.lg,
    },
    profileSummary: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 16,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: 'black',
    },
    userRole: {
        fontSize: 16,
        color: Colors.light.muted,
        marginTop: 4,
    },
    menuList: {
        gap: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'black',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalForm: {
        gap: 16,
    },
    modalInputGroup: {
        gap: 8,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    deleteBtn: {
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    deleteBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    dangerZone: {
        marginTop: 32,
        gap: 16,
    },
    dangerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
        textTransform: 'uppercase',
        marginLeft: 4,
        marginBottom: 8,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff1f2',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
    },
    deleteInitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    deleteInitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
        textDecorationLine: 'underline',
    },
});
