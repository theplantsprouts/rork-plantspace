import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Send, Paperclip, Image as ImageIcon, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { trpc } from '@/lib/trpc';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

type Message = {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  read: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  attachmentName?: string;
};

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    userName: string;
    userAvatar: string;
  }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const markAsReadMutation = trpc.chat.markAsRead.useMutation();

  const backgroundColor = isDark ? '#112111' : '#f6f8f6';
  const textColor = '#000000';
  const secondaryTextColor = '#424842';
  const primaryColor = '#17cf17';
  const messageBubbleSent = primaryColor;
  const messageBubbleReceived = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  useEffect(() => {
    if (!user?.id || !params.userId) return;

    const chatId = [user.id, params.userId].sort().join('_');
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(newMessages);
      setIsLoading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    if (params.userId) {
      markAsReadMutation.mutate({ otherUserId: params.userId });
    }

    return () => unsubscribe();
  }, [user?.id, params.userId, markAsReadMutation]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const messageText = message.trim();
    setMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        recipientId: params.userId,
        content: messageText,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        await sendMessageMutation.mutateAsync({
          recipientId: params.userId,
          attachmentUri: result.assets[0].uri,
          attachmentType: 'image',
          attachmentName: 'image.jpg',
        });
      } catch (error) {
        console.error('Failed to send image:', error);
        Alert.alert('Error', 'Failed to send image');
      }
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await sendMessageMutation.mutateAsync({
          recipientId: params.userId,
          attachmentUri: result.assets[0].uri,
          attachmentType: 'file',
          attachmentName: result.assets[0].name,
        });
      }
    } catch (error) {
      console.error('Failed to send file:', error);
      Alert.alert('Error', 'Failed to send file');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSent = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isSent ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        {!isSent && (
          <Image
            source={{ uri: params.userAvatar || 'https://via.placeholder.com/32' }}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isSent ? messageBubbleSent : messageBubbleReceived,
            },
          ]}
        >
          {item.attachmentUrl && item.attachmentType === 'image' && (
            <Image
              source={{ uri: item.attachmentUrl }}
              style={styles.messageImage}
            />
          )}
          {item.attachmentUrl && item.attachmentType === 'file' && (
            <View style={styles.fileAttachment}>
              <Paperclip size={16} color={isSent ? '#ffffff' : textColor} />
              <Text
                style={[
                  styles.fileName,
                  { color: isSent ? '#ffffff' : textColor },
                ]}
                numberOfLines={1}
              >
                {item.attachmentName}
              </Text>
            </View>
          )}
          {item.content && (
            <Text
              style={[
                styles.messageText,
                { color: isSent ? '#ffffff' : textColor },
              ]}
            >
              {item.content}
            </Text>
          )}
          <Text
            style={[
              styles.messageTime,
              { color: isSent ? 'rgba(255, 255, 255, 0.7)' : secondaryTextColor },
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeft}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={textColor} />
              <Image
                source={{ uri: params.userAvatar || 'https://via.placeholder.com/32' }}
                style={styles.headerAvatar}
              />
              <Text style={[styles.headerTitle, { color: textColor }]}>
                {params.userName}
              </Text>
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor,
          },
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: insets.bottom + 80 },
            ]}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <View
          style={[
            styles.inputContainer,
            { backgroundColor, paddingBottom: insets.bottom + 8 },
          ]}
        >
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleImagePick}
          >
            <ImageIcon size={24} color={primaryColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleFilePick}
          >
            <Paperclip size={24} color={primaryColor} />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.05)',
                color: textColor,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={secondaryTextColor}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: message.trim() ? primaryColor : 'transparent',
              },
            ]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send
              size={20}
              color={message.trim() ? '#ffffff' : secondaryTextColor}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
