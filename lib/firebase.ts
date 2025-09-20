import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, query, orderBy, limit, startAfter, DocumentSnapshot, Timestamp, onSnapshot, where } from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);

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
export const getPosts = async (): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('created_at', 'desc'));
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
  errorCallback?: (error: any) => void
) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('User not authenticated for posts subscription');
    if (errorCallback) {
      errorCallback(new Error('Authentication required'));
    }
    return () => {}; // Return empty unsubscribe function
  }

  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('created_at', 'desc'), limit(20));
  
  console.log('Setting up Firestore listener for all posts with user:', currentUser.uid);
  
  return onSnapshot(q, async (snapshot) => {
    try {
      console.log('Processing posts snapshot with', snapshot.docs.length, 'documents');
      const posts: Post[] = [];
      
      for (const docSnap of snapshot.docs) {
        const postData = { id: docSnap.id, ...docSnap.data() } as Post;
        
        // Fetch author profile with error handling
        if (postData.author_id) {
          try {
            const authorProfile = await getProfile(postData.author_id);
            if (authorProfile) {
              postData.author = authorProfile;
            }
          } catch (profileError) {
            console.warn('Failed to fetch author profile for post:', postData.id, profileError);
            // Continue without author profile
          }
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

export default app;