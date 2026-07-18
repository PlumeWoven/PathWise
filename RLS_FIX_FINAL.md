# Fix RLS Policy for diagnostic_results and roadmaps Tables

## Solution

Apply these SQL statements in Supabase Dashboard → SQL Editor to fix both tables.

**Important:** This SQL uses dynamic SQL to drop ALL existing policies and recreate them with the correct configuration.

---

## Fix 1: diagnostic_results Table

```sql
-- Enable RLS if not already enabled
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies using dynamic SQL (aggressive approach)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'diagnostic_results'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON diagnostic_results', policy_record.policyname);
    END LOOP;
END $$;

-- Create policies that support both authenticated and anonymous users

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

-- Policy 5: Allow authenticated users to update their own records
CREATE POLICY "Authenticated users can update own diagnostic results"
ON diagnostic_results
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 6: Allow authenticated users to delete their own records
CREATE POLICY "Authenticated users can delete own diagnostic results"
ON diagnostic_results
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
);
```

---

## Fix 2: roadmaps Table

```sql
-- Enable RLS if not already enabled
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies using dynamic SQL (aggressive approach)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'roadmaps'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON roadmaps', policy_record.policyname);
    END LOOP;
END $$;

-- Create policies that support both authenticated and anonymous users

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

-- Policy 5: Allow authenticated users to update their own roadmaps
CREATE POLICY "Authenticated users can update own roadmaps"
ON roadmaps
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
);

-- Policy 6: Allow authenticated users to delete their own roadmaps
CREATE POLICY "Authenticated users can delete own roadmaps"
ON roadmaps
FOR DELETE
TO authenticated
USING (
    user_id = auth.uid()
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

✅ **Authenticated users** can only insert/update/delete their own data
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
DROP POLICY IF EXISTS "Authenticated users can update own diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Authenticated users can delete own diagnostic results" ON diagnostic_results;

-- For roadmaps
DROP POLICY IF EXISTS "Authenticated users can insert own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Anonymous users can insert roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Authenticated users can read own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Anonymous users can read their own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Authenticated users can update own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Authenticated users can delete own roadmaps" ON roadmaps;
```

---

**Status:** Ready to apply  
**Steps:** 1. Copy SQL from this file, 2. Paste in Supabase SQL Editor, 3. Test both flows, 4. Verify data