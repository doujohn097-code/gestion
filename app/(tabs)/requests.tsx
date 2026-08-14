import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '@/components/Avatar';
import { AuroraBackground } from '@/components/AuroraBackground';
import Colors from '@/constants/Colors';

const DUMMY_REQUESTS = [
  { userId: 'u20', username: 'lina.design', full_name: 'Lina Design' },
  { userId: 'u21', username: 'omar.photo', full_name: 'Omar Photo' },
];

function RequestRow({ item }: { item: any }) {
  return (
    <View style={styles.row}>
      <Avatar uri={`https://i.pravatar.cc/150?u=${item.userId}`} size={52} />
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.full}>{item.full_name}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.accept]}>
          <Text style={styles.btnText}>قبول</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.decline]}>
          <Text style={[styles.btnText, { color: '#fff' }]}>رفض</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <AuroraBackground style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.title}>طلبات الصداقة</Text>
      </View>
      <FlatList
        data={DUMMY_REQUESTS}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => <RequestRow item={item} />}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
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
  info: { flex: 1 },
  username: { color: '#fff', fontWeight: '700', fontSize: 15 },
  full: { color: Colors.dark.secondaryText, fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  accept: {
    backgroundColor: Colors.dark.accent,
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  decline: { backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  btnText: { color: '#000', fontWeight: '800', fontSize: 13 },
});
