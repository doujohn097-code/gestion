import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { AuroraBackground } from '@/components/AuroraBackground';
import Colors from '@/constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    await register({ fullName, username, password });
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <AuroraBackground style={{ paddingTop: insets.top }}>
      <View style={styles.content}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>إنشاء حساب</Text>
        <TextInput
          style={styles.input}
          placeholder="الاسم الكامل"
          placeholderTextColor={Colors.dark.secondaryText}
          value={fullName}
          onChangeText={setFullName}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="اسم المستخدم"
          placeholderTextColor={Colors.dark.secondaryText}
          value={username}
          onChangeText={setUsername}
          textAlign="right"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="كلمة المرور"
          placeholderTextColor={Colors.dark.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign="right"
        />
        <Pressable style={[styles.button, loading && styles.disabled]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'جارٍ التسجيل...' : 'إنشاء الحساب'}</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/login')} style={styles.linkRow}>
          <Text style={styles.linkText}>لديك حساب؟ سجل الدخول</Text>
        </Pressable>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    gap: 14,
  },
  logo: {
    width: 180,
    height: 70,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  button: {
    backgroundColor: Colors.dark.accent,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 15,
  },
  linkRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: Colors.dark.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
