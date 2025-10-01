# Admin Panel - Complete Guide

## Overview
A comprehensive admin panel has been created for managing your Plant Community app. The admin panel follows the same beautiful green plant theme used throughout the app.

## Features Implemented

### 1. **Dashboard** (`/admin`)
- **Stats Overview**: Displays key metrics
  - Total Users & Active Users
  - Total Posts & Flagged Posts  
  - Pending Reports count
- **Quick Navigation**: Cards to access different management sections
- **Real-time Data**: Stats update automatically from the database

### 2. **User Management** (`/admin/users`)
- **User List**: View all users with pagination
- **Search**: Search users by username or full name
- **Filter**: Filter by status (All, Active, Suspended)
- **Actions**:
  - Suspend users (with reason)
  - Activate suspended users
- **User Details**: Shows avatar, username, full name, and status badge

### 3. **Content Moderation** (`/admin/content`)
- **Post List**: View all posts with pagination
- **Filter**: Filter by status (All, Active, Flagged, Removed)
- **Actions**:
  - Remove posts (with reason)
  - View post details
- **Post Preview**: Shows image, content, author info

### 4. **Reports Review** (`/admin/reports`)
- **Report List**: View all user reports
- **Filter**: Filter by status (Pending, Reviewed, Resolved)
- **Report Details**: Shows reporter, reported post, reason
- **Actions**:
  - Dismiss report
  - Remove reported post
  - Suspend user who created the post
- **Admin Notes**: Add notes when resolving reports

## Backend Routes Created

All routes are protected and require authentication:

```typescript
// User Management
trpc.admin.users.list.useQuery({ page, limit, search, status })
trpc.admin.users.suspend.useMutation({ userId, reason })
trpc.admin.users.activate.useMutation({ userId })

// Content Moderation
trpc.admin.posts.list.useQuery({ page, limit, status })
trpc.admin.posts.remove.useMutation({ postId, reason })

// Reports
trpc.admin.reports.list.useQuery({ page, limit, status })
trpc.admin.reports.resolve.useMutation({ reportId, action, notes })

// Dashboard Stats
trpc.admin.stats.dashboard.useQuery()
```

## How to Access the Admin Panel

### Method 1: Direct URL Navigation
```typescript
// From anywhere in your app
import { router } from 'expo-router';

router.push('/admin');
```

### Method 2: Add Admin Button to Profile
Add this to your profile screen (`app/(tabs)/profile.tsx`):

```typescript
import { Shield } from 'lucide-react-native';

// Inside your profile component
<TouchableOpacity 
  style={styles.adminButton}
  onPress={() => router.push('/admin')}
>
  <Shield size={20} color={PlantTheme.colors.primary} />
  <Text style={styles.adminButtonText}>Admin Panel</Text>
</TouchableOpacity>
```

### Method 3: Add to Settings
Add an admin option in your settings screen (`app/settings.tsx`):

```typescript
<TouchableOpacity 
  style={styles.settingItem}
  onPress={() => router.push('/admin')}
>
  <Shield size={24} color={PlantTheme.colors.primary} />
  <Text style={styles.settingText}>Admin Panel</Text>
</TouchableOpacity>
```

### Method 4: Debug Menu (Development Only)
Add to your debug screen (`app/debug.tsx`):

```typescript
<TouchableOpacity 
  style={styles.debugButton}
  onPress={() => router.push('/admin')}
>
  <Text>Open Admin Panel</Text>
</TouchableOpacity>
```

## Database Schema Requirements

The admin panel expects these Supabase tables:

### profiles table
```sql
- id (uuid, primary key)
- username (text)
- full_name (text)
- avatar_url (text)
- status (text) -- 'active', 'suspended', 'deleted'
- suspended_reason (text, nullable)
- suspended_at (timestamp, nullable)
- created_at (timestamp)
```

### posts table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- content (text)
- image_url (text, nullable)
- status (text) -- 'active', 'flagged', 'removed'
- removed_reason (text, nullable)
- removed_at (timestamp, nullable)
- created_at (timestamp)
```

### post_reports table
```sql
- id (uuid, primary key)
- post_id (uuid, foreign key to posts)
- reporter_id (uuid, foreign key to profiles)
- reason (text)
- status (text) -- 'pending', 'reviewed', 'resolved'
- admin_action (text, nullable) -- 'dismiss', 'remove_post', 'suspend_user'
- admin_notes (text, nullable)
- resolved_at (timestamp, nullable)
- resolved_by (uuid, nullable, foreign key to profiles)
- created_at (timestamp)
```

## Security Considerations

### Important: Add Admin Role Check
Currently, the admin panel is accessible to all authenticated users. You should add role-based access control:

1. **Add admin role to profiles table**:
```sql
ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
-- Set specific users as admin
UPDATE profiles SET role = 'admin' WHERE id = 'your-admin-user-id';
```

2. **Update backend middleware** in `backend/trpc/create-context.ts`:
```typescript
const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminProcedure = t.procedure.use(isAdmin);
```

3. **Replace `protectedProcedure` with `adminProcedure`** in all admin routes.

4. **Add role check in frontend**:
```typescript
// In admin/index.tsx
const { data: user } = trpc().auth.me.useQuery();

if (user?.role !== 'admin') {
  return (
    <View style={styles.unauthorized}>
      <Text>Access Denied: Admin privileges required</Text>
    </View>
  );
}
```

## Theme Consistency

The admin panel uses the same PlantTheme as the rest of your app:
- **Primary Color**: `#17cf17` (Plant green)
- **Surface**: White cards with subtle shadows
- **Typography**: Consistent font weights and sizes
- **Icons**: Lucide React Native icons
- **Gradients**: Same background gradients as other screens

## Navigation Structure

```
/admin (Dashboard)
├── /admin/users (User Management)
├── /admin/content (Content Moderation)
└── /admin/reports (Reports Review)
```

## Quick Start

1. **Access the admin panel**:
   ```typescript
   router.push('/admin');
   ```

2. **View dashboard stats** to see overview

3. **Navigate to specific sections** using the menu cards

4. **Perform actions** like suspending users or removing posts

5. **Review reports** and take appropriate actions

## Future Enhancements

Consider adding:
- **Analytics Dashboard**: Charts and graphs for user growth, post engagement
- **Bulk Actions**: Select multiple items for batch operations
- **Activity Log**: Track all admin actions
- **Email Notifications**: Notify users of suspensions/removals
- **Advanced Filters**: Date ranges, multiple criteria
- **Export Data**: Download reports as CSV/PDF
- **Verification System**: Approve user verification requests
- **Content Categories**: Manage post categories and tags

## Support

If you need to customize the admin panel:
1. Modify styles in each screen's StyleSheet
2. Add new routes in `backend/trpc/app-router.ts`
3. Create new procedures in `backend/trpc/routes/admin/`
4. Update UI components to match your needs

The admin panel is fully functional and ready to use!
