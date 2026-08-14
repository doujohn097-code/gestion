import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuroraBackground } from '@/components/AuroraBackground';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, router]);

  return (
    <AuroraBackground>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 80,
  },
});
