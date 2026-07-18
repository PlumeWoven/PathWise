# SQL Deployment Debug Plan

## Executive Summary

**Error Identified:** PostgreSQL Row-Level Security Policy Violation  
**Error Code:** `42501` (insufficient privilege)  
**Error Message:** `'new row violates row-level security policy for table "diagnostic_results"'`  
**Affected Feature:** Quiz → Build My Roadmap (see roadmap)  
**Affected Component:** `src/routes/quiz.tsx` → `handleBuildRoadmap()` function  
**Deployment Environment:** Vercel (production) - NOT local development

---

## 1. SQL Issue Analysis

### Root Cause
The `handleBuildRoadmap()` function is attempting to insert a diagnostic result into the `diagnostic_results` table, but the database's Row-Level Security (RLS) policy is blocking the write operation.

### Error Details
- **Error Code:** `42501` - PostgreSQL "insufficient privilege" error
- **Table:** `diagnostic_results`
- **Policy Type:** Row-Level Security (RLS)
- **Action:** INSERT operation
- **Constraint:** New row violates RLS policy

### Why This Happens in Production (Vercel) but Not Locally

1. **Database Connection Differences:**
   - Local: Uses authenticated Supabase client with proper user context
   - Vercel: May use different authentication context or RLS configuration

2. **Environment-Specific RLS Policies:**
   - RLS policies might be different in production vs. development
   - Production database might have stricter policies

3. **Authentication Context:**
   - Vercel serverless functions might not have the same auth session as client-side code
   - User authentication might not be properly propagated

---

## 2. Investigation Steps

### Step 1: Verify Database Schema and RLS Policies
**Location:** Supabase Dashboard → SQL Editor

Run these queries to inspect the `diagnostic_results` table structure and RLS policies:

```sql
-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'diagnostic_results'
ORDER BY ordinal_position;

-- 2. Check RLS policy status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'diagnostic_results';

-- 3. List all RLS policies on the table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'diagnostic_results';
```

### Step 2: Check API Implementation
**File:** `src/pathwise/api.ts`

Inspect the `saveDiagnosticResult()` function to understand:
- How it constructs the database query
- Whether it uses Supabase client or direct SQL
- How authentication is handled

### Step 3: Verify Authentication Flow
**File:** `src/pathwise/api.ts` → `getCurrentUser()`

Check if:
- User authentication is properly passed to the database
- The auth session is valid at the time of the insert
- Anonymous users (no session) are allowed

### Step 4: Test with Enhanced Logging
**File:** `src/routes/quiz.tsx` (already updated)

The enhanced error logging will provide:
- Current user ID (or "anonymous")
- Full request payload
- Complete error object

**Next Steps After Testing:**
1. Reproduce the error in production
2. Check browser console for the detailed error output
3. Compare with local behavior

---

## 3. Proposed Solutions

### Solution A: Fix RLS Policy (Recommended for Production)

**Approach:** Update RLS policy to allow authenticated users to insert their own diagnostic results.

```sql
-- Enable RLS on the table
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to insert their own records
CREATE POLICY "Users can insert their own diagnostic results"
ON diagnostic_results
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

-- Create policy for authenticated users to read their own records
CREATE POLICY "Users can read their own diagnostic results"
ON diagnostic_results
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);
```

**Pros:**
- Fixes the issue at the database level
- Secure and follows best practices
- Works for all users

**Cons:**
- Requires database access and migration
- Might affect other parts of the application

### Solution B: Fix Authentication Context

**Approach:** Ensure the Supabase client is properly authenticated when making the insert request.

**Implementation:**
1. Verify the Supabase client initialization in `src/pathwise/api.ts`
2. Ensure the auth session is passed to the database client
3. Test with both authenticated and anonymous users

**Pros:**
- No database schema changes needed
- Addresses potential auth flow issues

**Cons:**
- Might be a band-aid if the real issue is RLS policy
- Requires testing with different user types

### Solution C: Create API Route for Roadmap Generation

**Approach:** Move the database operations to a serverless API route that handles authentication.

**Implementation:**
1. Create `api/quiz-submit.ts` (serverless function)
2. Handle authentication on the server side
3. Perform database operations with elevated privileges

**Pros:**
- Keeps sensitive logic on the server
- Better separation of concerns
- Easier to debug server-side issues

**Cons:**
- More complex architecture
- Requires additional API route setup

---

## 4. Recommended Fix

**Primary Recommendation:** Solution A (Fix RLS Policy)

**Rationale:**
1. The error message explicitly states "violates row-level security policy"
2. This is a common issue in production environments
3. Fixing at the policy level is the cleanest solution

**Implementation Plan:**

1. **Backup Current Policies** (before making changes)
   ```sql
   -- Backup existing policies
   CREATE TABLE rls_policy_backup AS
   SELECT * FROM pg_policies WHERE tablename = 'diagnostic_results';
   ```

2. **Apply Fix** (in Supabase Dashboard → SQL Editor)
   ```sql
   -- Enable RLS if not already enabled
   ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;
   
   -- Allow authenticated users to insert their own records
   CREATE POLICY "Users can insert their own diagnostic results"
   ON diagnostic_results
   FOR INSERT
   TO authenticated
   WITH CHECK (
       user_id = auth.uid()
   );
   
   -- Allow authenticated users to read their own records
   CREATE POLICY "Users can read their own diagnostic results"
   ON diagnostic_results
   FOR SELECT
   TO authenticated
   USING (
       user_id = auth.uid()
   );
   ```

3. **Verify Fix**
   - Test the quiz flow in production
   - Check that diagnostic results are saved
   - Verify roadmap generation works

4. **Test Edge Cases**
   - Anonymous users (no auth)
   - Different user roles
   - Concurrent requests

---

## 5. Stakeholder Communication

### Pitch to Stakeholders

**Title:** Fixing Quiz Roadmap Generation - Database RLS Policy Issue

**Summary:**
The quiz feature is failing in production due to a Row-Level Security (RLS) policy that's blocking diagnostic result insertions. This is a common security best practice that prevents unauthorized data access.

**Impact:**
- Users cannot complete the quiz and generate roadmaps
- This blocks a key user flow
- Error is occurring consistently in production

**Solution:**
Update the RLS policy to allow authenticated users to insert their own diagnostic results. This is a standard, secure approach that follows database best practices.

**Benefits:**
- Restores quiz functionality immediately
- Maintains data security
- No code changes required in the application

**Timeline:**
- Immediate fix via SQL migration
- Testing and verification: 30 minutes

**Risk Level:** Low
- Standard database security fix
- No application code changes needed
- Can be rolled back if necessary

---

## 6. Audit Checklist

### Pre-Implementation
- [ ] Document current RLS policies
- [ ] Backup existing database policies
- [ ] Test fix in development environment first
- [ ] Prepare rollback plan

### Implementation
- [ ] Apply RLS policy changes via SQL
- [ ] Verify policies are applied correctly
- [ ] Check that table structure hasn't changed
- [ ] Test with different user types (authenticated, anonymous)

### Post-Implementation
- [ ] Reproduce the original error in development
- [ ] Verify the fix resolves the issue
- [ ] Test quiz flow end-to-end
- [ ] Check roadmap generation works
- [ ] Verify diagnostic results are saved correctly
- [ ] Monitor for any new errors
- [ ] Check database logs for any warnings

### Verification
- [ ] Test with authenticated user
- [ ] Test with anonymous user (if allowed)
- [ ] Verify data integrity
- [ ] Check performance impact
- [ ] Document the fix for future reference

### Documentation
- [ ] Update database schema documentation
- [ ] Update RLS policy documentation
- [ ] Note any assumptions made
- [ ] Document rollback procedure if needed

---

## 7. Rollback Plan

If the fix causes issues:

```sql
-- Restore original policies from backup
DROP POLICY IF EXISTS "Users can insert their own diagnostic results" ON diagnostic_results;
DROP POLICY IF EXISTS "Users can read their own diagnostic results" ON diagnostic_results;

-- Restore backup policies (if available)
-- This would require the backup table to be populated
```

---

## 8. Next Steps

1. **Immediate Action:** Review this plan with the team
2. **Decision:** Choose the appropriate solution (A, B, or C)
3. **Implementation:** Apply the fix in Supabase
4. **Testing:** Verify the fix works in production
5. **Monitoring:** Watch for any related issues

---

**Document Version:** 1.0  
**Created:** 2026-07-16  
**Author:** AI Debugging Assistant  
**Status:** Ready for Implementation