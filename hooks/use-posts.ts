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

const mockPosts: Post[] = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'Sarah Chen',
      username: '@sarahchen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      followers: 1250,
      following: 890,
      isFollowing: false,
    },
    content: 'Just harvested my first batch of organic tomatoes! 🍅 The soil preparation and composting really paid off. Sharing some tips on sustainable farming practices in my garden.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=400&fit=crop',
    timestamp: '2h ago',
    likes: 234,
    comments: 18,
    shares: 7,
    isLiked: false,
    isShared: false,
    aiScore: 0.95,
    isAgricultureRelated: true,
    moderationStatus: 'approved',
    aiTags: ['organic farming', 'tomatoes', 'sustainable agriculture', 'composting'],
    recommendationScore: 0.92,
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Marcus Johnson',
      username: '@marcusj',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      followers: 2340,
      following: 567,
      isFollowing: true,
    },
    content: 'Implementing precision agriculture with drone technology on our farm! 🚁 The data we\'re collecting on soil moisture and crop health is revolutionizing how we manage our fields.',
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop',
    timestamp: '4h ago',
    likes: 156,
    comments: 23,
    shares: 12,
    isLiked: true,
    isShared: false,
    aiScore: 0.98,
    isAgricultureRelated: true,
    moderationStatus: 'approved',
    aiTags: ['precision agriculture', 'drone technology', 'soil monitoring', 'crop management'],
    recommendationScore: 0.96,
  },
  {
    id: '3',
    user: {
      id: '3',
      name: 'Emma Rodriguez',
      username: '@emmarodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      followers: 890,
      following: 1200,
      isFollowing: false,
    },
    content: 'Climate change is affecting coffee production worldwide ☕️🌍 Working with local farmers to implement sustainable growing practices and drought-resistant varieties. Every cup tells a story of environmental resilience.',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop',
    timestamp: '6h ago',
    likes: 89,
    comments: 31,
    shares: 5,
    isLiked: false,
    isShared: false,
    aiScore: 0.91,
    isAgricultureRelated: true,
    moderationStatus: 'approved',
    aiTags: ['climate change', 'coffee farming', 'sustainable agriculture', 'drought resistance'],
    recommendationScore: 0.88,
  },
  {
    id: '4',
    user: {
      id: '4',
      name: 'David Kim',
      username: '@davidkim',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      followers: 3450,
      following: 234,
      isFollowing: true,
    },
    content: 'Documenting biodiversity in mountain ecosystems 🏔️🌿 These alpine environments are crucial for understanding climate adaptation. Each species here tells us about environmental resilience and conservation needs.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    timestamp: '8h ago',
    likes: 312,
    comments: 45,
    shares: 18,
    isLiked: true,
    isShared: false,
    aiScore: 0.89,
    isAgricultureRelated: true,
    moderationStatus: 'approved',
    aiTags: ['biodiversity', 'mountain ecosystems', 'climate adaptation', 'conservation'],
    recommendationScore: 0.85,
  },
  {
    id: '5',
    user: {
      id: '5',
      name: 'Lisa Park',
      username: '@lisapark',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      followers: 567,
      following: 890,
      isFollowing: false,
    },
    content: 'AI is transforming agriculture! 🤖🌱 From predictive analytics for crop yields to automated pest detection, technology is helping farmers make data-driven decisions for sustainable food production.',
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop',
    timestamp: '12h ago',
    likes: 67,
    comments: 12,
    shares: 3,
    isLiked: false,
    isShared: false,
    aiScore: 0.94,
    isAgricultureRelated: true,
    moderationStatus: 'approved',
    aiTags: ['AI in agriculture', 'predictive analytics', 'pest detection', 'sustainable farming'],
    recommendationScore: 0.90,
  },
  {
    id: '6',
    user: {
      id: '6',
      name: 'Alex Thompson',
      username: '@alexthompson',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      followers: 4560,
      following: 1230,
      isFollowing: false,
    },
    content: 'Urban farming is the future! 🌃🌱 Rooftop gardens and vertical farms are transforming city landscapes. Growing fresh produce locally reduces transportation emissions and brings communities together.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    timestamp: '1d ago',
    likes: 445,
    comments: 67,
    shares: 24,
    isLiked: false,
    isShared: true,
    aiScore: 0.93,
    isAgricultureRelated: true,
    moderationStatus: 'approved',
    aiTags: ['urban farming', 'vertical agriculture', 'sustainable cities', 'local food production'],
    recommendationScore: 0.91,
  },
];

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
    moderationStatus: 'approved' as const,
    isAgricultureRelated: true,
    aiScore: 0.9,
    aiTags: [],
    recommendationScore: 0.8,
  }));
  
  // Combine with mock posts if no real posts
  const allPosts = posts.length > 0 ? [...posts, ...mockPosts] : mockPosts;

  const toggleLike = (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
      trackPostLiked(postId, post.user.id);
    }
    // Note: In a real app, you'd update the like in Firebase here
    console.log('Like toggled for post:', postId);
  };

  const toggleShare = (postId: string) => {
    const post = allPosts.find(p => p.id === postId);
    if (post) {
      trackPostShared(postId, 'app_share');
    }
    // Note: In a real app, you'd update the share count in Firebase here
    console.log('Share toggled for post:', postId);
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
      
      // Create post using Firebase function
      const newFirebasePost = await createPost(content, imageUrl || undefined);
      
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
          moderationStatus: 'approved',
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

  const addComment = (postId: string, content: string) => {
    // Note: In a real app, you'd create the comment in Firebase here
    console.log('Comment added to post:', postId, content);
  };

  const getSmartRecommendations = async (userInterests: string[] = [], followedUsers: string[] = []) => {
    const recommendations = await getRecommendations(allPosts, {
      userInterests,
      followedUsers: followedUsers as any, // Type compatibility fix
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