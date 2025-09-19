import { useState, useEffect } from 'react';
import { useAIContent } from './use-ai-content';
import { useAuth } from './use-auth';
import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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

// Helper function to convert Firebase post to our Post interface
const convertFirebasePost = async (firebasePost: any): Promise<Post> => {
  // Get user profile
  let userProfile = {
    id: firebasePost.author_id,
    name: 'Unknown User',
    username: '@unknown',
    avatar: undefined,
    followers: 0,
    following: 0,
  };
  
  try {
    const profileDoc = await getDoc(doc(db, 'profiles', firebasePost.author_id));
    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      userProfile = {
        id: profileDoc.id,
        name: profileData.name || 'Unknown User',
        username: profileData.username || '@unknown',
        avatar: profileData.avatar,
        followers: profileData.followers || 0,
        following: profileData.following || 0,
      };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
  
  return {
    id: firebasePost.id,
    user: userProfile,
    content: firebasePost.content,
    image: firebasePost.image,
    timestamp: formatTimestamp(firebasePost.created_at?.toDate?.()?.toISOString() || new Date().toISOString()),
    likes: firebasePost.likes || 0,
    comments: firebasePost.comments || 0,
    shares: firebasePost.shares || 0,
    isLiked: false, // Would need to check user's likes
    isShared: false,
    moderationStatus: 'approved',
    isAgricultureRelated: true,
    aiScore: 0.9,
    aiTags: firebasePost.aiTags || [],
    recommendationScore: 0.8,
  };
};

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
  const { getRecommendations, getContentInsights } = useAIContent();
  const { user } = useAuth();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        console.log('Loading posts from Firebase...');
        
        // Try to load posts from Firebase
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('created_at', 'desc')
        );
        
        const querySnapshot = await getDocs(postsQuery);
        const firebasePosts: any[] = [];
        
        querySnapshot.forEach((doc) => {
          firebasePosts.push({ id: doc.id, ...doc.data() });
        });
        
        if (firebasePosts.length > 0) {
          console.log('Loaded posts from Firebase:', firebasePosts.length);
          const convertedPosts = await Promise.all(
            firebasePosts.map(convertFirebasePost)
          );
          setPosts([...convertedPosts, ...mockPosts]); // Combine with mock data
        } else {
          console.log('No posts in Firebase, using mock data');
          setPosts(mockPosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        console.log('Falling back to mock data');
        setPosts(mockPosts);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const toggleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  };

  const toggleShare = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const isShared = !post.isShared;
          return {
            ...post,
            isShared,
            shares: isShared ? post.shares + 1 : post.shares - 1
          };
        }
        return post;
      })
    );
  };

  const uploadImageToFirebase = async (imageUri: string): Promise<string> => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const filename = `posts/${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const storageRef = ref(storage, filename);
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const addPost = async (content: string, image?: string) => {
    if (!user) {
      throw new Error('User must be authenticated to create posts');
    }
    
    try {
      console.log('Creating post with Firebase...');
      
      // Upload image if provided
      let imageUrl = image;
      if (image && !image.startsWith('http')) {
        console.log('Uploading image...');
        imageUrl = await uploadImageToFirebase(image);
      }
      
      // Create post in Firebase
      const postData = {
        content,
        image: imageUrl,
        author_id: user.id,
        created_at: serverTimestamp(),
        likes: 0,
        comments: 0,
        shares: 0,
        aiTags: [],
      };
      
      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      const newPost: Post = {
        id: docRef.id,
        user: {
          id: user.id,
          name: user.name || 'You',
          username: user.username || '@you',
          avatar: user.avatar,
          followers: user.followers || 0,
          following: user.following || 0,
        },
        content,
        image: imageUrl,
        timestamp: 'now',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isShared: false,
        moderationStatus: 'approved',
        isAgricultureRelated: true,
        aiScore: 0.9,
        aiTags: [],
        recommendationScore: 0.8,
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      console.log('Post created successfully');
      return newPost;
    } catch (error) {
      console.error('Error creating post:', error);
      
      // Fallback to local post creation
      const newPost: Post = {
        id: Date.now().toString(),
        user: {
          id: user.id,
          name: user.name || 'You',
          username: user.username || '@you',
          avatar: user.avatar,
          followers: user.followers || 0,
          following: user.following || 0,
        },
        content,
        image,
        timestamp: 'now',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isShared: false,
        moderationStatus: 'pending',
        isAgricultureRelated: false,
        aiScore: 0,
        aiTags: [],
        recommendationScore: 0,
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      return newPost;
    }
  };

  const addComment = (postId: string, content: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1
          };
        }
        return post;
      })
    );
  };

  const getSmartRecommendations = async (userInterests: string[] = [], followedUsers: string[] = []) => {
    const recommendations = await getRecommendations(posts, {
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
        return posts.filter(post => post.isAgricultureRelated);
      case 'approved':
        return posts.filter(post => post.moderationStatus === 'approved');
      case 'pending':
        return posts.filter(post => post.moderationStatus === 'pending');
      default:
        return posts;
    }
  };

  const insights = getContentInsights(posts);

  return {
    posts,
    recommendedPosts,
    isLoading,
    toggleLike,
    toggleShare,
    addPost,
    addComment,
    getSmartRecommendations,
    getFilteredPosts,
    insights,
  };
}