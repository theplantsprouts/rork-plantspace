import { protectedProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

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
      const profilesSnapshot = await getDocs(profilesRef);
      
      const usersMap = new Map();
      
      profilesSnapshot.forEach((doc) => {
        if (doc.id !== ctx.user.id) {
          const data = doc.data();
          const username = (data.username || '').toLowerCase();
          const name = (data.name || '').toLowerCase();
          
          if (username.includes(searchLower) || name.includes(searchLower)) {
            usersMap.set(doc.id, {
              id: doc.id,
              username: data.username || '',
              name: data.name || '',
              avatar: data.avatar || '',
              bio: data.bio || '',
            });
          }
        }
      });
      
      const users = Array.from(usersMap.values())
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
      
      console.log(`Found ${users.length} users matching query`);
      
      return { users };
    } catch (error: any) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  });
