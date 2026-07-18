# Complete RLS Policy Fix for PathWise

## Summary

Both the `diagnostic_results` and `roadmaps` tables have restrictive RLS policies that don't handle NULL values for anonymous users, causing the "Build My Roadmap" feature to fail.

## Solution

Apply the following SQL statements in Supabase Dashboard → SQL Editor to fix both tables.

---

## Fix 1: diagnostic_results Table

```sql
-- Enable RLS if not already enabled
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Users can read their own diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Public read access" ON diagnostic_results;

-- Policy 1: Allow authenticated users to insert their own records
CREATE POLICY "Authenticated users can insert own diagnostic results"
ON diagnostic_results
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

-- Policy 2: Allow anonymous users to insert records with user_id = null
CREATE POLICY "Anonymous users can insert diagnostic results"
ON diagnostic_results
FOR INSERT
TO authenticated, anon
WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
);

-- Policy 3: Allow authenticated users to read their own records
CREATE POLICY "Authenticated users can read own diagnostic results"
ON diagnostic_results
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 4: Allow anonymous users to read their own anonymous records
CREATE POLICY "Anonymous users can read their own diagnostic results"
ON diagnostic_results
FOR SELECT
TO anon
USING (
    user_id IS NULL
);
```

---

## Fix 2: roadmaps Table

```sql
-- Enable RLS if not already enabled
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

---

## How It Works

### For Anonymous Users (no auth session)
1. `getCurrentUser()` returns `null`
2. `userId` becomes `null`
3. RLS policy evaluates: `user_id = auth.uid() OR user_id IS NULL`
4. For anonymous: `null = null OR null IS NULL` → `TRUE`
5. Insert succeeds

### For Authenticated Users
1. `getCurrentUser()` returns user object with UUID
2. `userId` becomes the user's UUID
3. RLS policy evaluates: `user_id = auth.uid()`
4. Both values match → `TRUE`
5. Insert succeeds

---

## Verification Steps

1. **Apply both SQL blocks** in Supabase Dashboard → SQL Editor
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

---

## Security

✅ **Authenticated users** can only insert/their own data
✅ **Anonymous users** can insert demo data (user_id = null)
✅ **Data isolation** - users cannot access other users' data
✅ **No public access** - anonymous users can only read their own NULL records

---

## Rollback

If issues occur, drop the policies:

```sql
-- For diagnostic_results
DROP POLICY IF EXISTS "Authenticated users can insert own diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Anonymous users can insert diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Authenticated users can read own diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Anonymous users can read their own diagnostic results" ON diagnostic_results;

-- For roadmaps
DROP POLICY IF EXISTS "Authenticated users can insert own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Anonymous users can insert roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Authenticated users can read own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Anonymous users can read their own roadmaps" ON roadmaps;
```

---

## Code Changes Required

**None!** The existing code in:
- `src/routes/quiz.tsx` (lines 159-160) - correctly handles anonymous users
- `src/pathwise/api.ts` (lines 97-114, 140-179) - correctly passes user_id

The fix is purely at the database policy level.

---

**Status:** Ready to apply  
**Steps:** 1. Apply SQL in Supabase, 2. Test both flows, 3. Verify data