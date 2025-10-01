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
import { listUsersProcedure } from "./routes/admin/users/list/route";
import { suspendUserProcedure } from "./routes/admin/users/suspend/route";
import { activateUserProcedure } from "./routes/admin/users/activate/route";
import { listPostsAdminProcedure } from "./routes/admin/posts/list/route";
import { removePostProcedure } from "./routes/admin/posts/remove/route";
import { listReportsProcedure } from "./routes/admin/reports/list/route";
import { resolveReportProcedure } from "./routes/admin/reports/resolve/route";
import { dashboardStatsProcedure } from "./routes/admin/stats/dashboard/route";

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
  admin: createTRPCRouter({
    users: createTRPCRouter({
      list: listUsersProcedure,
      suspend: suspendUserProcedure,
      activate: activateUserProcedure,
    }),
    posts: createTRPCRouter({
      list: listPostsAdminProcedure,
      remove: removePostProcedure,
    }),
    reports: createTRPCRouter({
      list: listReportsProcedure,
      resolve: resolveReportProcedure,
    }),
    stats: createTRPCRouter({
      dashboard: dashboardStatsProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;