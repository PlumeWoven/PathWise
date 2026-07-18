# Roadmap Authentication Implementation - Verification Checklist

## Overview
This document provides a comprehensive checklist to verify the roadmap authentication implementation, which addresses the SQL row-level security violation when anonymous users try to mark stages complete.

## Implementation Summary

### Files Modified
1. **src/lib/authGuard.ts** - New utility for authentication enforcement
2. **src/routes/roadmap.tsx** - Added auth checks to critical actions

### Features Implemented
- ✅ Store roadmap ID in localStorage after anonymous quiz completion
- ✅ Protect "Mark Stage Complete" button with authentication check
- ✅ Redirect unauthenticated users to sign-in with claim parameters
- ✅ Claim anonymous roadmap after sign-in (already implemented in auth.tsx)
- ✅ Store pending roadmap ID for claim after authentication

## Verification Steps

### 1. Code Review
- [ ] Verify `src/lib/authGuard.ts` exists and exports `requireAuth` function
- [ ] Verify `requireAuth` properly stores `pendingRoadmapId` in localStorage
- [ ] Verify redirect URL includes `redirect` and `claim` query parameters
- [ ] Verify `src/routes/roadmap.tsx` imports `requireAuth`
- [ ] Verify auth check is placed before `completeStage` API call
- [ ] Verify auth check returns early if not authenticated

### 2. Anonymous Flow Verification
- [ ] Complete quiz as anonymous user
- [ ] Verify roadmap ID is stored in `localStorage.getItem("pathwise_roadmap_id")`
- [ ] Navigate to roadmap page (should load successfully)
- [ ] Try clicking "Mark Stage Complete" button
- [ ] Verify browser redirects to `/sign-in` with query parameters:
  - `redirect=/roadmap/{roadmapId}`
  - `claim={roadmapId}`

### 3. Sign-In Flow Verification
- [ ] Complete sign-in process
- [ ] Verify `auth.tsx` `claimAnonymousRecords` function is called
- [ ] Check browser console for no RLS policy violation errors
- [ ] Verify `localStorage.getItem("pendingRoadmapId")` is cleared after claim
- [ ] Navigate back to roadmap
- [ ] Verify user can now mark stages complete without errors

### 4. SQL RLS Policy Verification
- [ ] Check database RLS policies for `roadmaps` table
- [ ] Verify policy allows `UPDATE` only when `user_id` matches current user
- [ ] Verify policy allows `UPDATE` when `user_id` is NULL (for anonymous claim)
- [ ] Check database RLS policies for `diagnostic_results` table
- [ ] Verify policy allows `UPDATE` only when `user_id` matches current user
- [ ] Verify policy allows `UPDATE` when `user_id` is NULL (for anonymous claim)

### 5. Edge Cases Testing
- [ ] Try marking stage complete without roadmap ID
- [ ] Try accessing roadmap with invalid ID
- [ ] Try completing stages when already authenticated
- [ ] Try sign-out and sign-in again (verify claim still works)
- [ ] Try multiple anonymous roadmaps (verify correct one is claimed)

### 6. Error Handling Verification
- [ ] Verify error messages are displayed to user
- [ ] Verify auth guard handles network errors gracefully
- [ ] Verify no console errors on redirect

### 7. Database Verification
- [ ] Query `roadmaps` table to verify `user_id` is set after sign-in
- [ ] Query `diagnostic_results` table to verify `user_id` is set after sign-in
- [ ] Verify `user_id` is NULL for anonymous records
- [ ] Verify `user_id` is NOT NULL after claim

### 8. User Experience Verification
- [ ] Verify redirect is smooth (no flash of unauthenticated content)
- [ ] Verify claim happens automatically without user intervention
- [ ] Verify user is returned to correct roadmap page
- [ ] Verify "Mark Stage Complete" button shows loading state
- [ ] Verify confetti animation still works after authentication

### 9. Security Verification
- [ ] Verify only the owner of a roadmap can mark it complete
- [ ] Verify anonymous users cannot modify other users' roadmaps
- [ ] Verify claim logic only runs once per sign-in
- [ ] Verify no sensitive data is exposed in query parameters

### 10. Regression Testing
- [ ] Verify existing authenticated users can still mark stages complete
- [ ] Verify dashboard still loads correctly
- [ ] Verify other pages are not affected by auth changes
- [ ] Verify no breaking changes to quiz flow

## Expected Behavior

### Before Authentication
1. Anonymous user completes quiz
2. Roadmap ID stored in localStorage
3. Roadmap page loads successfully
4. "Mark Stage Complete" button is visible for active stage
5. Clicking button redirects to sign-in

### After Authentication
1. User completes sign-in
2. `claimAnonymousRecords` runs in `auth.tsx`
3. Roadmap ID moved from anonymous to authenticated user
4. User returned to roadmap page
5. "Mark Stage Complete" button works without errors
6. Confetti animation plays
6. Stage marked as complete in database

## SQL Error Reference

### Before Fix
```
[quiz] handleBuildRoadmap error 
Object { code: "42501", details: null, hint: null, message: 'new row violates row-level security policy for table "diagnostic_results"' }
```

### After Fix
No RLS policy violations. Roadmap ownership is properly enforced through:
1. RLS policies on `roadmaps` table
2. RLS policies on `diagnostic_results` table
3. Authentication checks before mutations
4. Anonymous-to-authenticated ownership transfer

## Troubleshooting

### Issue: RLS Policy Still Violated
**Check:**
- Verify RLS policies allow `UPDATE` with `user_id` is NULL
- Verify policies use `USING` clause correctly
- Verify policies are applied to all relevant columns

### Issue: Roadmap Not Claimed After Sign-In
**Check:**
- Verify `claimAnonymousRecords` is called in `auth.tsx`
- Verify `localStorage.getItem("pathwise_roadmap_id")` exists
- Check browser console for errors in `claimAnonymousRecords`
- Verify `claim` query parameter is passed correctly

### Issue: Redirect Not Working
**Check:**
- Verify `requireAuth` function is imported correctly
- Verify redirect URL includes required parameters
- Check for JavaScript errors in browser console
- Verify `sign-in` route exists in router

## Success Criteria

✅ Anonymous users can view their roadmap
✅ Anonymous users are blocked from marking stages complete
✅ Sign-in redirects anonymous users properly
✅ Roadmap ownership is transferred after sign-in
✅ No SQL RLS policy violations occur
✅ Confetti animation still works
✅ User experience is smooth and intuitive
✅ Security is properly enforced

## Notes

- The `claimAnonymousRecords` function in `auth.tsx` already handles the database update
- The `requireAuth` utility handles the user experience flow
- RLS policies must be configured in Supabase to allow anonymous-to-authenticated ownership transfer
- This implementation follows the same pattern as `diagnostic_results` claim logic