import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'logout';

interface ToastProps {
    visible: boolean;
    message: string;
    type: ToastType;
    onHide: () => void;
}

const { width } = Dimensions.get('window');

export const Toast: React.FC<ToastProps> = ({ visible, message, type, onHide }) => {
    const translateY = React.useRef(new Animated.Value(-100)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;
    const scale = React.useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 60,
                    useNativeDriver: true,
                    tension: 20,
                    friction: 7,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.9,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, translateY, opacity, scale]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return {
                    colors: ['#00b09b', '#96c93d'] as [string, string],
                    icon: 'check-circle' as const,
                };
            case 'error':
                return {
                    colors: ['#ff5f6d', '#ffc371'] as [string, string],
                    icon: 'alert-circle' as const,
                };
            case 'warning':
                return {
                    colors: ['#f12711', '#f5af19'] as [string, string],
                    icon: 'alert' as const,
                };
            case 'logout':
                return {
                    colors: ['#334155', '#475569'] as [string, string], // Slate dark theme for logout
                    icon: 'logout-variant' as const,
                };
            default:
                return {
                    colors: ['#2193b0', '#6dd5ed'] as [string, string],
                    icon: 'information' as const,
                };
        }
    };

    const { colors, icon } = getToastStyles();

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.container,
                {
                    transform: [{ translateY }, { scale }],
                    opacity,
                },
            ]}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <MaterialCommunityIcons name={icon} size={28} color="#FFF" />
                <Text style={styles.message}>{message}</Text>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        gap: 12,
    },
    message: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
        lineHeight: 20,
    },
});
