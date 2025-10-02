import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export const getUsersProcedure = protectedProcedure
  .input(
    z.object({
      searchQuery: z.string().optional(),
      limitCount: z.number().optional().default(20),
    })
  )
  .query(async ({ input, ctx }) => {
    try {
      const profilesRef = collection(db, 'profiles');
      let q = query(profilesRef, limit(input.limitCount));

      if (input.searchQuery) {
        q = query(
          profilesRef,
          where('username', '>=', input.searchQuery),
          where('username', '<=', input.searchQuery + '\uf8ff'),
          limit(input.limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user: any) => user.id !== ctx.user.id);

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  });
