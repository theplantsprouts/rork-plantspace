import { protectedProcedure } from "../../../create-context";

export const meProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    console.log('Getting current user from context:', ctx.user?.id);
    
    const response = {
      id: ctx.user.id,
      email: ctx.user.email,
      createdAt: ctx.user.createdAt,
      name: ctx.user.name,
      username: ctx.user.username,
      bio: ctx.user.bio,
      avatar: ctx.user.avatar,
      followers: ctx.user.followers || 0,
      following: ctx.user.following || 0,
    };
    
    console.log('Returning user data:', response.id);
    return response;
  });