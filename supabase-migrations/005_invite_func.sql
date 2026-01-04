-- Secure function to look up home details by invite code
-- Bypasses RLS to allow non-members to validate an invite
CREATE OR REPLACE FUNCTION get_home_by_invite_code(lookup_code TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  invite_expires_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.name, h.invite_expires_at
  FROM homes h
  WHERE h.invite_code = lookup_code;
END;
$$ LANGUAGE plpgsql;

-- Grant execution to authenticated users (and anon if we wanted public invites, but auth is required for our flow)
GRANT EXECUTE ON FUNCTION get_home_by_invite_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_home_by_invite_code(TEXT) TO service_role;
