import Ionicons from '@expo/vector-icons/Ionicons';

const iconMap: Record<string, { default: string; active?: string; activeColor?: string }> = {
  home: { default: 'home-outline', active: 'home' },
  search: { default: 'search-outline', active: 'search' },
  play: { default: 'play-circle-outline', active: 'play-circle' },
  send: { default: 'paper-plane-outline', active: 'paper-plane' },
  heart: { default: 'heart-outline', active: 'heart', activeColor: '#ED4956' },
  heart_filled: { default: 'heart', active: 'heart', activeColor: '#ED4956' },
  plus: { default: 'add-outline', active: 'add' },
  chat: { default: 'chatbubble-outline', active: 'chatbubble' },
  bookmark: { default: 'bookmark-outline', active: 'bookmark' },
};

export default function TabIcon({
  name,
  focused,
  size = 28,
  color,
}: {
  name: string;
  focused?: boolean;
  size?: number;
  color?: string;
}) {
  const mapping = iconMap[name] || { default: 'home-outline', active: 'home' };
  const iconName = focused ? mapping.active || mapping.default : mapping.default;
  const iconColor =
    color || (focused && mapping.activeColor ? mapping.activeColor : focused ? '#fff' : '#A8A8A9');
  return <Ionicons name={iconName} size={size} color={iconColor} />;
}
