import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Settings, Camera } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTabBar } from './_layout';
import { useAppContext } from '@/hooks/use-app-context';
import { usePosts } from '@/hooks/use-posts';




export default function ProfileScreen() {
  const { currentUser } = useAppContext();
  const { posts } = usePosts();
  const [activeTab, setActiveTab] = useState<'seeds' | 'gardeners' | 'tending'>('seeds');

  const { handleScroll } = useTabBar();
  
  const onScroll = useCallback((event: any) => {
    if (event?.nativeEvent?.contentOffset?.y !== undefined) {
      handleScroll(event);
      console.log('Profile screen scrolling:', event.nativeEvent.contentOffset.y);
    }
  }, [handleScroll]);

  const insets = useSafeAreaInsets();
  
  const userPosts = posts.filter(post => post.user.id === currentUser?.id);

  const handleEditBackgroundImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to change your background image.');
        return;
      }
    }

    if (Platform.OS === 'web') {
      Alert.alert(
        'Change Background Image',
        'Choose an option',
        [
          { text: 'Photo Library', onPress: openBackgroundImagePicker },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Change Background Image',
        'Choose an option',
        [
          { text: 'Camera', onPress: openBackgroundCamera },
          { text: 'Photo Library', onPress: openBackgroundImagePicker },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const openBackgroundCamera = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Camera is not supported on web. Please use photo library.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        console.log('New background image from camera:', result.assets[0].uri);
        
        const { uploadImage } = await import('@/lib/firebase');
        const imageUrl = await uploadImage(result.assets[0].uri, 'backgrounds');
        
        if (imageUrl && currentUser) {
          const { updateProfile } = await import('@/lib/firebase');
          await updateProfile(currentUser.id, { backgroundImage: imageUrl } as any);
          
          Alert.alert('Success', 'Background image updated successfully!');
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error processing background image:', error);
        Alert.alert('Error', 'Failed to update background image. Please try again.');
      }
    }
  };

  const openBackgroundImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        console.log('New background image from library:', result.assets[0].uri);
        
        const { uploadImage } = await import('@/lib/firebase');
        const imageUrl = await uploadImage(result.assets[0].uri, 'backgrounds');
        
        if (imageUrl && currentUser) {
          const { updateProfile } = await import('@/lib/firebase');
          await updateProfile(currentUser.id, { backgroundImage: imageUrl } as any);
          
          Alert.alert('Success', 'Background image updated successfully!');
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error processing background image:', error);
        Alert.alert('Error', 'Failed to update background image. Please try again.');
      }
    }
  };

  const handleEditProfilePicture = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to change your profile picture.');
        return;
      }
    }

    if (Platform.OS === 'web') {
      // On web, only show photo library option
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Photo Library', onPress: openImagePicker },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Camera', onPress: openCamera },
          { text: 'Photo Library', onPress: openImagePicker },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const openCamera = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Camera is not supported on web. Please use photo library.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        console.log('New profile picture from camera:', result.assets[0].uri);
        
        // Upload the image to Firebase Storage
        const { uploadImage } = await import('@/lib/firebase');
        const imageUrl = await uploadImage(result.assets[0].uri, 'avatars');
        
        if (imageUrl && currentUser) {
          // Update the user's profile with the new avatar URL
          const { updateProfile } = await import('@/lib/firebase');
          await updateProfile(currentUser.id, { avatar: imageUrl });
          
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error processing profile picture:', error);
        Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      }
    }
  };

  const openImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        console.log('New profile picture from library:', result.assets[0].uri);
        
        // Upload the image to Firebase Storage
        const { uploadImage } = await import('@/lib/firebase');
        const imageUrl = await uploadImage(result.assets[0].uri, 'avatars');
        
        if (imageUrl && currentUser) {
          // Update the user's profile with the new avatar URL
          const { updateProfile } = await import('@/lib/firebase');
          await updateProfile(currentUser.id, { avatar: imageUrl });
          
          Alert.alert('Success', 'Profile picture updated successfully!');
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error processing profile picture:', error);
        Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      }
    }
  };

  const handlePostPress = useCallback((post: any) => {
    if (post?.id) {
      console.log('Opening post:', post.id);
      router.push(`/post-detail?postId=${post.id}`);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#1a1c19" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => router.push('/saved-content')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.headerIconButton}
            >
              <Bookmark color="#1a1c19" size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.headerIconButton}
            >
              <Settings color="#1a1c19" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={true}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {/* Cover Image */}
          <TouchableOpacity 
            style={styles.coverImageContainer}
            onPress={handleEditBackgroundImage}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: (currentUser as any)?.backgroundImage || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=400&fit=crop' }} 
              style={styles.coverImage}
              cachePolicy="memory-disk"
              contentFit="cover"
            />
            <View style={styles.coverImageOverlay}>
              <View style={styles.cameraIconContainer}>
                <Camera color="#FFFFFF" size={24} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <TouchableOpacity 
              style={styles.profilePictureWrapper}
              onPress={handleEditProfilePicture}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop&crop=face' }} 
                style={styles.profilePicture}
                cachePolicy="memory-disk"
                contentFit="cover"
              />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name || 'Flora Green'}</Text>
            <Text style={styles.profileHandle}>@{currentUser?.username || 'floragreen'}</Text>
            <Text style={styles.profileBio}>
              {currentUser?.bio || 'Plant enthusiast | Nature lover'}
            </Text>
          </View>

          {/* Action Buttons - Only show for other users' profiles */}
          {/* For now, this is the current user's profile, so we don't show these buttons */}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Seeds</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser?.followers || 350}</Text>
              <Text style={styles.statLabel}>Garden Friends</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentUser?.following || 200}</Text>
              <Text style={styles.statLabel}>Tending</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'seeds' && styles.activeTab]}
              onPress={() => setActiveTab('seeds')}
            >
              <Text style={[styles.tabText, activeTab === 'seeds' && styles.activeTabText]}>Seeds</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'gardeners' && styles.activeTab]}
              onPress={() => setActiveTab('gardeners')}
            >
              <Text style={[styles.tabText, activeTab === 'gardeners' && styles.activeTabText]}>Garden Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'tending' && styles.activeTab]}
              onPress={() => setActiveTab('tending')}
            >
              <Text style={[styles.tabText, activeTab === 'tending' && styles.activeTabText]}>Tending</Text>
            </TouchableOpacity>
          </View>

          {/* Posts Grid */}
          {activeTab === 'seeds' && (
            <View style={styles.postsGrid}>
              {userPosts.length === 0 ? (
                <View style={styles.emptyPosts}>
                  <Text style={styles.emptyPostsText}>No seeds planted yet</Text>
                  <Text style={styles.emptyPostsSubtext}>Start sharing your plant journey!</Text>
                </View>
              ) : (
                userPosts.map((post) => (
                  <TouchableOpacity 
                    key={post.id} 
                    style={styles.postCard}
                    activeOpacity={0.8}
                    onPress={() => handlePostPress(post)}
                  >
                    {post.image ? (
                      <Image 
                        source={{ uri: post.image }} 
                        style={styles.postCardImage}
                        cachePolicy="memory-disk"
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.textPostCard}>
                        <Text style={styles.textPostContent} numberOfLines={4}>
                          {post.content}
                        </Text>
                      </View>
                    )}
                    <View style={styles.postCardContent}>
                      <Text style={styles.postCardTitle} numberOfLines={1}>
                        {post.content.substring(0, 30)}...
                      </Text>
                      <Text style={styles.postCardMeta}>
                        {post.likes} views · 2d
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {activeTab === 'gardeners' && (
            <View style={styles.emptyPosts}>
              <Text style={styles.emptyPostsText}>No garden friends yet</Text>
              <Text style={styles.emptyPostsSubtext}>Connect with other plant lovers!</Text>
            </View>
          )}

          {activeTab === 'tending' && (
            <View style={styles.emptyPosts}>
              <Text style={styles.emptyPostsText}>Not tending anyone yet</Text>
              <Text style={styles.emptyPostsSubtext}>Discover amazing plant enthusiasts!</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F6',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F8F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1c19',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  coverImageContainer: {
    height: 192,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  cameraIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: -64,
    marginBottom: 16,
  },
  profilePictureWrapper: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#F6F8F6',
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1c19',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 14,
    color: '#42493f',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: '#1a1c19',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1c19',
  },
  statLabel: {
    fontSize: 12,
    color: '#42493f',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#72796f',
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#17cf17',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#42493f',
  },
  activeTabText: {
    color: '#17cf17',
    fontWeight: 'bold',
  },
  postsGrid: {
    padding: 16,
    gap: 16,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  postCardImage: {
    width: '100%',
    height: 192,
  },
  textPostCard: {
    width: '100%',
    height: 192,
    backgroundColor: '#e2e3dd',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  textPostContent: {
    fontSize: 14,
    color: '#1a1c19',
    textAlign: 'center',
  },
  postCardContent: {
    padding: 16,
  },
  postCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1c19',
    marginBottom: 4,
  },
  postCardMeta: {
    fontSize: 12,
    color: 'rgba(42, 73, 63, 0.7)',
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyPostsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1c19',
    marginBottom: 8,
  },
  emptyPostsSubtext: {
    fontSize: 14,
    color: '#42493f',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});