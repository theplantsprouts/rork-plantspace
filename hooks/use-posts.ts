import { useState } from 'react';
import { useAIContent } from './use-ai-content';
import { useAuth } from './use-auth';
import { useRealTimePosts } from './use-realtime';
import { createPost, uploadImage, Post as FirebasePost } from '@/lib/firebase';
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
  const { getRecommendations, getContentInsights } = useAIContent();
  const { user } = useAuth();
  
  // Use real-time posts hook
  const { posts: realTimePosts, loading: isLoading, error, refresh } = useRealTimePosts();
  
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
    shares: 0, // Not implemented yet
    isLiked: false, // Would need to check user's likes
    isShared: false,
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
    const post = allPosts.find(p => p.id === postId);
    if (post) {
      try {
        trackPostLiked(postId, post.user.id);
        
        // TODO: Implement actual like toggle in Firebase
        // For now, simulate the action by updating local state
        console.log('Like toggled for post:', postId, 'Current likes:', post.likes);
        
        // Simulate like toggle - in a real app this would update Firebase
        post.likes = post.isLiked ? post.likes - 1 : post.likes + 1;
        post.isLiked = !post.isLiked;
        
        console.log('✅ Like action processed successfully - New likes:', post.likes);
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    }
  };

  const toggleShare = async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
      try {
        trackPostShared(postId, 'app_share');
        
        // Simulate share functionality
        console.log('Share action for post:', postId, 'Content:', post.content.substring(0, 50) + '...');
        
        // Simulate share count increment
        post.shares = (post.shares || 0) + 1;
        post.isShared = true;
        
        console.log('✅ Share action processed successfully - New shares:', post.shares);
      } catch (error) {
        console.error('Error sharing post:', error);
      }
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
      console.log('Creating post with Firebase...');
      
      // Upload image if provided
      let imageUrl: string | null = image || null;
      if (image && !image.startsWith('http')) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(image, 'posts');
      }
      
      // Create post using Firebase function - only pass imageUrl if it exists
      const newFirebasePost = imageUrl 
        ? await createPost(content, imageUrl)
        : await createPost(content);
      
      if (newFirebasePost) {
        // Track post creation
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
        
        console.log('Post created successfully');
        return newPost;
      }
      
      throw new Error('Failed to create post');
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const addComment = async (postId: string, content: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (post && content.trim()) {
      try {
        // Simulate comment creation
        console.log('Comment added to post:', postId, 'Comment:', content);
        
        // Simulate comment count increment
        post.comments = (post.comments || 0) + 1;
        
        // Create a mock comment object
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          user: {
            id: user?.id || 'current-user',
            name: user?.name || 'You',
            username: user?.username || '@you',
            avatar: user?.avatar,
            followers: 0,
            following: 0,
          },
          content: content.trim(),
          timestamp: 'now',
          likes: 0,
        };
        
        // Add to post comments if array exists
        if (!post.postComments) {
          post.postComments = [];
        }
        post.postComments.unshift(newComment);
        
        console.log('✅ Comment action processed successfully - New comment count:', post.comments);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
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
    addPost,
    addComment,
    trackPostView,
    getSmartRecommendations,
    getFilteredPosts,
    insights,
  };
}