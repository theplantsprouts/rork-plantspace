# PlantSpace Implementation Guide

## Overview

This document provides a comprehensive guide for completing the PlantSpace social media application implementation.

## Current Status

### ✅ Completed
1. Fixed dependency conflicts (React 18.x, lucide-react-native)
2. Migrated from Firebase to Supabase
3. Created Supabase authentication system
4. Updated package.json with correct dependencies
5. Created database schema for Supabase

### 🚧 In Progress
1. TRPC routes integration with Supabase
2. Real-time features migration

### ⏳ Pending
1. Complete missing features
2. Image upload optimization
3. Testing and verification

## Critical Fixes Needed

### 1. Install Dependencies

Run the following command to install updated dependencies:

```bash
npm install
```

Or with legacy peer deps if needed:

```bash
npm install --legacy-peer-deps
```

### 2. Database Setup

**IMPORTANT:** You must set up the Supabase database before the app will work.

1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to SQL Editor
3. Copy and execute the complete SQL script from `MIGRATION_SUMMARY.md`
4. Verify all tables, policies, and functions are created

### 3. Update Auth Imports

Throughout the codebase, update auth imports:

**Files that need updating:**
- `app/_layout.tsx`
- `app/index.tsx`
- `app/auth.tsx`
- `app/profile-setup.tsx`
- `app/(tabs)/profile.tsx`
- All other files importing from `@/hooks/use-auth`

**Change:**
```typescript
import { useAuth, isProfileComplete } from '@/hooks/use-auth';
```

**To:**
```typescript
import { useAuth, isProfileComplete } from '@/hooks/use-supabase-auth';
```

### 4. Remove Firebase Dependencies

**Files to delete or refactor:**
```
lib/firebase.ts
lib/firebase-chat.ts
hooks/use-realtime.ts (needs Supabase rewrite)
```

## Feature Implementation Priorities

### Priority 1: Core Authentication & Posts

**Status:** 🟡 Partially Complete

**Tasks:**
1. ✅ User registration with Supabase
2. ✅ User login with Supabase
3. ✅ Profile completion flow
4. ⏳ Post creation with Supabase
5. ⏳ Post listing with Supabase
6. ⏳ Image upload to Supabase Storage

**Implementation:**

Update `hooks/use-posts.ts` to use Supabase:

```typescript
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePosts() {
  const queryClient = useQueryClient();

  // Fetch posts
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            id,
            name,
            username,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async ({ content, image }: { content: string; image?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          image,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Toggle like mutation
  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost,
    toggleLike,
  };
}
```

### Priority 2: Real-time Features

**Status:** 🔴 Not Started

**Tasks:**
1. ⏳ Real-time post updates
2. ⏳ Real-time chat with Supabase Realtime
3. ⏳ Real-time notifications

**Implementation:**

Create `hooks/use-supabase-realtime.ts`:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimePosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Subscribe to posts changes
    const postsChannel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('Post change:', payload);
          // Handle INSERT, UPDATE, DELETE
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          }
        }
      )
      .subscribe();

    setChannel(postsChannel);

    return () => {
      postsChannel.unsubscribe();
    };
  }, []);

  return { posts, channel };
}
```

### Priority 3: Chat System

**Status:** 🔴 Needs Complete Rewrite

**Tasks:**
1. ⏳ Create messages table in Supabase
2. ⏳ Implement chat with Supabase Realtime
3. ⏳ Add message read receipts
4. ⏳ Add typing indicators

**Database Schema:**

```sql
-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
```

### Priority 4: Search & Discovery

**Status:** 🔴 Not Implemented

**Tasks:**
1. ⏳ User search functionality
2. ⏳ Post search with filters
3. ⏳ Discovery feed algorithm
4. ⏳ Trending posts

**Implementation:**

```typescript
// Search users
export async function searchUsers(query: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, username, avatar')
    .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
}

// Search posts
export async function searchPosts(query: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (
        id,
        name,
        username,
        avatar
      )
    `)
    .textSearch('content', query)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}
```

### Priority 5: Admin Panel

**Status:** 🟡 Partially Complete

**Tasks:**
1. ⏳ User management
2. ⏳ Content moderation
3. ⏳ Analytics dashboard
4. ⏳ Reports handling

**Database Schema:**

```sql
-- Add admin role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES profiles(id)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Performance Optimizations

### 1. Image Compression

Install and configure image compression:

```bash
npm install expo-image-manipulator
```

```typescript
import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
```

### 2. Virtualized Lists

Already implemented with `VirtualizedList` component.

### 3. Lazy Loading

Implement pagination for posts:

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: async ({ pageParam = 0 }) => {
    const { data } = await supabase
      .from('posts')
      .select()
      .range(pageParam, pageParam + 19)
      .order('created_at', { ascending: false });
    return data;
  },
  getNextPageParam: (lastPage, pages) => {
    return lastPage.length === 20 ? pages.length * 20 : undefined;
  },
});
```

## Testing

### Unit Tests

```bash
npm install --save-dev jest @testing-library/react-native
```

### E2E Tests

```bash
npm install --save-dev detox
```

## Deployment

### 1. Update Environment Variables

Create `.env.production`:

```
EXPO_PUBLIC_SUPABASE_URL=your_production_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_key
```

### 2. Build

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Web
npm run build
```

## Security Checklist

- [x] RLS policies enabled on all tables
- [ ] Input validation on all forms
- [ ] Rate limiting on API routes
- [ ] Secure image upload validation
- [ ] CORS properly configured
- [ ] Content Security Policy set
- [ ] XSS protection enabled
- [ ] SQL injection protection (via Supabase)

## Monitoring

### Setup Sentry

```bash
npm install @sentry/react-native
```

### Analytics

Already configured with analytics.ts

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Check Expo documentation: https://docs.expo.dev
3. Review MIGRATION_SUMMARY.md for database setup

## Timeline Estimate

- Week 1: Database setup, auth migration (✅ Complete)
- Week 2: Posts, real-time features migration
- Week 3: Chat system rewrite
- Week 4: Search, discovery, admin panel
- Week 5: Testing, optimization
- Week 6: Deployment and monitoring
