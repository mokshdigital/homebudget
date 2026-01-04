-- Add a simple, non-recursive policy to ensure users can ALWAYS view their own membership records
-- This fixes issues where the complex group-view policy might lag or fail for new joins
CREATE POLICY "Users can view own membership"
ON home_members FOR SELECT
USING (
  user_id = auth.uid()
);
