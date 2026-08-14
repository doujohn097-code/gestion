import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Avatar from './Avatar';
import StoryRing from './StoryRing';
import { apiFetch, apiFetchRaw } from '@/constants/api';
import Colors from '@/constants/Colors';

function Stat({ label, value, loading }: { label: string; value: number; loading?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{loading ? '-' : value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileHeader({
  profile,
  onChange,
}: {
  profile: any;
  onChange?: () => void;
}) {
  const router = useRouter();
  const [counts, setCounts] = useState({ friends: 0, requests: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);
  const isOwner = profile?.is_owner;

  useEffect(() => {
    const load = async () => {
      const friendsPath = isOwner ? '/api/friends' : `/api/friends/user/${profile.id}`;
      const promises: Promise<any>[] = [apiFetch(friendsPath)];
      if (isOwner) promises.push(apiFetch('/api/friends/requests_count'));
      const [fRes, rRes] = await Promise.all(promises);
      const friendsCount = fRes.ok
        ? (fRes.data.friends?.length ?? fRes.data.total ?? 0)
        : 0;
      const requestsCount = isOwner && rRes?.ok ? rRes.data.count || 0 : 0;
      setCounts({ friends: friendsCount, requests: requestsCount });
      setLoadingCounts(false);
    };
    load();
  }, [profile?.id, isOwner]);

  const handleFriend = async () => {
    if (isOwner || profile?.is_friend) return;
    const path = profile?.request_sent ? '/api/friends/cancel' : '/api/friends/request';
    const res = await apiFetchRaw(path, {
      method: 'POST',
      body: JSON.stringify({ to_id: profile.id }),
    });
    if (res.ok) onChange?.();
  };

  const friendLabel = profile?.is_friend
    ? 'صديق'
    : profile?.request_sent
    ? 'إلغاء الطلب'
    : 'إضافة صديق';

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.stats}>
          <Stat label="منشورات" value={profile?.postsCount || 0} />
          <Stat label="أصدقاء" value={counts.friends} loading={loadingCounts} />
          {isOwner ? (
            <Stat label="الطلبات" value={counts.requests} loading={loadingCounts} />
          ) : (
            <Stat label="الحالة" value={profile?.is_friend ? 1 : 0} />
          )}
        </View>
        <View style={styles.avatarWrap}>
          {profile?.has_story ? (
            <StoryRing
              uri={profile?.profile_picture_url}
              size={86}
              hasStory
              viewed={profile?.story_viewed}
              onPress={() => {}}
            />
          ) : (
            <Avatar uri={profile?.profile_picture_url} size={86} />
          )}
          {profile?.is_online ? <View style={styles.onlineDot} /> : null}
        </View>
      </View>

      <View style={styles.nameBlock}>
        <Text style={styles.name}>{profile?.full_name || profile?.username || ''}</Text>
        {profile?.is_verified ? <Text style={styles.verified}>✔</Text> : null}
      </View>
      {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <View style={styles.actions}>
        {isOwner ? (
          <>
            <Pressable style={[styles.actionBtn, styles.primaryBtn]} onPress={() => router.push('/edit-profile')}>
              <Text style={styles.primaryText}>تعديل الملف الشخصي</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => {}}>
              <Text style={styles.actionText}>مشاركة الملف الشخصي</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={[styles.actionBtn, profile?.is_friend ? styles.disabledBtn : styles.primaryBtn]} onPress={handleFriend}>
              <Text style={profile?.is_friend ? styles.actionText : styles.primaryText}>{friendLabel}</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => router.push(`/chat/${profile.id}`)}>
              <Text style={styles.actionText}>مراسلة</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  stats: { flexDirection: 'row', gap: 24, flex: 1, justifyContent: 'space-evenly' },
  stat: { alignItems: 'center' },
  statValue: { color: '#fff', fontWeight: '700', fontSize: 18 },
  statLabel: { color: Colors.dark.secondaryText, fontSize: 13, marginTop: 2 },
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
  nameBlock: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  name: { color: '#fff', fontWeight: '700', fontSize: 15 },
  verified: { color: '#0095F6', fontSize: 12 },
  bio: { color: '#fff', fontSize: 14, marginTop: 4, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  primaryBtn: { backgroundColor: '#fff', borderColor: '#fff' },
  disabledBtn: { backgroundColor: '#262626', borderColor: '#262626' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  primaryText: { color: '#000', fontWeight: '700', fontSize: 14 },
});
