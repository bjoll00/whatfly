-- Add thumbnail_url column to post_images table for video thumbnails
-- Run this migration in your Supabase SQL editor

ALTER TABLE post_images
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment for clarity
COMMENT ON COLUMN post_images.thumbnail_url IS 'URL of the thumbnail image for videos. NULL for regular images.';

