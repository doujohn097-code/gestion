import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from './Avatar';
import TabIcon from './TabIcon';

const { width } = Dimensions.get('window');

export default function PostCard({ post }: { post: any }) {
  const router = useRouter();
  const [liked, setLiked] = useState(!!post.is_liked);
  const [likes, setLikes] = useState(post.likes || 0);
  const [saved, setSaved] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const user = post.user || {};
  const mediaUrls = post.mediaUrls || [];

  const toggleLike = () => {
    setLiked((prev: boolean) => {
      const next = !prev;
      setLikes((count: number) => count + (next ? 1 : -1));
      return next;
    });
  };

  const toggleSave = () => setSaved((prev: boolean) => !prev);

  const renderMedia = ({ item }: { item: string }) => {
    return (
      <Image
        source={{ uri: item }}
        style={styles.media}
        contentFit="cover"
        transition={200}
      />
    );
  };

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, '')} ألف`;
    return `${n}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <Avatar uri={user.profile_picture_url} size={32} />
          <Text style={styles.username}>{user.username || 'مستخدم'}</Text>
          {user.is_verified ? <Ionicons name="checkmark-circle" size={14} color="#0095F6" style={{ marginLeft: 4 }} /> : null}
        </View>
        <Pressable>
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Media */}
      {mediaUrls.length > 0 ? (
        <View>
          <FlatList
            data={mediaUrls}
            renderItem={renderMedia}
            keyExtractor={(_, i) => `${post.postId}-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentIndex(idx);
            }}
          />
          {mediaUrls.length > 1 ? (
            <View style={styles.dots}>
              {mediaUrls.map((_, i) => (
                <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <Pressable onPress={toggleLike}>
            <TabIcon name="heart" focused={liked} size={28} />
          </Pressable>
          <Pressable onPress={() => router.push(`/post/${post.postId}`)}>
            <TabIcon name="chat" focused={false} size={26} />
          </Pressable>
          <Pressable>
            <TabIcon name="send" focused={false} size={24} />
          </Pressable>
        </View>
        <Pressable onPress={toggleSave}>
          <TabIcon name="bookmark" focused={saved} size={24} />
        </Pressable>
      </View>

      {/* Likes & caption */}
      {likes > 0 ? <Text style={styles.likes}>{formatCount(likes)} إعجاب</Text> : null}
      {post.content ? (
        <View style={styles.captionRow}>
          <Text style={styles.usernameInline}>{user.username}</Text>
          <Text style={styles.caption}>{post.content}</Text>
        </View>
      ) : null}
      {post.commentsCount > 0 ? (
        <Pressable onPress={() => router.push(`/post/${post.postId}`)}>
          <Text style={styles.comments}>عرض {formatCount(post.commentsCount)} تعليقات</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push(`/post/${post.postId}`)}>
          <Text style={styles.comments}>أضف تعليقًا...</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  media: {
    width,
    height: width,
    backgroundColor: '#111',
  },
  dots: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#0095F6',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  likes: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  captionRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  usernameInline: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  comments: {
    color: '#A8A8A8',
    fontSize: 13,
    paddingHorizontal: 12,
    marginTop: 4,
  },
});
