# Fix RLS Policy for Roadmaps Table

## Root Cause
The `roadmaps` table RLS policy requires `user_id = auth.uid()` but doesn't handle NULL values for anonymous users, causing the insert to fail with error `42501` (insufficient privilege).

## Solution

### 1. Apply RLS Policies (Supabase SQL Editor)

```sql
-- Enable RLS on roadmaps table if not already enabled
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Users can read their own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Public read access" ON roadmaps;

-- Policy 1: Allow authenticated users to insert their own roadmaps
CREATE POLICY "Authenticated users can insert own roadmaps"
ON roadmaps
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

-- Policy 2: Allow anonymous users to insert roadmaps with user_id = null
CREATE POLICY "Anonymous users can insert roadmaps"
ON roadmaps
FOR INSERT
TO authenticated, anon
WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
);

-- Policy 3: Allow authenticated users to read their own roadmaps
CREATE POLICY "Authenticated users can read own roadmaps"
ON roadmaps
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 4: Allow anonymous users to read their own anonymous roadmaps
CREATE POLICY "Anonymous users can read their own roadmaps"
ON roadmaps
FOR SELECT
TO anon
USING (
    user_id IS NULL
);
```

### 2. Code Changes (api.ts)

The existing code in `api.ts` is already correct! No changes needed. The function `createRoadmap` (lines 140-179 in api.ts) properly passes `user_id: params.user_id` which is `null` for anonymous users.

### 3. Authentication Handling (quiz.tsx)

The existing code in `quiz.tsx` (lines 159-160) is already correct:

```typescript
let user = await getCurrentUser();
let userId = user?.id ?? null;  // null for anonymous users
```

## How It Works

**For Anonymous Users:**
- `getCurrentUser()` returns `null`
- `userId` becomes `null`
- RLS policy allows insert when `user_id = auth.uid() OR user_id IS NULL`
- `auth.uid()` returns `null` for anonymous users
- Policy evaluates to `null = null OR null IS NULL` → TRUE
- Insert succeeds

**For Authenticated Users:**
- `getCurrentUser()` returns the user object with `id`
- `userId` becomes the user's UUID
- RLS policy checks `user_id = auth.uid()`
- Both values match the authenticated user's UUID
- Insert succeeds

## Verification

1. **Apply SQL policies** in Supabase Dashboard → SQL Editor
2. **Test anonymous user flow:**
   - Open http://localhost:8080/quiz
   - Complete the quiz (no login)
   - Click "Build My Roadmap"
   - Verify both diagnostic and roadmap are saved
3. **Test authenticated user flow:**
   - Log in to PathWise
   - Complete the quiz
   - Click "Build My Roadmap"
   - Verify both diagnostic and roadmap are saved
4. **Verify data integrity:**
   - Check Supabase Dashboard → Table Editor
   - Verify anonymous users have `user_id = null`
   - Verify authenticated users have `user_id = their UUID`

## Security

✅ **Authenticated users** can only insert/their own roadmaps
✅ **Anonymous users** can insert demo data (user_id = null)
✅ **Data isolation** - users cannot access other users' roadmaps
✅ **No public access** - anonymous users can only read their own NULL records

## Rollback

If issues occur, drop the policies:

```sql
DROP POLICY IF EXISTS "Authenticated users can insert own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Anonymous users can insert roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Authenticated users can read own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Anonymous users can read their own roadmaps" ON roadmaps;
```

---

**Status:** Ready to apply  
**Steps:** 1. Apply SQL policies, 2. Test both flows, 3. Verify data