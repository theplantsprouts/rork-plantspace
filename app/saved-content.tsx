import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';


interface SavedPost {
  id: string;
  content: string;
  image?: string;
  user: {
    name: string;
    username: string;
  };
  timestamp: string;
}

export default function SavedContentScreen() {
  const insets = useSafeAreaInsets();
  
  const [savedPosts] = useState<SavedPost[]>([
    {
      id: '1',
      content: 'My new monstera is finally sprouting a new leaf! So exciting.',
      image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop',
      user: { name: 'Flora Green', username: '@floragreen' },
      timestamp: '2d ago',
    },
    {
      id: '2',
      content: 'Can anyone help me identify this succulent?',
      image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400&h=300&fit=crop',
      user: { name: 'Ethan Woods', username: '@ethanwoods' },
      timestamp: '3d ago',
    },
    {
      id: '3',
      content: 'Just repotted my fiddle leaf fig. It was a struggle but I think it will be happier in its new home. Any tips for post-repotting care are welcome!',
      user: { name: 'Sophia Leaf', username: '@sophialeaf' },
      timestamp: '5d ago',
    },
    {
      id: '4',
      content: 'Morning dew on my calathea. Nature&apos;s art.',
      image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=300&fit=crop',
      user: { name: 'Noah Root', username: '@noahroot' },
      timestamp: '1w ago',
    },
    {
      id: '5',
      content: 'My cactus collection is growing! I&apos;m officially a spikey plant parent.',
      image: 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=300&fit=crop',
      user: { name: 'Olivia Rivers', username: '@oliviarivers' },
      timestamp: '1w ago',
    },
  ]);

  const handleRemoveBookmark = (postId: string) => {
    console.log('Removing bookmark for post:', postId);
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

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.postsGrid}>
            {savedPosts.map((post, index) => renderSavedPost(post, index))}
          </View>

          <View style={styles.endMessage}>
            <Bookmark size={48} color="rgba(23, 207, 23, 0.3)" />
            <Text style={styles.endMessageText}>
              You&apos;ve reached the end of your saved sprouts.
            </Text>
          </View>
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
