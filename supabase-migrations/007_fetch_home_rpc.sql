-- Secure function to fetch the current user's active home data
-- Bypasses RLS to ensure data is always available for members
-- Combines membership and home details in one efficient query
CREATE OR REPLACE FUNCTION get_user_active_home()
RETURNS TABLE (
  id UUID,
  name TEXT,
  invite_code TEXT,
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  created_by UUID,
  role TEXT,
  joined_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id, 
    h.name, 
    h.invite_code, 
    h.invite_expires_at, 
    h.created_at, 
    h.created_by,
    m.role, 
    m.joined_at
  FROM home_members m
  JOIN homes h ON h.id = m.home_id
  WHERE m.user_id = auth.uid()
  ORDER BY m.joined_at DESC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_active_home() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_active_home() TO service_role;
