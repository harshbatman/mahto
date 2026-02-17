import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const [logoText, setLogoText] = useState('');
    const [taglineText, setTaglineText] = useState('');
    const [footerText1, setFooterText1] = useState('');
    const [footerText2, setFooterText2] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const heartScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(heartScale, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(heartScale, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(heartScale, {
                    toValue: 1.2,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(heartScale, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.delay(1000),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!loading && user && profile) {
            router.replace(`/${profile.role}` as any);
        }
    }, [user, profile, loading]);

    const fullLogo = 'MAHTO';
    const fullTagline = 'Connect • Build • Work • Sell';
    const fullFooter1 = 'Made in ';
    const fullFooter2 = ' with ';

    useEffect(() => {
        let isCancelled = false;

        const runAnimation = async () => {
            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            // Initial delay
            await sleep(500);

            while (!isCancelled) {
                setLogoText('');
                setTaglineText('');

                for (let i = 0; i <= fullLogo.length; i++) {
                    if (isCancelled) return;
                    setLogoText(fullLogo.substring(0, i));
                    await sleep(150); // Slightly slower for impact
                }

                await sleep(500);

                for (let i = 0; i <= fullTagline.length; i++) {
                    if (isCancelled) return;
                    setTaglineText(fullTagline.substring(0, i));
                    await sleep(50);
                }

                // Show button if not already shown
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();

                await sleep(3000); // Wait before restarting loop
            }
        };

        runAnimation();

        return () => {
            isCancelled = true;
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}>{logoText}</Text>
                <View style={{ height: 30 }}>
                    <Text style={styles.tagline}>{taglineText}</Text>
                </View>
            </View>

            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/(auth)/select-role')}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                    <MaterialCommunityIcons name="arrow-right" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.madeInIndia}>
                    <Text style={styles.footerText}>Made in </Text>
                    <Text style={[styles.footerText, { color: '#fff' }]}>🇮🇳</Text>
                    <Text style={styles.footerText}> with </Text>
                    <Animated.Text style={[styles.footerText, { color: '#fff', transform: [{ scale: heartScale }] }]}>❤️</Animated.Text>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logo: {
        fontSize: 96,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
        marginBottom: 10,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 24,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    footer: {
        padding: 24,
        paddingBottom: 60,
    },
    button: {
        backgroundColor: '#fff',
        width: '100%',
        height: 56,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '700',
    },
    madeInIndia: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 16,
        fontWeight: '600',
    },
});
