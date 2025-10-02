import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, limit, startAfter, DocumentSnapshot, Timestamp, onSnapshot, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDL85ZR6bK_4824GM94vlnHt0M94-9QE3k",
  authDomain: "plantspace78.firebaseapp.com",
  databaseURL: "https://plantspace78-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "plantspace78",
  storageBucket: "plantspace78.firebasestorage.app",
  messagingSenderId: "229616605757",
  appId: "1:229616605757:web:7bfe4f0387cd2e8a43a854",
  measurementId: "G-EMMJ0SZ05N"
};

// Initialize Firebase app only if it doesn't exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (web only)
let analytics: Analytics | null = null;
if (Platform.OS === 'web') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available:', error);
  }
}

export { analytics };

// Database types
export interface Profile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  followers?: number;
  following?: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  content: string;
  image?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  shares?: number;
  author?: Profile;
}

// Auth functions
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create profile document
    await createProfile(user.uid, email);
    
    return {
      user: {
        id: user.uid,
        email: user.email || email,
        created_at: new Date().toISOString(),
      },
      needsVerification: !user.emailVerified,
    };
  } catch (error: any) {
    console.error('Firebase registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return {
      user: {
        id: user.uid,
        email: user.email || email,
        emailVerified: user.emailVerified,
      },
    };
  } catch (error: any) {
    console.error('Firebase login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase logout error:', error);
    throw new Error(error.message || 'Logout failed');
  }
};

// Profile functions
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Profile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const createProfile = async (userId: string, email: string): Promise<Profile | null> => {
  try {
    const profileData = {
      email,
      followers: 0,
      following: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'profiles', userId), profileData);
    
    return { id: userId, ...profileData } as Profile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw new Error('Failed to create profile');
  }
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const docRef = doc(db, 'profiles', userId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
    
    return await getProfile(userId);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }
};

// Post functions
export const getPosts = async (limitCount: number = 20): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('created_at', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const posts: Post[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const postData = { id: docSnap.id, ...docSnap.data() } as Post;
      
      // Fetch author profile
      if (postData.author_id) {
        const authorProfile = await getProfile(postData.author_id);
        if (authorProfile) {
          postData.author = authorProfile;
        }
      }
      
      posts.push(postData);
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const createPost = async (content: string, image?: string): Promise<Post | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const postData: any = {
      content,
      author_id: user.uid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
    };
    
    // Only add image field if it exists and is not undefined
    if (image) {
      postData.image = image;
    }
    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    
    // Fetch author profile
    const authorProfile = await getProfile(user.uid);
    
    return {
      id: docRef.id,
      ...postData,
      author: authorProfile || undefined,
    } as Post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
};

// Upload image to Firebase Storage
export const uploadImage = async (uri: string, folder: string = 'images'): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Generate unique filename
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${folder}/${user.uid}/${Date.now()}.${fileExt}`;
    
    // Convert URI to blob
    let blob;
    if (Platform.OS === 'web' && uri.startsWith('data:')) {
      const response = await fetch(uri);
      blob = await response.blob();
    } else {
      const response = await fetch(uri);
      blob = await response.blob();
    }
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Real-time listeners
export const subscribeToUserPosts = (
  userId: string, 
  callback: (posts: Post[]) => void,
  errorCallback?: (error: any) => void
) => {
  // Ensure user is authenticated before setting up listener
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('User not authenticated for user posts subscription');
    if (errorCallback) {
      errorCallback(new Error('Authentication required'));
    }
    return () => {}; // Return empty unsubscribe function
  }

  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef, 
    where('author_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  
  console.log('Setting up Firestore listener for user posts:', userId);
  
  return onSnapshot(q, async (snapshot) => {
    try {
      console.log('Processing user posts snapshot with', snapshot.docs.length, 'documents');
      const posts: Post[] = [];
      
      for (const docSnap of snapshot.docs) {
        const postData = { id: docSnap.id, ...docSnap.data() } as Post;
        
        // Fetch author profile
        if (postData.author_id) {
          const authorProfile = await getProfile(postData.author_id);
          if (authorProfile) {
            postData.author = authorProfile;
          }
        }
        
        posts.push(postData);
      }
      
      console.log('Successfully processed', posts.length, 'user posts');
      callback(posts);
    } catch (error) {
      console.error('Error processing user posts snapshot:', error);
      if (errorCallback) {
        errorCallback(error);
      } else {
        callback([]);
      }
    }
  }, (error) => {
    console.error('Firestore user posts subscription error:', error);
    if (errorCallback) {
      errorCallback(error);
    } else {
      callback([]);
    }
  });
};

export const subscribeToAllPosts = (
  callback: (posts: Post[]) => void,
  errorCallback?: (error: any) => void,
  limitCount: number = 20
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('User not authenticated for posts subscription');
    if (errorCallback) {
      errorCallback(new Error('Authentication required'));
    }
    return () => {};
  }

  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('created_at', 'desc'), limit(limitCount));
  
  console.log('Setting up Firestore listener for all posts with user:', currentUser.uid);
  
  const profileCache = new Map<string, any>();
  
  return onSnapshot(q, async (snapshot) => {
    try {
      console.log('Processing posts snapshot with', snapshot.docs.length, 'documents');
      const posts: Post[] = [];
      
      const uniqueAuthorIds = [...new Set(snapshot.docs.map(doc => doc.data().author_id).filter(Boolean))];
      
      await Promise.all(
        uniqueAuthorIds.map(async (authorId) => {
          if (!profileCache.has(authorId)) {
            try {
              const profile = await getProfile(authorId);
              if (profile) profileCache.set(authorId, profile);
            } catch (error) {
              console.warn('Failed to fetch profile:', authorId);
            }
          }
        })
      );
      
      for (const docSnap of snapshot.docs) {
        const postData = { id: docSnap.id, ...docSnap.data() } as Post;
        
        if (postData.author_id && profileCache.has(postData.author_id)) {
          postData.author = profileCache.get(postData.author_id);
        }
        
        posts.push(postData);
      }
      
      console.log('Successfully processed', posts.length, 'posts');
      callback(posts);
    } catch (error) {
      console.error('Error processing posts snapshot:', error);
      if (errorCallback) {
        errorCallback(error);
      } else {
        callback([]);
      }
    }
  }, (error) => {
    console.error('Firestore subscription error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (errorCallback) {
      errorCallback(error);
    } else {
      callback([]);
    }
  });
};

// Analytics functions
export const logAnalyticsEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics && Platform.OS === 'web') {
    logEvent(analytics, eventName, parameters);
  }
  console.log(`Analytics Event: ${eventName}`, parameters);
};

// Push notification token storage
export const savePushToken = async (userId: string, token: string) => {
  try {
    const docRef = doc(db, 'push_tokens', userId);
    await setDoc(docRef, {
      token,
      updated_at: new Date().toISOString(),
      platform: Platform.OS,
    }, { merge: true });
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

export const getPushTokens = async (userIds: string[]): Promise<string[]> => {
  try {
    const tokens: string[] = [];
    for (const userId of userIds) {
      const docRef = doc(db, 'push_tokens', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        tokens.push(docSnap.data().token);
      }
    }
    return tokens;
  } catch (error) {
    console.error('Error fetching push tokens:', error);
    return [];
  }
};

export const toggleBookmark = async (userId: string, postId: string): Promise<boolean> => {
  try {
    const bookmarkRef = doc(db, 'bookmarks', `${userId}_${postId}`);
    const bookmarkSnap = await getDoc(bookmarkRef);

    if (bookmarkSnap.exists()) {
      await deleteDoc(bookmarkRef);
      return false;
    } else {
      await setDoc(bookmarkRef, {
        userId,
        postId,
        created_at: new Date().toISOString(),
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw new Error('Failed to toggle bookmark');
  }
};

export const isPostBookmarked = async (userId: string, postId: string): Promise<boolean> => {
  try {
    const bookmarkRef = doc(db, 'bookmarks', `${userId}_${postId}`);
    const bookmarkSnap = await getDoc(bookmarkRef);
    return bookmarkSnap.exists();
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }
};

export const getBookmarkedPosts = async (userId: string): Promise<Post[]> => {
  try {
    const bookmarksRef = collection(db, 'bookmarks');
    const q = query(bookmarksRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const bookmarkedPosts: Post[] = [];

    for (const bookmarkDoc of querySnapshot.docs) {
      const bookmarkData = bookmarkDoc.data();
      const postRef = doc(db, 'posts', bookmarkData.postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = { id: postSnap.id, ...postSnap.data() } as Post;
        
        if (postData.author_id) {
          const authorProfile = await getProfile(postData.author_id);
          if (authorProfile) {
            postData.author = authorProfile;
          }
        }
        
        bookmarkedPosts.push(postData);
      }
    }

    return bookmarkedPosts;
  } catch (error) {
    console.error('Error fetching bookmarked posts:', error);
    return [];
  }
};

export const toggleLike = async (userId: string, postId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, 'likes', `${userId}_${postId}`);
    const likeSnap = await getDoc(likeRef);
    const postRef = doc(db, 'posts', postId);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likes: (await getDoc(postRef)).data()?.likes - 1 || 0,
      });
      return false;
    } else {
      await setDoc(likeRef, {
        userId,
        postId,
        created_at: new Date().toISOString(),
      });
      await updateDoc(postRef, {
        likes: ((await getDoc(postRef)).data()?.likes || 0) + 1,
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw new Error('Failed to toggle like');
  }
};

export const isPostLiked = async (userId: string, postId: string): Promise<boolean> => {
  try {
    const likeRef = doc(db, 'likes', `${userId}_${postId}`);
    const likeSnap = await getDoc(likeRef);
    return likeSnap.exists();
  } catch (error) {
    console.error('Error checking like:', error);
    return false;
  }
};

export const addComment = async (userId: string, postId: string, content: string): Promise<string | null> => {
  try {
    const commentData = {
      postId,
      userId,
      content,
      created_at: new Date().toISOString(),
      likes: 0,
    };

    const commentRef = await addDoc(collection(db, 'comments'), commentData);
    
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    await updateDoc(postRef, {
      comments: (postSnap.data()?.comments || 0) + 1,
    });

    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
};

export const toggleShare = async (userId: string, postId: string): Promise<boolean> => {
  try {
    const shareRef = doc(db, 'shares', `${userId}_${postId}`);
    const shareSnap = await getDoc(shareRef);
    const postRef = doc(db, 'posts', postId);

    if (shareSnap.exists()) {
      await deleteDoc(shareRef);
      const postSnap = await getDoc(postRef);
      await updateDoc(postRef, {
        shares: (postSnap.data()?.shares || 0) - 1,
      });
      return false;
    } else {
      await setDoc(shareRef, {
        userId,
        postId,
        created_at: new Date().toISOString(),
      });
      const postSnap = await getDoc(postRef);
      await updateDoc(postRef, {
        shares: (postSnap.data()?.shares || 0) + 1,
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling share:', error);
    throw new Error('Failed to toggle share');
  }
};

export const deletePost = async (userId: string, postId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    const postData = postSnap.data();
    
    if (postData.author_id !== userId) {
      throw new Error('You can only delete your own posts');
    }

    await deleteDoc(postRef);
  } catch (error: any) {
    console.error('Error deleting post:', error);
    throw new Error(error.message || 'Failed to delete post');
  }
};

export const reportPost = async (userId: string, postId: string, reason: string): Promise<void> => {
  try {
    const reportData = {
      post_id: postId,
      reported_by: userId,
      reason,
      created_at: new Date().toISOString(),
      status: 'pending',
    };

    await addDoc(collection(db, 'reports'), reportData);
  } catch (error: any) {
    console.error('Error reporting post:', error);
    throw new Error(error.message || 'Failed to report post');
  }
};

export const setUserAsAdmin = async (userId: string, isAdmin: boolean = true): Promise<void> => {
  try {
    const adminDocRef = doc(db, 'admins', userId);
    await setDoc(adminDocRef, {
      isAdmin,
      updated_at: new Date().toISOString(),
    });
    console.log(`User ${userId} admin status set to:`, isAdmin);
  } catch (error: any) {
    console.error('Error setting admin status:', error);
    throw new Error(error.message || 'Failed to set admin status');
  }
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const adminDocRef = doc(db, 'admins', userId);
    const adminDoc = await getDoc(adminDocRef);
    return adminDoc.exists() && adminDoc.data()?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const getUserByEmail = async (email: string): Promise<Profile | null> => {
  try {
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Profile;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

export default app;