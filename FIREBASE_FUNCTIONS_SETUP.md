# Firebase Functions Setup Guide

This guide will help you set up Firebase Functions for server-side logic in your PlantSpace app.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized
3. Node.js 18+ installed

## Setup Steps

### 1. Initialize Firebase Functions

```bash
# In your project root
firebase init functions

# Select:
# - Use an existing project (plantspace-5a93d)
# - TypeScript
# - Use ESLint
# - Install dependencies now
```

### 2. Project Structure

After initialization, you'll have:
```
functions/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

### 3. Install Additional Dependencies

```bash
cd functions
npm install firebase-admin @types/node
npm install --save-dev @types/express
```

## Example Functions

### 1. Send Push Notifications

```typescript
// functions/src/notifications.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const sendNotificationOnNewPost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const postData = snap.data();
    const postId = context.params.postId;
    
    // Get all user tokens (you might want to implement following logic)
    const tokensSnapshot = await admin.firestore()
      .collection('push_tokens')
      .get();
    
    const tokens: string[] = [];
    tokensSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.token && doc.id !== postData.author_id) {
        tokens.push(data.token);
      }
    });
    
    if (tokens.length === 0) return;
    
    // Get author info
    const authorDoc = await admin.firestore()
      .collection('profiles')
      .doc(postData.author_id)
      .get();
    
    const authorName = authorDoc.data()?.name || 'Someone';
    
    const message = {
      notification: {
        title: 'New Post',
        body: `${authorName} shared a new post: ${postData.content.substring(0, 50)}...`,
      },
      data: {
        postId,
        authorId: postData.author_id,
        type: 'new_post',
      },
      tokens,
    };
    
    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Successfully sent notifications:', response.successCount);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  });
```

### 2. Clean Up Old Data

```typescript
// functions/src/cleanup.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const cleanupOldAnalytics = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldAnalytics = await admin.firestore()
      .collection('analytics')
      .where('timestamp', '<', thirtyDaysAgo.toISOString())
      .get();
    
    const batch = admin.firestore().batch();
    oldAnalytics.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${oldAnalytics.size} old analytics records`);
  });
```

### 3. User Management

```typescript
// functions/src/users.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  // Create user profile document
  await admin.firestore()
    .collection('profiles')
    .doc(user.uid)
    .set({
      email: user.email,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      followers: 0,
      following: 0,
    });
  
  console.log('Created profile for user:', user.uid);
});

export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  const batch = admin.firestore().batch();
  
  // Delete user profile
  batch.delete(admin.firestore().collection('profiles').doc(user.uid));
  
  // Delete user's posts
  const userPosts = await admin.firestore()
    .collection('posts')
    .where('author_id', '==', user.uid)
    .get();
  
  userPosts.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  // Delete push token
  batch.delete(admin.firestore().collection('push_tokens').doc(user.uid));
  
  await batch.commit();
  console.log('Cleaned up data for deleted user:', user.uid);
});
```

### 4. Content Moderation

```typescript
// functions/src/moderation.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const moderatePost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const postData = snap.data();
    const postId = context.params.postId;
    
    // Simple content moderation (you can integrate with AI services)
    const bannedWords = ['spam', 'inappropriate', 'banned'];
    const content = postData.content.toLowerCase();
    
    const containsBannedWords = bannedWords.some(word => 
      content.includes(word)
    );
    
    if (containsBannedWords) {
      // Flag the post for review
      await snap.ref.update({
        flagged: true,
        flagged_at: admin.firestore.FieldValue.serverTimestamp(),
        flagged_reason: 'Contains banned words',
      });
      
      console.log('Flagged post for review:', postId);
    }
  });
```

### 5. Main Index File

```typescript
// functions/src/index.ts
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export * from './notifications';
export * from './cleanup';
export * from './users';
export * from './moderation';
```

## Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:sendNotificationOnNewPost

# View logs
firebase functions:log
```

## Environment Variables

Set up environment variables for your functions:

```bash
# Set environment variables
firebase functions:config:set someservice.key="THE API KEY"

# Get current config
firebase functions:config:get
```

## Security Rules Integration

Your functions run with admin privileges, so they can bypass Firestore security rules. This is useful for:

- Sending notifications to all users
- Cleaning up data
- Content moderation
- Analytics aggregation

## Monitoring

- View function logs in Firebase Console
- Set up alerts for function failures
- Monitor function performance and costs

## Best Practices

1. **Error Handling**: Always wrap function code in try-catch blocks
2. **Timeouts**: Set appropriate timeout values for long-running functions
3. **Batching**: Use batched writes for multiple Firestore operations
4. **Caching**: Cache frequently accessed data
5. **Testing**: Write unit tests for your functions

## Local Development

```bash
# Install Firebase emulator
firebase init emulators

# Start emulators
firebase emulators:start

# Your functions will be available at:
# http://localhost:5001/plantspace-5a93d/us-central1/functionName
```

This setup provides a robust server-side foundation for your PlantSpace app with push notifications, data cleanup, user management, and content moderation.