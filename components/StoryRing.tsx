import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Avatar from './Avatar';

export default function StoryRing({
  uri,
  username,
  size = 72,
  hasStory = false,
  viewed = false,
  onPress,
}: {
  uri?: string | null;
  username?: string;
  size?: number;
  hasStory?: boolean;
  viewed?: boolean;
  onPress?: () => void;
}) {
  const ringWidth = 3;
  const outerSize = size + ringWidth * 4;
  const innerSize = size;

  const ringColors: [string, string, string] = viewed
    ? ['#A8A8A8', '#A8A8A8', '#A8A8A8']
    : ['#F58529', '#DD2A7B', '#8134AF'];

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {hasStory ? (
        <LinearGradient
          colors={ringColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.ring,
            { width: outerSize, height: outerSize, borderRadius: outerSize / 2 },
          ]}>
          <View
            style={[
              styles.inner,
              { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
            ]}>
            <Avatar uri={uri} size={innerSize - 4} />
          </View>
        </LinearGradient>
      ) : (
        <Avatar uri={uri} size={innerSize} />
      )}
      {username ? (
        <Text style={styles.username} numberOfLines={1}>
          {username}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginHorizontal: 6, width: 72 },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 64,
  },
});
