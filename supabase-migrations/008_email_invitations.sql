-- =====================================================
-- EMAIL-BASED INVITATION SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create the home_invitations table
CREATE TABLE IF NOT EXISTS home_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(home_id, email) -- Can't invite same email to same home twice
);

-- 2. Enable RLS
ALTER TABLE home_invitations ENABLE ROW LEVEL SECURITY;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_home_invitations_email ON home_invitations(email);
CREATE INDEX IF NOT EXISTS idx_home_invitations_home_id ON home_invitations(home_id);
CREATE INDEX IF NOT EXISTS idx_home_invitations_status ON home_invitations(status);

-- 4. RLS Policies

-- Users can view invitations sent TO their email address
CREATE POLICY "Users can view their invitations"
ON home_invitations FOR SELECT
USING (
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Home owners can view all invitations for their home
CREATE POLICY "Owners can view home invitations"
ON home_invitations FOR SELECT
USING (
  home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner')
);

-- Home owners can create invitations
CREATE POLICY "Owners can create invitations"
ON home_invitations FOR INSERT
WITH CHECK (
  home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner')
  AND invited_by = auth.uid()
);

-- Users can update (accept/decline) invitations sent to their email
CREATE POLICY "Users can respond to their invitations"
ON home_invitations FOR UPDATE
USING (
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
)
WITH CHECK (
  LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Home owners can delete/cancel invitations
CREATE POLICY "Owners can delete invitations"
ON home_invitations FOR DELETE
USING (
  home_id IN (SELECT home_id FROM home_members WHERE user_id = auth.uid() AND role = 'owner')
);

-- 5. Function to get pending invitations for current user
CREATE OR REPLACE FUNCTION get_my_pending_invitations()
RETURNS TABLE (
  id UUID,
  home_id UUID,
  home_name TEXT,
  invited_by_email TEXT,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.home_id,
    h.name as home_name,
    (SELECT email FROM auth.users WHERE id = i.invited_by) as invited_by_email,
    i.created_at
  FROM home_invitations i
  JOIN homes h ON h.id = i.home_id
  WHERE LOWER(i.email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
    AND i.status = 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_pending_invitations() TO authenticated;

-- =====================================================
-- DONE! Run this in Supabase SQL Editor
-- =====================================================
