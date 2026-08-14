import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import { AuroraBackground } from '@/components/AuroraBackground';
import Colors from '@/constants/Colors';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <AuroraBackground>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 64 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Avatar uri={user?.profile_picture_url} size={96} />
            {user?.is_online ? <View style={styles.onlineDot} /> : null}
          </View>
          <View style={styles.stats}>
            <Stat label="منشورات" value={12} />
            <Stat label="أصدقاء" value={48} />
            <Stat label="طلبات" value={3} />
          </View>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.name}>{user?.full_name || user?.username}</Text>
          {user?.is_verified ? <Text style={styles.verified}>✔</Text> : null}
        </View>
        <Text style={styles.bio}>مرحبا بكم في Friendgram 👋</Text>

        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, styles.primaryBtn]}>
            <Text style={styles.primaryText}>تعديل الملف الشخصي</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Text style={styles.actionText}>مشاركة الملف</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>البريد: friendgram@app.com</Text>
            <View style={styles.divider} />
            <Text style={styles.infoText}>الحالة: نشط الآن</Text>
          </View>
        </View>
      </ScrollView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00C851',
    borderWidth: 3,
    borderColor: '#000',
  },
  stats: {
    flexDirection: 'row',
    gap: 28,
    flex: 1,
    justifyContent: 'space-evenly',
  },
  stat: { alignItems: 'center' },
  statValue: { color: '#fff', fontWeight: '700', fontSize: 18 },
  statLabel: { color: Colors.dark.secondaryText, fontSize: 13, marginTop: 2 },
  nameBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 6,
  },
  name: { color: '#fff', fontWeight: '700', fontSize: 18 },
  verified: { color: Colors.dark.accent, fontSize: 15 },
  bio: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  primaryBtn: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  primaryText: { color: '#000', fontWeight: '800', fontSize: 14 },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  section: { marginTop: 24 },
  sectionTitle: {
    color: Colors.dark.secondaryText,
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 12,
  },
  infoText: { color: '#fff', fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
