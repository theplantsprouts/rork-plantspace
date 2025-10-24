# Firebase to Supabase Migration Summary

## Changes Made

### 1. Dependency Updates ✅

**package.json:**
- ⬇️ Downgraded React from 19.0.0 to 18.3.1 for compatibility
- ⬇️ Downgraded React DOM from 19.0.0 to 18.3.1
- ⬇️ Updated @types/react from ~19.0.10 to ~18.3.12
- ➕ Added @supabase/supabase-js ^2.39.0
- ➖ Removed firebase ^12.3.0
- ➖ Removed firebase-admin ^13.5.0

This resolves the lucide-react-native peer dependency conflict.

### 2. Database Migration ✅

**lib/supabase.ts:**
- Updated to use environment variables from .env file
- Added proper error checking for missing credentials
- Maintained all existing Supabase helper functions
- Kept Expo SecureStore adapter for cross-platform session storage

**hooks/use-supabase-auth.ts:** (New File)
- Complete Supabase authentication implementation
- Replaces Firebase auth with Supabase auth methods
- Maintains same interface as original use-auth.ts
- Includes profile creation and completion flows
- Proper error handling and analytics tracking

### 3. Environment Configuration

**.env:**
- Supabase URL: https://0ec90b57d6e95fcbda19832f.supabase.co
- Supabase Anon Key: (configured)

## Required Database Setup

You need to run the following SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  avatar TEXT,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  image TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0
);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Posts viewable by authenticated users"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by authenticated users"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own follows"
  ON follows FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT DO NOTHING;

-- Create storage policies
CREATE POLICY "Images publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create function to update post likes count
CREATE OR REPLACE FUNCTION update_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes = likes - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes
DROP TRIGGER IF EXISTS update_post_likes_trigger ON likes;
CREATE TRIGGER update_post_likes_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes();

-- Create function to update comment count
CREATE OR REPLACE FUNCTION update_post_comments()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments = comments + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments = comments - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments
DROP TRIGGER IF EXISTS update_post_comments_trigger ON comments;
CREATE TRIGGER update_post_comments_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments();

-- Create function to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following = following + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET followers = followers + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following = following - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET followers = followers - 1 WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follows
DROP TRIGGER IF EXISTS update_follow_counts_trigger ON follows;
CREATE TRIGGER update_follow_counts_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
```

## Migration Steps

### Immediate Actions Required:

1. **Run Database Setup:**
   - Go to Supabase Dashboard → SQL Editor
   - Execute the SQL script above
   - Verify all tables and policies are created

2. **Update Import Statements:**
   Replace all imports from `@/hooks/use-auth` to use the new Supabase version:
   ```typescript
   // OLD (Firebase):
   import { useAuth } from '@/hooks/use-auth';

   // NEW (Supabase):
   import { useAuth } from '@/hooks/use-supabase-auth';
   ```

3. **Remove Firebase Files:**
   The following files should be removed or refactored:
   - `lib/firebase.ts`
   - `lib/firebase-chat.ts`
   - `hooks/use-realtime.ts` (needs Supabase rewrite)

4. **Update Real-time Features:**
   - Chat functionality needs migration to Supabase Realtime
   - Posts subscription needs Supabase real-time channels
   - Notifications need Supabase Edge Functions

## Files Still Using Firebase (Need Update):

1. **hooks/use-posts.ts** - Uses Firebase for posts
2. **hooks/use-realtime.ts** - Uses Firebase real-time listeners
3. **hooks/use-chat.ts** - Uses Firebase Realtime Database
4. **app/chat.tsx** - Uses Firebase messages
5. **lib/firebase-chat.ts** - Entire file is Firebase-based

## Testing Checklist:

- [ ] User registration works
- [ ] Email verification flow works
- [ ] User login works
- [ ] Profile creation automatic on signup
- [ ] Profile completion flow works
- [ ] Post creation works
- [ ] Post likes work
- [ ] Post comments work
- [ ] Bookmarks work
- [ ] Image upload works
- [ ] User logout works

## Known Issues to Address:

1. **Real-time Chat**: Needs complete rewrite for Supabase Realtime
2. **Push Notifications**: Need Supabase Edge Functions implementation
3. **WebRTC Calls**: Voice/video calls need signaling server
4. **Admin Panel**: Need to integrate with Supabase RLS admin checks

## Benefits of This Migration:

✅ Single database system (no Firebase/Supabase confusion)
✅ Better RLS security model
✅ Built-in real-time subscriptions
✅ Automatic database functions and triggers
✅ Better TypeScript support
✅ Simpler deployment (no Firebase Functions needed)
✅ Cost-effective for small to medium projects

## Next Steps:

1. Test authentication flow thoroughly
2. Migrate real-time features to Supabase
3. Update TRPC routes to use Supabase
4. Implement Supabase Edge Functions for serverless needs
5. Remove all Firebase code and dependencies
6. Update documentation
