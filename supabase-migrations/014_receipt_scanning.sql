-- Create receipt_scans table
CREATE TABLE IF NOT EXISTS receipt_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL, -- Path in storage bucket
  scanned_data JSONB, -- AI extracted data: { amount, date, vendor, items: [] }
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected'))
);

-- Enable RLS
ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own receipt scans"
ON receipt_scans FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own receipt scans"
ON receipt_scans FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own receipt scans"
ON receipt_scans FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own receipt scans"
ON receipt_scans FOR DELETE
USING (user_id = auth.uid());

-- Storage Bucket Setup (Idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false) -- Private bucket, accessed via signed URLs or authenticated RLS
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Simplified for authenticated users)
-- Allow unlimited uploads for authenticated users to 'receipts' bucket
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts' AND auth.uid() = owner);

CREATE POLICY "Authenticated users can view their own receipts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipts' AND auth.uid() = owner);
