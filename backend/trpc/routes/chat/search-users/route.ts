import { protectedProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export const searchUsersProcedure = protectedProcedure
  .input(
    z.object({
      searchQuery: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const { searchQuery } = input;
    const currentUserId = ctx.user.id;

    if (!searchQuery || searchQuery.trim().length === 0) {
      return [];
    }

    const profilesRef = collection(db, 'profiles');
    
    const searchLower = searchQuery.toLowerCase();
    
    const usernameQuery = query(
      profilesRef,
      where('username', '>=', searchLower),
      where('username', '<=', searchLower + '\uf8ff'),
      limit(20)
    );

    const nameQuery = query(
      profilesRef,
      where('name', '>=', searchQuery),
      where('name', '<=', searchQuery + '\uf8ff'),
      limit(20)
    );

    const [usernameSnapshot, nameSnapshot] = await Promise.all([
      getDocs(usernameQuery),
      getDocs(nameQuery),
    ]);

    const usersMap = new Map();

    [...usernameSnapshot.docs, ...nameSnapshot.docs].forEach((doc) => {
      if (doc.id !== currentUserId) {
        const data = doc.data();
        usersMap.set(doc.id, {
          id: doc.id,
          name: data.name || 'Unknown User',
          username: data.username || '',
          avatar: data.avatar || '',
          bio: data.bio || '',
        });
      }
    });

    return Array.from(usersMap.values());
  });
