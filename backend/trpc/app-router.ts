import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { registerProcedure } from "./routes/auth/register/route";
import { loginProcedure } from "./routes/auth/login/route";
import { meProcedure } from "./routes/auth/me/route";
import { completeProfileProcedure } from "./routes/auth/complete-profile/route";
import { createPostProcedure } from "./routes/posts/create/route";
import { getPostsProcedure } from "./routes/posts/list/route";
import { uploadImageProcedure } from "./routes/posts/upload-image/route";
import { toggleBookmarkProcedure } from "./routes/posts/toggle-bookmark/route";
import { listBookmarksProcedure } from "./routes/posts/list-bookmarks/route";
import { toggleLikeProcedure } from "./routes/posts/toggle-like/route";
import { addCommentProcedure } from "./routes/posts/add-comment/route";
import { toggleShareProcedure } from "./routes/posts/toggle-share/route";
import { checkLikeProcedure } from "./routes/posts/check-like/route";
import { deletePostProcedure } from "./routes/posts/delete/route";
import { reportPostProcedure } from "./routes/posts/report/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    register: registerProcedure,
    login: loginProcedure,
    me: meProcedure,
    completeProfile: completeProfileProcedure,
  }),
  posts: createTRPCRouter({
    create: createPostProcedure,
    list: getPostsProcedure,
    uploadImage: uploadImageProcedure,
    toggleBookmark: toggleBookmarkProcedure,
    listBookmarks: listBookmarksProcedure,
    toggleLike: toggleLikeProcedure,
    addComment: addCommentProcedure,
    toggleShare: toggleShareProcedure,
    checkLike: checkLikeProcedure,
    delete: deletePostProcedure,
    report: reportPostProcedure,
  }),
});

export type AppRouter = typeof appRouter;