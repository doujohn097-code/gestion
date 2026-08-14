import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|ayj[azf6fQfQfQIpWXofj[ayj[j[fRayay#fQf6ayfQfQfQfQfQfQayV@ayayj[fRayj[ay~ofaytRayfQfQM{M|ayj[azf6fQfQfQIpWXofj[ayj[j[fRayay#fQf6ayfQfQfQfQfQfQayV@ayayj[fRayj[ay~o';

export default function Avatar({
  uri,
  size = 32,
  style,
}: {
  uri?: string | null;
  size?: number;
  style?: any;
}) {
  const source = uri ? { uri } : require('../assets/images/default_profile.png');
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        placeholder={blurhash}
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#262626',
  },
});
