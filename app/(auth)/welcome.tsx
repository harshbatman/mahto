import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const pulseValue = useRef(new Animated.Value(1)).current;
    const [logoText, setLogoText] = useState('');
    const [taglineText, setTaglineText] = useState('');
    const [footerText1, setFooterText1] = useState('');
    const [footerText2, setFooterText2] = useState('');
    const [showFlag, setShowFlag] = useState(false);
    const [showHeart, setShowHeart] = useState(false);

    // Auto-redirect if already logged in
    useEffect(() => {
        if (!loading && user && profile) {
            router.replace(`/${profile.role}` as any);
        }
    }, [user, profile, loading]);

    const fullLogo = 'MAHTO';
    const fullTagline = 'Connect.Build.Work.Sell';
    const fullFooter1 = 'Made in ';
    const fullFooter2 = ' with ';

    const footerAnimated = useRef(false);

    useEffect(() => {
        let isCancelled = false;

        const runAnimation = async () => {
            if (isCancelled) return;

            // Reset only logo and tagline
            setLogoText('');
            setTaglineText('');

            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            // Logo
            for (let i = 0; i <= fullLogo.length; i++) {
                if (isCancelled) return;
                setLogoText(fullLogo.substring(0, i));
                await sleep(150);
            }

            await sleep(200);

            // Tagline
            for (let i = 0; i <= fullTagline.length; i++) {
                if (isCancelled) return;
                setTaglineText(fullTagline.substring(0, i));
                await sleep(60);
            }

            // Animate footer ONLY if it hasn't been done yet
            if (!footerAnimated.current) {
                await sleep(200);

                // Footer 1
                for (let i = 0; i <= fullFooter1.length; i++) {
                    if (isCancelled) return;
                    setFooterText1(fullFooter1.substring(0, i));
                    await sleep(60);
                }

                if (isCancelled) return;
                setShowFlag(true);
                await sleep(200);

                // Footer 2
                for (let i = 0; i <= fullFooter2.length; i++) {
                    if (isCancelled) return;
                    setFooterText2(fullFooter2.substring(0, i));
                    await sleep(60);
                }

                if (isCancelled) return;
                setShowHeart(true);
                footerAnimated.current = true;
            }

            // Wait before restarting logo/tagline loop
            await sleep(3000);
            if (!isCancelled) runAnimation();
        };

        runAnimation();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.logo}>{logoText}</Text>
                <View style={{ height: 30 }}>
                    <Text style={styles.tagline}>{taglineText}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/(auth)/select-role')}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>

                <View style={styles.madeInIndia}>
                    <Text style={styles.footerText}>{footerText1}</Text>
                    {showFlag && (
                        <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
                            <Text style={styles.footerText}>🇮🇳</Text>
                        </Animated.View>
                    )}
                    <Text style={styles.footerText}>{footerText2}</Text>
                    {showHeart && (
                        <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
                            <MaterialCommunityIcons name="heart" size={18} color="#ff4444" />
                        </Animated.View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Darker theme matching the image
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 8,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    footer: {
        padding: 30,
        paddingBottom: 80,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#000',
        width: '100%',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    madeInIndia: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontWeight: '600',
    },
});
