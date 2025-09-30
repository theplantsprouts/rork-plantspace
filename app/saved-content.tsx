import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { getBookmarkedPosts, toggleBookmark } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

interface SavedPost {
  id: string;
  content: string;
  image?: string;
  author?: {
    name?: string;
    username?: string;
  };
  created_at: string;
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export default function SavedContentScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarkedPosts();
  }, [user]);

  const loadBookmarkedPosts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const posts = await getBookmarkedPosts(user.id);
      setSavedPosts(posts as SavedPost[]);
    } catch (error) {
      console.error('Error loading bookmarked posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId: string) => {
    if (!user?.id) return;

    try {
      await toggleBookmark(user.id, postId);
      setSavedPosts(prev => prev.filter(post => post.id !== postId));
      console.log('Bookmark removed for post:', postId);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handlePostPress = (postId: string) => {
    console.log('Opening saved post:', postId);
    router.push(`/post-detail?postId=${postId}`);
  };

  const renderSavedPost = (post: SavedPost, index: number) => {
    const isTextOnly = !post.image;
    const isFullWidth = isTextOnly;

    return (
      <TouchableOpacity
        key={post.id}
        style={[
          styles.postCard,
          isFullWidth && styles.postCardFullWidth,
        ]}
        activeOpacity={0.8}
        onPress={() => handlePostPress(post.id)}
      >
        {post.image && (
          <Image
            source={{ uri: post.image }}
            style={styles.postImage}
            cachePolicy="memory-disk"
            contentFit="cover"
          />
        )}
        <View style={styles.postContent}>
          <Text style={styles.postText} numberOfLines={isTextOnly ? 4 : 2}>
            {post.content}
          </Text>
          <View style={styles.postFooter}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveBookmark(post.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Bookmark
                size={20}
                color="#72796f"
                fill="#72796f"
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft color="#1a1c19" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Sprouts</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#17cf17" />
            <Text style={styles.loadingText}>Loading harvested seeds...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {savedPosts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Bookmark size={64} color="rgba(23, 207, 23, 0.3)" />
                <Text style={styles.emptyTitle}>No harvested seeds yet</Text>
                <Text style={styles.emptySubtitle}>
                  Tap the bookmark icon on any seed to save it here
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.postsGrid}>
                  {savedPosts.map((post, index) => renderSavedPost(post, index))}
                </View>

                <View style={styles.endMessage}>
                  <Bookmark size={48} color="rgba(23, 207, 23, 0.3)" />
                  <Text style={styles.endMessageText}>
                    You&apos;ve reached the end of your harvested seeds.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        )}
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
    backgroundColor: 'rgba(246, 248, 246, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1c19',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#72796f',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1c19',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 12,
    fontSize: 14,
    color: '#72796f',
    textAlign: 'center',
    lineHeight: 20,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  postsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  postCard: {
    width: '47%',
    backgroundColor: 'rgba(23, 207, 23, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  postCardFullWidth: {
    width: '100%',
  },
  postImage: {
    width: '100%',
    height: 128,
  },
  postContent: {
    padding: 12,
  },
  postText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1c19',
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  removeButton: {
    padding: 4,
  },
  endMessage: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  endMessageText: {
    marginTop: 16,
    fontSize: 14,
    color: '#72796f',
    textAlign: 'center',
  },
});
