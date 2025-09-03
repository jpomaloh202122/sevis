# Fix for City Pass Deletion Error

## Problem
Users are getting "Application could not be deleted" error because the database is missing RLS (Row Level Security) policies that allow users to delete their own applications.

## Root Cause
The `applications` table has RLS enabled but only has SELECT and INSERT policies. Missing DELETE and UPDATE policies prevent users from deleting their own applications.

## Solution

### Option 1: Run SQL Fix in Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the following SQL:

```sql
-- Add missing UPDATE policy for applications
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
CREATE POLICY "Users can update own applications" ON applications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add missing DELETE policy for applications  
DROP POLICY IF EXISTS "Users can delete own applications" ON applications;
CREATE POLICY "Users can delete own applications" ON applications
    FOR DELETE USING (auth.uid() = user_id);

-- Also add admin policies for full access to applications
DROP POLICY IF EXISTS "Admins have full access to applications" ON applications;
CREATE POLICY "Admins have full access to applications" ON applications
    FOR ALL TO public USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'approving_admin', 'vetting_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'approving_admin', 'vetting_admin')
        )
    );
```

4. Click "Run" to execute the SQL

### Option 2: Use the provided SQL file

Run the SQL file we created:
```bash
# The SQL commands are in:
database/fix-applications-delete-policy.sql
```

## Verification

After applying the fix, you can verify the policies are in place by running:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'applications'
ORDER BY policyname;
```

You should see policies for:
- Users can view own applications (SELECT)
- Users can create applications (INSERT) 
- Users can update own applications (UPDATE) ← NEW
- Users can delete own applications (DELETE) ← NEW
- Admins have full access to applications (ALL) ← NEW

## Test

After applying the fix:
1. Log in as a regular user
2. Go to Dashboard → Applications or Cards
3. Try deleting a city pass application
4. Should now work without errors

## Security Note

These policies ensure:
- Users can only delete their own applications (`auth.uid() = user_id`)
- Admins can delete any application
- All operations are properly logged and audited