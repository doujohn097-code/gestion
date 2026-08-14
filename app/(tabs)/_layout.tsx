import { Tabs, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/Avatar';
import Colors from '@/constants/Colors';

function ProfileTabIcon({ focused }: { focused: boolean }) {
  const { user } = useAuth();
  return (
    <View style={[styles.profileTab, focused && styles.profileTabActive]}>
      <Avatar uri={user?.profile_picture_url} size={24} />
    </View>
  );
}

function HeaderRight() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push('/profile/edit')} style={{ marginHorizontal: 12 }}>
      <Ionicons name="create-outline" size={24} color="#fff" />
    </Pressable>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.dark.accent,
        tabBarInactiveTintColor: Colors.dark.secondaryText,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 12 + insets.bottom,
          left: 24,
          right: 24,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(0,0,0,0.55)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(33,197,94,0.18)',
          elevation: 0,
          shadowColor: Colors.dark.accent,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          flexDirection: Platform.OS === 'web' ? 'row-reverse' : 'row',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person-add' : 'person-add-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'الملف الشخصي',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          headerRight: () => <HeaderRight />,
          tabBarIcon: ({ focused }) => <ProfileTabIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  profileTab: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 1,
  },
  profileTabActive: {
    borderColor: Colors.dark.accent,
  },
});
