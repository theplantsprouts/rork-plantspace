# Admin Setup Guide

This guide will help you set up admin access for your PlantSpace application.

## Prerequisites

1. You must have a Supabase account set up
2. You must have created an account in the app with email: **harshaghvdt@gmail.com**
3. You must have access to the Supabase SQL Editor

## Step 1: Create Your Account in the App

**IMPORTANT**: Before running any SQL commands, you must first create your account in the app:

1. Open the PlantSpace app
2. Go to the registration/sign-up screen
3. Register with:
   - Email: `harshaghvdt@gmail.com`
   - Password: `#Harsha0PlantSpace`
4. Complete the profile setup if required
5. Log out after registration

## Step 2: Add is_admin Column to Profiles Table

Go to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
```

## Step 3: Make Your Account Admin

After creating your account in the app, run this SQL query in your Supabase SQL Editor:

```sql
-- Set admin status for harshaghvdt@gmail.com
UPDATE profiles 
SET is_admin = true 
WHERE email = 'harshaghvdt@gmail.com';
```

**Verify the update worked:**
```sql
-- This should return 1 row with is_admin = true
SELECT id, email, name, username, is_admin 
FROM profiles 
WHERE email = 'harshaghvdt@gmail.com';
```

## Step 3: Verify Admin Status

You can verify the admin status by running:

```sql
-- Check admin users
SELECT id, email, name, username, is_admin 
FROM profiles 
WHERE is_admin = true;
```

## Step 4: Access the Admin Panel

1. Log in to the app with your admin account (harshaghvdt@gmail.com)
2. Navigate to the Profile tab
3. Go to Settings
4. You should see an "Admin Panel" option at the top of the settings screen
5. Tap on it to access the admin dashboard

## Admin Panel Features

The admin panel includes:

- **Dashboard**: Overview of users, posts, and reports statistics
- **User Management**: View, suspend, and activate user accounts
- **Content Moderation**: Review and remove flagged posts
- **Reports**: Review and resolve user reports
- **Analytics**: View platform statistics and trends

## Adding More Admins (Future)

To add more admin users in the future, run this SQL query:

```sql
-- Replace 'user@example.com' with the email of the user you want to make admin
UPDATE profiles 
SET is_admin = true 
WHERE email = 'user@example.com';
```

## Security Notes

- Admin status is stored in the database and checked on every admin API call
- Only users with `is_admin = true` can access admin endpoints
- Regular users cannot see or access admin features
- Admin actions are logged for audit purposes

## Troubleshooting

If you can't access the admin panel:

1. Make sure you're logged in with the correct account
2. Verify the `is_admin` column exists in the profiles table
3. Check that your account has `is_admin = true` in the database
4. Try logging out and logging back in
5. Check the console for any error messages
