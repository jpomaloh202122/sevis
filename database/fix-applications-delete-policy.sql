-- Fix for missing DELETE and UPDATE policies on applications table
-- Run this in your Supabase SQL Editor to allow users to delete their own applications

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

-- Verify policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'applications'
ORDER BY policyname;