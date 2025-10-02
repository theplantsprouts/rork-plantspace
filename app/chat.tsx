import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, ArrowLeft, Paperclip, Image as ImageIcon, X, FileText } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { PlantTheme } from '@/constants/theme';
import { useMessages } from '@/hooks/use-chat';
import { auth, storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { ChatMessage } from '@/lib/firebase-chat';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    conversationId: string;
    userId: string;
    userName: string;
    userAvatar: string;
  }>();
  
  const { messages, loading, sendMessage, markAsRead } = useMessages(params.conversationId);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<{
    uri: string;
    name: string;
    size: number;
    type: 'image' | 'file';
    mimeType: string;
  } | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (params.conversationId) {
      markAsRead();
    }
  }, [params.conversationId, markAsRead]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedAttachment({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          type: 'image',
          mimeType: 'image/jpeg',
        });
        setShowAttachmentMenu(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const sizeInMB = (asset.size || 0) / (1024 * 1024);
        
        if (sizeInMB > 10) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB');
          return;
        }

        setSelectedAttachment({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          type: 'file',
          mimeType: asset.mimeType || 'application/octet-stream',
        });
        setShowAttachmentMenu(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleRemoveAttachment = () => {
    setSelectedAttachment(null);
  };

  const uploadAttachment = async (attachment: typeof selectedAttachment) => {
    if (!attachment) return null;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const fileExt = attachment.name.split('.').pop() || 'file';
      const fileName = `chat/${user.uid}/${Date.now()}.${fileExt}`;

      let blob;
      if (Platform.OS === 'web' && attachment.uri.startsWith('data:')) {
        const response = await fetch(attachment.uri);
        blob = await response.blob();
      } else {
        const response = await fetch(attachment.uri);
        blob = await response.blob();
      }

      const fileRef = storageRef(storage, fileName);
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if ((!messageText.trim() && !selectedAttachment) || !params.userId || sending) return;

    setSending(true);
    try {
      let attachmentData = null;

      if (selectedAttachment) {
        const uploadedUrl = await uploadAttachment(selectedAttachment);
        if (uploadedUrl) {
          attachmentData = {
            url: uploadedUrl,
            name: selectedAttachment.name,
            size: selectedAttachment.size,
            type: selectedAttachment.type,
            mimeType: selectedAttachment.mimeType,
          };
        }
      }

      await sendMessage(
        params.userId,
        messageText.trim() || (selectedAttachment?.type === 'image' ? 'Image' : selectedAttachment?.name || ''),
        attachmentData || undefined
      );
      
      setMessageText('');
      setSelectedAttachment(null);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };



  const handleOpenFile = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this file');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUser?.uid;
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          {item.type === 'image' && item.attachmentUrl && (
            <TouchableOpacity onPress={() => handleOpenFile(item.attachmentUrl!)}>
              <Image
                source={{ uri: item.attachmentUrl }}
                style={styles.messageImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          )}
          
          {item.type === 'file' && item.attachmentUrl && (
            <TouchableOpacity
              style={styles.fileAttachment}
              onPress={() => handleOpenFile(item.attachmentUrl!)}
            >
              <FileText size={24} color={isMe ? '#FFFFFF' : '#17cf17'} />
              <View style={styles.fileInfo}>
                <Text
                  style={[styles.fileName, isMe && styles.myMessageText]}
                  numberOfLines={1}
                >
                  {item.attachmentName}
                </Text>
                {item.attachmentSize && (
                  <Text style={[styles.fileSize, isMe && styles.myMessageTime]}>
                    {formatFileSize(item.attachmentSize)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          
          {item.text && item.text !== 'Image' && (
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>
              {item.text}
            </Text>
          )}
          
          <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd]}
        style={StyleSheet.absoluteFillObject}
      />

      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.headerButton, { marginTop: insets.top }]}
            >
              <ArrowLeft size={24} color="#000000" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={[styles.headerRight, { marginTop: insets.top }]}>
              <Image
                source={{ uri: params.userAvatar || 'https://via.placeholder.com/40' }}
                style={styles.headerAvatar}
              />
              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{params.userName}</Text>
              </View>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#17cf17" />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
            {selectedAttachment && (
              <View style={styles.attachmentPreview}>
                {selectedAttachment.type === 'image' ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: selectedAttachment.uri }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeAttachment}
                      onPress={handleRemoveAttachment}
                    >
                      <X size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.filePreviewContainer}>
                    <FileText size={24} color="#17cf17" />
                    <View style={styles.filePreviewInfo}>
                      <Text style={styles.filePreviewName} numberOfLines={1}>
                        {selectedAttachment.name}
                      </Text>
                      <Text style={styles.filePreviewSize}>
                        {formatFileSize(selectedAttachment.size)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeAttachmentFile}
                      onPress={handleRemoveAttachment}
                    >
                      <X size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {showAttachmentMenu && (
              <View style={styles.attachmentMenu}>
                <TouchableOpacity
                  style={styles.attachmentMenuItem}
                  onPress={handlePickImage}
                >
                  <ImageIcon size={24} color="#17cf17" />
                  <Text style={styles.attachmentMenuText}>Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.attachmentMenuItem}
                  onPress={handlePickDocument}
                >
                  <FileText size={24} color="#17cf17" />
                  <Text style={styles.attachmentMenuText}>Document</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <TouchableOpacity
                onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
                style={styles.attachButton}
              >
                <Paperclip size={22} color="#17cf17" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
              
              <TouchableOpacity
                onPress={handleSend}
                style={[
                  styles.sendButton,
                  ((!messageText.trim() && !selectedAttachment) || sending) && styles.sendButtonDisabled,
                ]}
                disabled={(!messageText.trim() && !selectedAttachment) || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  content: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#424842',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#17cf17',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  attachmentPreview: {
    marginBottom: 8,
  },
  imagePreviewContainer: {
    position: 'relative' as const,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  removeAttachment: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  filePreviewInfo: {
    flex: 1,
  },
  filePreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  filePreviewSize: {
    fontSize: 12,
    color: '#666666',
  },
  removeAttachmentFile: {
    padding: 4,
  },
  attachmentMenu: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    gap: 16,
  },
  attachmentMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(23, 207, 23, 0.1)',
    borderRadius: 12,
  },
  attachmentMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#17cf17',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#17cf17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
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
    gap: 12,
    paddingVertical: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
