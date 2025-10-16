import { protectedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit as firestoreLimit,
  orderBy 
} from "firebase/firestore";

export const searchProcedure = protectedProcedure
  .input(
    z.object({
      searchQuery: z.string().min(1),
      type: z.enum(['all', 'users', 'posts', 'hashtags']).optional().default('all'),
      limit: z.number().optional().default(20),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Searching with query:', input.searchQuery, 'type:', input.type);
      
      const searchLower = input.searchQuery.toLowerCase().trim();
      const results = {
        users: [] as any[],
        posts: [] as any[],
        hashtags: [] as string[],
      };

      if (input.type === 'all' || input.type === 'users') {
        const profilesRef = collection(db, 'profiles');
        const profilesSnapshot = await getDocs(profilesRef);
        
        const usersMap = new Map();
        
        profilesSnapshot.forEach((doc) => {
          if (doc.id !== ctx.user.id) {
            const data = doc.data();
            const username = (data.username || '').toLowerCase();
            const name = (data.name || '').toLowerCase();
            const bio = (data.bio || '').toLowerCase();
            
            if (username.includes(searchLower) || name.includes(searchLower) || bio.includes(searchLower)) {
              usersMap.set(doc.id, {
                id: doc.id,
                username: data.username || '',
                name: data.name || '',
                avatar: data.avatar || '',
                bio: data.bio || '',
                followers: data.followers || 0,
                following: data.following || 0,
              });
            }
          }
        });
        
        results.users = Array.from(usersMap.values())
          .sort((a, b) => {
            const aUsernameMatch = a.username.toLowerCase().startsWith(searchLower);
            const bUsernameMatch = b.username.toLowerCase().startsWith(searchLower);
            const aNameMatch = a.name.toLowerCase().startsWith(searchLower);
            const bNameMatch = b.name.toLowerCase().startsWith(searchLower);
            
            if (aUsernameMatch && !bUsernameMatch) return -1;
            if (!aUsernameMatch && bUsernameMatch) return 1;
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            return a.name.localeCompare(b.name);
          })
          .slice(0, input.limit);
        console.log(`Found ${results.users.length} users`);
      }

      if (input.type === 'all' || input.type === 'posts') {
        const postsRef = collection(db, 'posts');
        const postsQuery = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          firestoreLimit(100)
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const allPosts: any[] = [];
        
        for (const postDoc of postsSnapshot.docs) {
          const postData = postDoc.data();
          
          const profileDoc = await getDocs(
            query(collection(db, 'profiles'), where('__name__', '==', postData.userId))
          );
          
          const profile = profileDoc.docs[0]?.data();
          
          const contentMatch = postData.content?.toLowerCase().includes(searchLower);
          const tagsMatch = postData.aiTags?.some((tag: string) => 
            tag.toLowerCase().includes(searchLower)
          );
          const userMatch = profile?.name?.toLowerCase().includes(searchLower) ||
                           profile?.username?.toLowerCase().includes(searchLower);
          
          if (contentMatch || tagsMatch || userMatch) {
            allPosts.push({
              id: postDoc.id,
              content: postData.content || '',
              image: postData.image || null,
              createdAt: postData.createdAt?.toDate().toISOString() || new Date().toISOString(),
              likes: postData.likes || 0,
              comments: postData.comments || 0,
              shares: postData.shares || 0,
              aiTags: postData.aiTags || [],
              aiScore: postData.aiScore || 0,
              user: {
                id: postData.userId,
                name: profile?.name || 'Unknown',
                username: profile?.username || '',
                avatar: profile?.avatar || '',
              },
            });
          }
        }
        
        results.posts = allPosts.slice(0, input.limit);
        console.log(`Found ${results.posts.length} posts`);
      }

      if (input.type === 'all' || input.type === 'hashtags') {
        const postsRef = collection(db, 'posts');
        const postsQuery = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          firestoreLimit(200)
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const hashtagsSet = new Set<string>();
        
        postsSnapshot.forEach((doc) => {
          const postData = doc.data();
          if (postData.aiTags && Array.isArray(postData.aiTags)) {
            postData.aiTags.forEach((tag: string) => {
              if (tag.toLowerCase().includes(searchLower)) {
                hashtagsSet.add(tag.toLowerCase());
              }
            });
          }
        });
        
        results.hashtags = Array.from(hashtagsSet).slice(0, 10);
        console.log(`Found ${results.hashtags.length} hashtags`);
      }
      
      return results;
    } catch (error: any) {
      console.error('Error searching:', error);
      throw new Error('Failed to search');
    }
  });
