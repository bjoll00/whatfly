-- Add is_video column to post_images table
-- Run this migration in your Supabase SQL editor

ALTER TABLE post_images
ADD COLUMN IF NOT EXISTS is_video BOOLEAN DEFAULT FALSE;

-- Update existing rows to have is_video = false
UPDATE post_images SET is_video = FALSE WHERE is_video IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN post_images.is_video IS 'Indicates whether this media item is a video (true) or image (false)';

