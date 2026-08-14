import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '@/components/Avatar';
import { AuroraBackground } from '@/components/AuroraBackground';
import Colors from '@/constants/Colors';

const CONTACTS: Record<string, any> = {
  u2: { username: 'mehdi.tuff', full_name: 'Mehdi Tuff', profile_picture_url: 'https://i.pravatar.cc/150?u=u2' },
  u3: { username: 'ilyas_parisien_111', full_name: 'Ilyas Parisien', profile_picture_url: 'https://i.pravatar.cc/150?u=u3' },
  u4: { username: 'sara.style', full_name: 'Sara Style', profile_picture_url: 'https://i.pravatar.cc/150?u=u4' },
  u5: { username: 'khalid.tech', full_name: 'Khalid Tech', profile_picture_url: 'https://i.pravatar.cc/150?u=u5' },
};

const INITIAL_MESSAGES: Record<string, any[]> = {
  u2: [
    { id: '1', text: 'مرحبا، كيف حالك؟', sender: 'them', time: '10:20' },
    { id: '2', text: 'أنا بخير، شكرًا! وأنت؟', sender: 'me', time: '10:21' },
  ],
  u3: [
    { id: '1', text: 'أرسلت لك ملف pdf', sender: 'them', time: 'أمس' },
  ],
  u4: [
    { id: '1', text: 'شكرًا جزيلاً!', sender: 'them', time: '12:05' },
    { id: '2', text: 'العفو 😊', sender: 'me', time: '12:06' },
  ],
  u5: [
    { id: '1', text: 'تمام، نلتقي غدًا', sender: 'them', time: '08:15' },
  ],
};

function ChatBubble({ item, contact }: { item: any; contact: any }) {
  const isMe = item.sender === 'me';
  return (
    <View style={[styles.row, isMe ? styles.sent : styles.received]}>
      {isMe ? null : (
        <>
          <View style={[styles.bubble, styles.bubbleThem]}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.chatImage} /> : null}
            <Text style={styles.text}>{item.text}</Text>
            <Text style={[styles.time, styles.timeThem]}>{item.time}</Text>
          </View>
          <Avatar uri={contact.profile_picture_url} size={30} style={styles.avatar} />
        </>
      )}
      {isMe ? (
        <View style={[styles.bubble, styles.bubbleMe]}>
          {item.image ? <Image source={{ uri: item.image }} style={styles.chatImage} /> : null}
          <Text style={styles.text}>{item.text}</Text>
          <Text style={[styles.time, styles.timeMe]}>{item.time}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function ChatScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<any[]>(() =>
    [...(INITIAL_MESSAGES[userId] || [])].reverse()
  );
  const listRef = useRef<FlatList>(null);

  const contact = CONTACTS[userId] || { username: 'مستخدم', profile_picture_url: null };

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 200);
  }, []);

  const send = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMessage = { id: String(Date.now()), text: trimmed, sender: 'me', time };
    setMessages((prev) => [newMessage, ...prev]);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [text]);

  return (
    <AuroraBackground style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={styles.topbar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.titleGroup}>
            <Avatar uri={contact.profile_picture_url} size={36} />
            <Text style={styles.name}>{contact.username}</Text>
          </View>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="call" size={20} color="#fff" />
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble item={item} contact={contact} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.4, 1]}
          style={styles.inputFade}
        />

        <View style={[styles.inputWrap, { marginBottom: insets.bottom + 12 }]}>
          <View style={styles.inputbar}>
            <Pressable style={styles.imgBtn}>
              <Ionicons name="image-outline" size={22} color="#fff" />
            </Pressable>
            <TextInput
              style={styles.chatInput}
              placeholder="ابعث رسالة..."
              placeholderTextColor={Colors.dark.secondaryText}
              value={text}
              onChangeText={setText}
              textAlign="right"
              multiline
              maxLength={1000}
            />
            <Pressable style={[styles.sendBtn, !text.trim() && styles.sendDisabled]} onPress={send} disabled={!text.trim()}>
              <Ionicons name="send" size={20} color="#000" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 90,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
    maxWidth: '85%',
  },
  sent: {
    alignSelf: 'flex-start',
  },
  received: {
    alignSelf: 'flex-end',
  },
  avatar: {
    marginHorizontal: 6,
  },
  bubble: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bubbleMe: {
    backgroundColor: 'rgba(33,197,94,0.22)',
    borderTopRightRadius: 6,
    borderColor: 'rgba(33,197,94,0.35)',
  },
  bubbleThem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
    textAlign: 'right',
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 6,
  },
  time: {
    fontSize: 10,
    marginTop: 6,
    color: 'rgba(255,255,255,0.7)',
  },
  timeMe: {
    textAlign: 'left',
  },
  timeThem: {
    textAlign: 'right',
  },
  inputFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    pointerEvents: 'none',
  },
  inputWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.82)',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  imgBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  chatInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxHeight: 120,
    textAlign: 'right',
    minHeight: 28,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
