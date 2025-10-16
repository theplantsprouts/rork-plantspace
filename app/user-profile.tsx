import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/hooks/use-posts';
import { useTheme } from '@/hooks/use-theme';
import { getProfile, type Profile } from '@/lib/firebase';
import { PlantTheme } from '@/constants/theme';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { posts } = usePosts();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'seeds' | 'gardeners' | 'tending'>('seeds');
  const [profileUser, setProfileUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const profile = await getProfile(userId);
        setProfileUser(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);
  
  const userPosts = posts.filter(post => post.user.id === userId);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handlePostPress = useCallback((post: any) => {
    if (post?.id) {
      console.log('Opening post:', post.id);
      router.push(`/post-detail?postId=${post.id}`);
    }
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft color={colors.onSurface} size={24} />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PlantTheme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: '',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft color={colors.onSurface} size={24} />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.onSurface }]}>
            User not found
          </Text>
        </View>
      </View>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: profileUser.name || 'Profile',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color={colors.onSurface} size={24} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.onSurface,
        }}
      />
      <View style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          removeClippedSubviews={true}
        >
          {/* Cover Image */}
          <View style={styles.coverImageContainer}>
            <Image 
              source={{ uri: (profileUser as any)?.backgroundImage || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=400&fit=crop' }} 
              style={styles.coverImage}
              cachePolicy="memory-disk"
              contentFit="cover"
            />
          </View>

          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePictureWrapper}>
              <Image 
                source={{ uri: profileUser.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=default&backgroundColor=c0aede' }} 
                style={styles.profilePicture}
                cachePolicy="memory-disk"
                contentFit="cover"
              />
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.onSurface }]}>{profileUser.name || 'User'}</Text>
            <Text style={[styles.profileHandle, { color: colors.onSurfaceVariant }]}>@{profileUser.username || 'username'}</Text>
            <Text style={[styles.profileBio, { color: colors.onSurface }]}>
              {profileUser.bio || 'Welcome to my profile!'}
            </Text>
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[
                  styles.followButton,
                  { 
                    backgroundColor: isFollowing ? colors.surfaceVariant : colors.primary,
                    borderColor: isFollowing ? colors.outline : colors.primary,
                  }
                ]}
                onPress={handleFollowToggle}
                activeOpacity={0.8}
              >
                {isFollowing ? (
                  <>
                    <UserMinus size={18} color={colors.onSurface} />
                    <Text style={[styles.followButtonText, { color: colors.onSurface }]}>Tending</Text>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} color={colors.white} />
                    <Text style={[styles.followButtonText, { color: colors.white }]}>Tend</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>{userPosts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Seeds</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>{profileUser.followers || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Garden Friends</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.onSurface }]}>{profileUser.following || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Tending</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={[styles.tabsContainer, { borderBottomColor: colors.outline }]}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'seeds' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
              onPress={() => setActiveTab('seeds')}
            >
              <Text style={[styles.tabText, { color: colors.onSurfaceVariant }, activeTab === 'seeds' && { color: colors.primary, fontWeight: '700' as const }]}>Seeds</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'gardeners' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
              onPress={() => setActiveTab('gardeners')}
            >
              <Text style={[styles.tabText, { color: colors.onSurfaceVariant }, activeTab === 'gardeners' && { color: colors.primary, fontWeight: '700' as const }]}>Garden Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'tending' && [styles.activeTab, { borderBottomColor: colors.primary }]]}
              onPress={() => setActiveTab('tending')}
            >
              <Text style={[styles.tabText, { color: colors.onSurfaceVariant }, activeTab === 'tending' && { color: colors.primary, fontWeight: '700' as const }]}>Tending</Text>
            </TouchableOpacity>
          </View>

          {/* Posts Grid */}
          {activeTab === 'seeds' && (
            <View style={styles.postsGrid}>
              {userPosts.length === 0 ? (
                <View style={styles.emptyPosts}>
                  <Text style={[styles.emptyPostsText, { color: colors.onSurface }]}>No seeds planted yet</Text>
                  <Text style={[styles.emptyPostsSubtext, { color: colors.onSurfaceVariant }]}>
                    {isOwnProfile ? 'Start sharing your plant journey!' : 'No posts yet'}
                  </Text>
                </View>
              ) : (
                userPosts.map((post) => (
                  <TouchableOpacity 
                    key={post.id} 
                    style={[styles.postCard, { backgroundColor: colors.surface }]}
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
                      <View style={[styles.textPostCard, { backgroundColor: colors.surfaceVariant }]}>
                        <Text style={[styles.textPostContent, { color: colors.onSurface }]} numberOfLines={4}>
                          {post.content}
                        </Text>
                      </View>
                    )}
                    <View style={styles.postCardContent}>
                      <Text style={[styles.postCardTitle, { color: colors.onSurface }]} numberOfLines={1}>
                        {post.content.substring(0, 30)}...
                      </Text>
                      <Text style={[styles.postCardMeta, { color: colors.onSurfaceVariant }]}>
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
              <Text style={[styles.emptyPostsText, { color: colors.onSurface }]}>No garden friends yet</Text>
              <Text style={[styles.emptyPostsSubtext, { color: colors.onSurfaceVariant }]}>Connect with other plant lovers!</Text>
            </View>
          )}

          {activeTab === 'tending' && (
            <View style={styles.emptyPosts}>
              <Text style={[styles.emptyPostsText, { color: colors.onSurface }]}>Not tending anyone yet</Text>
              <Text style={[styles.emptyPostsSubtext, { color: colors.onSurfaceVariant }]}>Discover amazing plant enthusiasts!</Text>
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
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
  },
  coverImageContainer: {
    height: 192,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
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
    borderColor: PlantTheme.colors.white,
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
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: PlantTheme.borderRadius.full,
    gap: 8,
    borderWidth: 1,
    ...PlantTheme.shadows.sm,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
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
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  postsGrid: {
    padding: 16,
    gap: 16,
  },
  postCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  textPostContent: {
    fontSize: 14,
    textAlign: 'center',
  },
  postCardContent: {
    padding: 16,
  },
  postCardTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  postCardMeta: {
    fontSize: 12,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyPostsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  emptyPostsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
