# Admin Quick Start Guide

## Your Admin Credentials

- **Email**: `harshaghvdt@gmail.com`
- **Password**: `#Harsha0PlantSpace`

## Quick Setup (3 Steps)

### 1. Register Your Account
Open the app and create an account with the credentials above.

### 2. Run SQL Commands
Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Add admin column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Make your account admin
UPDATE profiles 
SET is_admin = true 
WHERE email = 'harshaghvdt@gmail.com';

-- Verify (should show 1 row with is_admin = true)
SELECT id, email, name, username, is_admin 
FROM profiles 
WHERE email = 'harshaghvdt@gmail.com';
```

### 3. Access Admin Panel
1. Log in with your admin account
2. Go to Profile tab → Settings
3. Tap "Admin Panel" at the top
4. You're in! 🎉

## What You Can Do

- **Dashboard**: View stats (users, posts, reports)
- **Users**: Manage user accounts, suspend/activate users
- **Posts**: Review and remove flagged content
- **Reports**: Handle user reports and take action

## Adding More Admins Later

```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'another-admin@example.com';
```

## Need Help?

Check `ADMIN_SETUP.md` for detailed instructions and troubleshooting.
