import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from '@/components/Avatar';
import { AuroraBackground } from '@/components/AuroraBackground';
import Colors from '@/constants/Colors';

const DUMMY_CHATS = [
  {
    userId: 'u2',
    username: 'mehdi.tuff',
    full_name: 'Mehdi Tuff',
    profile_picture_url: 'https://i.pravatar.cc/150?u=u2',
    last_message: 'مرحبا، كيف حالك؟',
    timestamp: '10:23',
    unread_count: 2,
    is_online: true,
  },
  {
    userId: 'u3',
    username: 'ilyas_parisien_111',
    full_name: 'Ilyas Parisien',
    profile_picture_url: 'https://i.pravatar.cc/150?u=u3',
    last_message: 'أرسلت لك ملف pdf',
    timestamp: 'أمس',
    unread_count: 0,
    is_online: false,
  },
  {
    userId: 'u4',
    username: 'sara.style',
    full_name: 'Sara Style',
    profile_picture_url: 'https://i.pravatar.cc/150?u=u4',
    last_message: 'شكرًا جزيلاً!',
    timestamp: '12:05',
    unread_count: 1,
    is_online: true,
  },
  {
    userId: 'u5',
    username: 'khalid.tech',
    full_name: 'Khalid Tech',
    profile_picture_url: 'https://i.pravatar.cc/150?u=u5',
    last_message: 'تمام، نلتقي غدًا',
    timestamp: '08:15',
    unread_count: 0,
    is_online: false,
  },
];

function ChatRow({ item }: { item: any }) {
  const router = useRouter();
  return (
    <Pressable style={styles.row} onPress={() => router.push(`/chat/${item.userId}`)}>
      <View style={styles.avatarWrap}>
        <Avatar uri={item.profile_picture_url} size={56} />
        {item.is_online ? <View style={styles.onlineDot} /> : null}
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.time}>{item.timestamp}</Text>
        </View>
        <View style={styles.msgRow}>
          <Text style={[styles.last, item.unread_count > 0 && styles.lastUnread]} numberOfLines={1}>
            {item.last_message}
          </Text>
          {item.unread_count > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread_count}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <AuroraBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.title}>المحادثات</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="create-outline" size={22} color="#fff" />
        </Pressable>
      </View>
      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => <ChatRow item={item} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      />
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00C851',
    borderWidth: 2,
    borderColor: '#000',
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: { color: '#fff', fontWeight: '700', fontSize: 15 },
  time: { color: Colors.dark.secondaryText, fontSize: 12 },
  msgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  last: { color: Colors.dark.secondaryText, fontSize: 14, flex: 1 },
  lastUnread: { color: '#fff', fontWeight: '600' },
  badge: {
    backgroundColor: Colors.dark.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#000', fontSize: 11, fontWeight: '800' },
});
