import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'info' | 'success';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'info'
}) => {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const getIcon = () => {
        switch (type) {
            case 'danger': return 'alert-circle-outline';
            case 'success': return 'check-circle-outline';
            default: return 'information-outline';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'danger': return ['#ef4444', '#dc2626'] as [string, string];
            case 'success': return ['#10b981', '#059669'] as [string, string];
            default: return ['#3b82f6', '#2563eb'] as [string, string];
        }
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: opacityValue }]}>
                    <TouchableOpacity activeOpacity={1} style={styles.fill} onPress={onCancel} />
                </Animated.View>

                <Animated.View style={[
                    styles.content,
                    {
                        opacity: opacityValue,
                        transform: [{ scale: scaleValue }]
                    }
                ]}>
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={getColors()}
                            style={styles.iconGradient}
                        >
                            <MaterialCommunityIcons name={getIcon()} size={32} color="white" />
                        </LinearGradient>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onConfirm} activeOpacity={0.8}>
                            <LinearGradient
                                colors={getColors()}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.confirmButton}
                            >
                                <Text style={styles.confirmText}>{confirmText}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    fill: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    content: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    iconContainer: {
        marginTop: -60,
        marginBottom: 20,
        borderRadius: 24,
        padding: 4,
        backgroundColor: 'white',
    },
    iconGradient: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#64748b',
    },
    confirmButton: {
        paddingHorizontal: 32,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 120,
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
});
