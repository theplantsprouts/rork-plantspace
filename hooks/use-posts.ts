import { useState, useEffect } from 'react';
import { useAIContent } from './use-ai-content';
import { useAuth } from './use-auth';
import { useRealTimePosts } from './use-realtime';
import { createPost, uploadImage, Post as FirebasePost, toggleBookmark, subscribeToBookmarks, toggleLike as firebaseToggleLike, isPostLiked, addComment as firebaseAddComment, toggleShare as firebaseToggleShare } from '@/lib/firebase';
import { trackPostCreated, trackPostViewed, trackPostLiked, trackPostShared } from '@/lib/analytics';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isShared?: boolean;
  isBookmarked?: boolean;
  postComments?: Comment[];
  aiScore?: number;
  isAgricultureRelated?: boolean;
  moderationStatus?: 'approved' | 'pending' | 'rejected';
  aiTags?: string[];
  recommendationScore?: number;
}



// Helper function to format timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

// Mock data removed - now using only real-time data from Firebase

export function usePosts() {
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const { getRecommendations, getContentInsights } = useAIContent();
  const { user } = useAuth();
  
  // Use real-time posts hook
  const { posts: realTimePosts, loading: isLoading, error, refresh } = useRealTimePosts();

  // Subscribe to real-time bookmark updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToBookmarks(
      user.id,
      (bookmarkedIds) => {
        setBookmarkedPostIds(new Set(bookmarkedIds));
      },
      (error) => {
        console.error('Error subscribing to bookmarks:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);
  
  // Convert Firebase posts to our Post interface
  const firebasePosts = realTimePosts.map((firebasePost: FirebasePost): Post => ({
    id: firebasePost.id,
    user: {
      id: firebasePost.author?.id || firebasePost.author_id,
      name: firebasePost.author?.name || 'Unknown User',
      username: firebasePost.author?.username || '@unknown',
      avatar: firebasePost.author?.avatar,
      followers: firebasePost.author?.followers || 0,
      following: firebasePost.author?.following || 0,
    },
    content: firebasePost.content,
    image: firebasePost.image,
    timestamp: formatTimestamp(firebasePost.created_at),
    likes: firebasePost.likes || 0,
    comments: firebasePost.comments || 0,
    shares: firebasePost.shares || 0,
    isLiked: false,
    isShared: false,
    isBookmarked: bookmarkedPostIds.has(firebasePost.id),
    postComments: [],
    moderationStatus: 'approved' as 'approved' | 'pending' | 'rejected',
    isAgricultureRelated: true,
    aiScore: 0.9,
    aiTags: [],
    recommendationScore: 0.8,
  }));
  
  // Use only Firebase posts
  const allPosts: Post[] = firebasePosts;

  const toggleLike = async (postId: string) => {
    if (!user?.id) return;

    try {
      const isLiked = await firebaseToggleLike(user.id, postId);
      trackPostLiked(postId, user.id);
      refresh();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleShare = async (postId: string) => {
    if (!user?.id) return;

    try {
      const isShared = await firebaseToggleShare(user.id, postId);
      trackPostShared(postId, 'app_share');
      refresh();
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const trackPostView = (postId: string, authorId: string) => {
    trackPostViewed(postId, authorId);
  };

  const addPost = async (content: string, image?: string) => {
    if (!user) {
      throw new Error('User must be authenticated to create posts');
    }
    
    try {
      let imageUrl: string | null = image || null;
      if (image && !image.startsWith('http')) {
        imageUrl = await uploadImage(image, 'posts');
      }
      
      const newFirebasePost = imageUrl 
        ? await createPost(content, imageUrl)
        : await createPost(content);
      
      if (newFirebasePost) {
        trackPostCreated(newFirebasePost.id, !!imageUrl);
        
        const newPost: Post = {
          id: newFirebasePost.id,
          user: {
            id: user.id,
            name: user.name || 'You',
            username: user.username || '@you',
            avatar: user.avatar,
            followers: user.followers || 0,
            following: user.following || 0,
          },
          content: newFirebasePost.content,
          image: newFirebasePost.image,
          timestamp: 'now',
          likes: newFirebasePost.likes,
          comments: newFirebasePost.comments,
          shares: 0,
          isLiked: false,
          isShared: false,
          moderationStatus: 'approved' as 'approved' | 'pending' | 'rejected',
          isAgricultureRelated: true,
          aiScore: 0.9,
          aiTags: [],
          recommendationScore: 0.8,
        };
        
        return newPost;
      }
      
      throw new Error('Failed to create post');
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const togglePostBookmark = async (postId: string) => {
    if (!user?.id) return;

    try {
      await toggleBookmark(user.id, postId);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user?.id || !content.trim()) return;

    try {
      await firebaseAddComment(user.id, postId, content.trim());
      refresh();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getSmartRecommendations = async (userInterests: string[] = [], followedUsers: string[] = []) => {
    if (allPosts.length === 0) {
      setRecommendedPosts([]);
      return [];
    }
    const recommendations = await getRecommendations(allPosts, {
      userInterests,
      followedUsers: followedUsers.map(id => parseInt(id, 10)), // Convert string IDs to numbers
      recentActivity: []
    });
    setRecommendedPosts(recommendations);
    return recommendations;
  };

  const getFilteredPosts = (filter: 'all' | 'agriculture' | 'approved' | 'pending') => {
    switch (filter) {
      case 'agriculture':
        return allPosts.filter(post => post.isAgricultureRelated);
      case 'approved':
        return allPosts.filter(post => post.moderationStatus === 'approved');
      case 'pending':
        return allPosts.filter(post => post.moderationStatus === 'pending');
      default:
        return allPosts;
    }
  };

  const insights = getContentInsights(allPosts);

  return {
    posts: allPosts,
    recommendedPosts,
    isLoading,
    error,
    refresh,
    toggleLike,
    toggleShare,
    togglePostBookmark,
    addPost,
    addComment,
    trackPostView,
    getSmartRecommendations,
    getFilteredPosts,
    insights,
  };
}