import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from '@/components/Avatar';
import { AuroraBackground } from '@/components/AuroraBackground';
import Colors from '@/constants/Colors';

const DUMMY_USERS = [
  { userId: 'u10', username: 'ahmed.sport', full_name: 'Ahmed Sport', is_online: true },
  { userId: 'u11', username: 'nadia.art', full_name: 'Nadia Art', is_online: false },
  { userId: 'u12', username: 'yacine.dev', full_name: 'Yacine Dev', is_online: true },
  { userId: 'u13', username: 'lamia.music', full_name: 'Lamia Music', is_online: false },
];

function UserRow({ item }: { item: any }) {
  return (
    <View style={styles.row}>
      <View style={styles.avatarWrap}>
        <Avatar uri={`https://i.pravatar.cc/150?u=${item.userId}`} size={52} />
        {item.is_online ? <View style={styles.onlineDot} /> : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.full}>{item.full_name}</Text>
      </View>
      <Pressable style={styles.addBtn}>
        <Ionicons name="person-add" size={18} color="#000" />
      </Pressable>
    </View>
  );
}

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  return (
    <AuroraBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.title}>المستخدمون</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="search" size={22} color="#fff" />
        </Pressable>
      </View>
      <FlatList
        data={DUMMY_USERS}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => <UserRow item={item} />}
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
  username: { color: '#fff', fontWeight: '700', fontSize: 15 },
  full: { color: Colors.dark.secondaryText, fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});
