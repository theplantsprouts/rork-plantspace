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
  const posts = realTimePosts.map((firebasePost: FirebasePost) => ({
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
    moderationStatus: 'approved' as 'approved' | 'pending' | 'rejected',
    isAgricultureRelated: true,
    aiScore: 0.9,
    aiTags: [],
    recommendationScore: 0.8,
  }));
  
  // Use only real-time posts from Firebase
  const allPosts = posts;

  const toggleLike = async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
      trackPostLiked(postId, post.user.id);
      
      // Update the post's like count locally for immediate feedback
      const updatedPosts = allPosts.map(p => 
        p.id === postId 
          ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked }
          : p
      );
      
      // In a real app, you'd update the like in Firebase here
      console.log('Like toggled for post:', postId, 'New like count:', updatedPosts.find(p => p.id === postId)?.likes);
      
      // Force a refresh to get updated data
      refresh();
    }
  };

  const toggleShare = async (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
      trackPostShared(postId, 'app_share');
      
      // Update the post's share count locally for immediate feedback
      const updatedPosts = allPosts.map(p => 
        p.id === postId 
          ? { ...p, shares: p.isShared ? p.shares - 1 : p.shares + 1, isShared: !p.isShared }
          : p
      );
      
      // In a real app, you'd update the share count in Firebase here
      console.log('Share toggled for post:', postId, 'New share count:', updatedPosts.find(p => p.id === postId)?.shares);
      
      // Force a refresh to get updated data
      refresh();
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
    if (post) {
      // Update the post's comment count locally for immediate feedback
      const updatedPosts = allPosts.map(p => 
        p.id === postId 
          ? { ...p, comments: p.comments + 1 }
          : p
      );
      
      // In a real app, you'd create the comment in Firebase here
      console.log('Comment added to post:', postId, content, 'New comment count:', updatedPosts.find(p => p.id === postId)?.comments);
      
      // Force a refresh to get updated data
      refresh();
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