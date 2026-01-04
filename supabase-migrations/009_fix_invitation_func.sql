-- Fix the get_my_pending_invitations function
-- Run this in Supabase SQL Editor

DROP FUNCTION IF EXISTS get_my_pending_invitations();

CREATE FUNCTION get_my_pending_invitations()
RETURNS TABLE (
  invitation_id UUID,
  home_id UUID,
  home_name TEXT,
  invited_by_email TEXT,
  invitation_created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT 
    i.id,
    i.home_id,
    h.name,
    (SELECT u.email FROM auth.users u WHERE u.id = i.invited_by),
    i.created_at
  FROM home_invitations i
  JOIN homes h ON h.id = i.home_id
  WHERE LOWER(i.email) = LOWER((SELECT u2.email FROM auth.users u2 WHERE u2.id = auth.uid()))
    AND i.status = 'pending';
$$;

GRANT EXECUTE ON FUNCTION get_my_pending_invitations() TO authenticated;
