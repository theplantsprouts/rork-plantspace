import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, ImagePlus, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { PlantTheme } from '@/constants/theme';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { subscribeToMessages, Message as FirebaseMessage } from '@/lib/firebase';

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  createdAt: string;
  read: boolean;
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ userId: string; name: string }>();
  const { user } = useAuth();
  
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  
  useEffect(() => {
    if (!params.userId || !user?.id) return;
    
    setIsLoadingMessages(true);
    const unsubscribe = subscribeToMessages(
      user.id,
      params.userId,
      (fetchedMessages) => {
        setMessages(fetchedMessages as Message[]);
        setIsLoadingMessages(false);
      },
      (error) => {
        console.error('Error loading messages:', error);
        setIsLoadingMessages(false);
      }
    );
    
    return () => unsubscribe();
  }, [params.userId, user?.id]);

  const uploadImageMutation = trpc.posts.uploadImage.useMutation();

  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText('');
      setSelectedImage(null);
      setSelectedImageBase64(null);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
  });

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(result.assets[0].uri);
        setSelectedImageBase64(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleSend = async () => {
    if ((!messageText.trim() && !selectedImage) || !params.userId) return;

    try {
      let imageUrl: string | undefined;

      if (selectedImage && selectedImageBase64) {
        setIsUploadingImage(true);
        const uploadResult = await uploadImageMutation.mutateAsync({
          base64: selectedImageBase64,
          filename: `message_${Date.now()}.jpg`,
        });

        imageUrl = uploadResult.imageUrl;
        setIsUploadingImage(false);
      }

      sendMessageMutation.mutate({
        receiverId: params.userId,
        text: messageText.trim() || undefined,
        imageUrl,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsUploadingImage(false);
    }
  };



  const backgroundColor = isDark ? '#112111' : '#f6f8f6';
  const textColor = '#000000';
  const secondaryTextColor = '#424842';
  const containerBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const inputBg = isDark ? 'rgba(23, 207, 23, 0.2)' : 'rgba(23, 207, 23, 0.1)';
  const primaryColor = '#17cf17';
  const myMessageBg = primaryColor;
  const theirMessageBg = containerBg;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <LinearGradient
          colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {params.name || 'Chat'}
          </Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {isLoadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>👋</Text>
              <Text style={[styles.emptyStateTitle, { color: textColor }]}>
                Start the conversation
              </Text>
              <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                Send a message to {params.name}
              </Text>
            </View>
          ) : (
            messages.map((message, index) => {
              const isMyMessage = message.senderId === user?.id;
              const showDate =
                index === 0 ||
                !isSameDay(
                  new Date(message.createdAt),
                  new Date(messages[index - 1].createdAt)
                );

              return (
                <View key={message.id}>
                  {showDate && (
                    <View style={styles.dateContainer}>
                      <Text style={[styles.dateText, { color: secondaryTextColor }]}>
                        {formatDate(message.createdAt)}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageContainer,
                      isMyMessage ? styles.myMessage : styles.theirMessage,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        {
                          backgroundColor: isMyMessage ? myMessageBg : theirMessageBg,
                        },
                      ]}
                    >
                      {message.imageUrl && (
                        <Image
                          source={{ uri: message.imageUrl }}
                          style={styles.messageImage}
                        />
                      )}
                      {message.text && (
                        <Text
                          style={[
                            styles.messageText,
                            { color: isMyMessage ? '#fff' : textColor },
                          ]}
                        >
                          {message.text}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.messageTime,
                          { color: isMyMessage ? 'rgba(255,255,255,0.7)' : secondaryTextColor },
                        ]}
                      >
                        {formatTime(message.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8, backgroundColor: inputBg }]}>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              {isUploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setSelectedImage(null);
                  setSelectedImageBase64(null);
                }}
                disabled={isUploadingImage}
              >
                <X size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handlePickImage}
              disabled={isUploadingImage || sendMessageMutation.isPending}
            >
              <ImagePlus size={24} color={primaryColor} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Type a message..."
              placeholderTextColor={secondaryTextColor}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: (messageText.trim() || selectedImage) ? primaryColor : containerBg },
              ]}
              onPress={handleSend}
              disabled={(!messageText.trim() && !selectedImage) || sendMessageMutation.isPending || isUploadingImage}
            >
              {sendMessageMutation.isPending || isUploadingImage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send
                  size={20}
                  color={(messageText.trim() || selectedImage) ? '#fff' : secondaryTextColor}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  imageButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
