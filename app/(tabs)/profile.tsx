import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Edit3, MapPin, Calendar, Link, TreePine, Leaf, Sun, Bug, Camera, Plus } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTabBar } from './_layout';
import { useAppContext } from '@/hooks/use-app-context';
import { usePosts } from '@/hooks/use-posts';
import { PlantTheme, PlantTerminology } from '@/constants/theme';
import { GlassCard } from '@/components/GlassContainer';



export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const { currentUser } = useAppContext();
  const { posts } = usePosts();

  // Enable scroll handling for tab bar animation
  const { handleScroll } = useTabBar();
  
  const onScroll = useCallback((event: any) => {
    if (event?.nativeEvent?.contentOffset?.y !== undefined) {
      handleScroll(event);
      console.log('Profile screen scrolling:', event.nativeEvent.contentOffset.y);
    }
  }, [handleScroll]);

  const insets = useSafeAreaInsets();
  
  const userPosts = posts.filter(post => post.user.id === currentUser?.id);
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);

  const handleEditProfilePicture = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to change your profile picture.');
        return;
      }
    }

    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openImagePicker },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
        // Here you would upload the image and update the user profile
        console.log('New profile picture:', result.assets[0].uri);
        
        // TODO: Implement actual profile picture upload to Firebase
        // const imageUrl = await uploadImage(result.assets[0].uri, 'profile-pictures');
        // await updateUserProfile({ avatar: imageUrl });
        
        Alert.alert('Success', 'Profile picture will be updated soon!');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
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
        // Here you would upload the image and update the user profile
        console.log('New profile picture:', result.assets[0].uri);
        
        // TODO: Implement actual profile picture upload to Firebase
        // const imageUrl = await uploadImage(result.assets[0].uri, 'profile-pictures');
        // await updateUserProfile({ avatar: imageUrl });
        
        Alert.alert('Success', 'Profile picture will be updated soon!');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      }
    }
  };

  const handleEditProfile = () => {
    router.push('/profile-setup');
  };

  const handleShareProfile = () => {
    Alert.alert('Share Profile', 'Profile sharing functionality coming soon!');
  };

  const handlePostPress = useCallback((post: any) => {
    // Navigate to post detail view
    if (post?.id) {
      console.log('Opening post:', post.id);
      router.push(`/post-detail?postId=${post.id}`);
    }
  }, []);

  const handleAddStory = () => {
    Alert.alert(
      'Add Story',
      'What would you like to share?',
      [
        { text: 'Text Story', onPress: () => handleCreateStory('text') },
        { text: 'Photo Story', onPress: () => handleCreateStory('photo') },
        { text: 'Both', onPress: () => handleCreateStory('both') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCreateStory = async (type: 'text' | 'photo' | 'both') => {
    if (type === 'photo' || type === 'both') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need photo permissions to add images to your story.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Story image:', result.assets[0].uri);
      }
    }

    // Here you would implement story creation logic
    Alert.alert('Story Created', 'Your story will disappear in 24 hours!');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PlantTheme.colors.backgroundStart, PlantTheme.colors.backgroundEnd, PlantTheme.colors.primaryLight]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌲 {PlantTerminology.profile}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => {
                router.push('/debug');
              }}
            >
              <Bug color={PlantTheme.colors.textSecondary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Settings color={PlantTheme.colors.textPrimary} size={24} />
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
          <GlassCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Image 
                source={{ uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&h=200&fit=crop&crop=face' }} 
                style={styles.profileImage}
                cachePolicy="memory-disk"
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity 
                style={styles.editButton} 
                activeOpacity={0.7}
                onPress={handleEditProfilePicture}
              >
                <Camera color={PlantTheme.colors.white} size={16} />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{currentUser?.name || 'Garden Enthusiast'}</Text>
            <Text style={styles.profileHandle}>{currentUser?.username || '@gardener'}</Text>
            
            <Text style={styles.profileBio}>
              {currentUser?.bio || 'Passionate about sustainable farming and environmental conservation 🌱 Growing a better future one seed at a time 🌍'}
            </Text>

            <View style={styles.profileInfo}>
              <View style={styles.infoItem}>
                <MapPin color={PlantTheme.colors.textSecondary} size={16} />
                <Text style={styles.infoText}>Earth 🌍</Text>
              </View>
              <View style={styles.infoItem}>
                <Calendar color={PlantTheme.colors.textSecondary} size={16} />
                <Text style={styles.infoText}>Joined {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Link color={PlantTheme.colors.textSecondary} size={16} />
                <Text style={styles.infoText}>Growing sustainably</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Sun color={PlantTheme.colors.accent} size={20} />
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Seeds</Text>
              </View>
              <View style={styles.statItem}>
                <TreePine color={PlantTheme.colors.primary} size={20} />
                <Text style={styles.statNumber}>{currentUser?.followers || 0}</Text>
                <Text style={styles.statLabel}>Garden Friends</Text>
              </View>
              <View style={styles.statItem}>
                <Leaf color={PlantTheme.colors.secondary} size={20} />
                <Text style={styles.statNumber}>{currentUser?.following || 0}</Text>
                <Text style={styles.statLabel}>Tending</Text>
              </View>
              <View style={styles.statItem}>
                <Sun color={PlantTheme.colors.accent} size={20} />
                <Text style={styles.statNumber}>{totalLikes}</Text>
                <Text style={styles.statLabel}>Sunshine</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editProfileButton} 
                activeOpacity={0.8}
                onPress={handleEditProfile}
              >
                <Edit3 color={PlantTheme.colors.white} size={16} style={styles.editIcon} />
                <Text style={styles.editProfileText}>Tend Garden</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.shareButton} 
                activeOpacity={0.8}
                onPress={handleShareProfile}
              >
                <Text style={styles.shareButtonText}>Spread Seeds</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Story Section */}
          <GlassCard style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <Text style={styles.sectionTitle}>📖 My Story</Text>
              <TouchableOpacity 
                style={styles.addStoryButton}
                onPress={handleAddStory}
                activeOpacity={0.7}
              >
                <Plus color={PlantTheme.colors.primary} size={20} />
                <Text style={styles.addStoryText}>Add Story</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.storyDescription}>
              Share your daily garden moments that disappear in 24 hours
            </Text>
          </GlassCard>

          <View style={styles.postsSection}>
            <Text style={styles.sectionTitle}>🌱 Your Seeds ({userPosts.length})</Text>
            {userPosts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <Text style={styles.emptyPostsText}>No seeds planted yet</Text>
                <Text style={styles.emptyPostsSubtext}>Plant your first seed to start growing!</Text>
              </View>
            ) : (
              <View style={styles.postsGrid}>
                {userPosts.slice(0, 9).map((post) => (
                  <TouchableOpacity 
                    key={post.id} 
                    style={[styles.postItem, { width: (width - 50) / 3, height: (width - 50) / 3 }]}
                    activeOpacity={0.8}
                    onPress={() => handlePostPress(post)}
                  >
                    {post.image ? (
                      <Image 
                        source={{ uri: post.image }} 
                        style={styles.postImage}
                        cachePolicy="memory-disk"
                        contentFit="cover"
                        transition={100}
                      />
                    ) : (
                      <View style={styles.textPost}>
                        <Text style={styles.textPostContent} numberOfLines={4}>
                          {post.content}
                        </Text>
                      </View>
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.postOverlay}
                    >
                      <Text style={styles.postLikes}>{post.likes}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PlantTheme.colors.textDark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  debugButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 25,
    backgroundColor: PlantTheme.colors.cardBackground,
    ...(Platform.OS === 'android' && {
      elevation: 3,
      shadowColor: 'transparent',
    }),
  },

  profileHeader: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: PlantTheme.colors.primary,
  },
  editButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: PlantTheme.colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...PlantTheme.shadows.sm,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 5,
  },
  profileHandle: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    marginBottom: 15,
  },
  profileBio: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  profileInfo: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    marginBottom: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: PlantTheme.colors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  editProfileButton: {
    backgroundColor: PlantTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: PlantTheme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...PlantTheme.shadows.sm,
    ...(Platform.OS === 'android' && {
      elevation: 2,
      shadowColor: 'transparent',
    }),
  },
  editProfileText: {
    color: PlantTheme.colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: PlantTheme.colors.cardBackground,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: PlantTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
  },
  shareButtonText: {
    color: PlantTheme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  postsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 15,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  postItem: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 5,
  },
  postLikes: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyPostsText: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyPostsSubtext: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  textPost: {
    backgroundColor: PlantTheme.colors.cardBackground,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: PlantTheme.colors.cardBorder,
  },
  textPostContent: {
    color: PlantTheme.colors.textPrimary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  storyCard: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: PlantTheme.colors.cardBackground,
    ...(Platform.OS === 'android' && {
      elevation: 2,
      shadowColor: 'transparent',
    }),
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addStoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: PlantTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: PlantTheme.colors.primary,
  },
  addStoryText: {
    color: PlantTheme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  storyDescription: {
    color: PlantTheme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  editIcon: {
    marginRight: 8,
  },
});