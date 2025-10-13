import { protectedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export const searchUsersProcedure = protectedProcedure
  .input(
    z.object({
      searchQuery: z.string().min(1),
      limit: z.number().optional().default(20),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Searching users with query:', input.searchQuery);
      
      const searchLower = input.searchQuery.toLowerCase();
      
      const profilesRef = collection(db, 'profiles');
      
      const usernameQuery = query(
        profilesRef,
        where('username', '>=', searchLower),
        where('username', '<=', searchLower + '\uf8ff'),
        limit(input.limit)
      );
      
      const nameQuery = query(
        profilesRef,
        where('name', '>=', searchLower),
        where('name', '<=', searchLower + '\uf8ff'),
        limit(input.limit)
      );
      
      const [usernameSnapshot, nameSnapshot] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(nameQuery)
      ]);
      
      const usersMap = new Map();
      
      usernameSnapshot.forEach((doc) => {
        if (doc.id !== ctx.user.id) {
          const data = doc.data();
          usersMap.set(doc.id, {
            id: doc.id,
            username: data.username || '',
            name: data.name || '',
            avatar: data.avatar || '',
            bio: data.bio || '',
          });
        }
      });
      
      nameSnapshot.forEach((doc) => {
        if (doc.id !== ctx.user.id && !usersMap.has(doc.id)) {
          const data = doc.data();
          usersMap.set(doc.id, {
            id: doc.id,
            username: data.username || '',
            name: data.name || '',
            avatar: data.avatar || '',
            bio: data.bio || '',
          });
        }
      });
      
      const users = Array.from(usersMap.values()).slice(0, input.limit);
      
      console.log(`Found ${users.length} users matching query`);
      
      return { users };
    } catch (error: any) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  });
