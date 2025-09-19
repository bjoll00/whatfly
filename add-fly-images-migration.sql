-- Migration to add image and link fields to flies table
-- Run this in your Supabase SQL editor

-- Add image column to flies table
ALTER TABLE flies ADD COLUMN IF NOT EXISTS image TEXT;

-- Add link column to flies table
ALTER TABLE flies ADD COLUMN IF NOT EXISTS link TEXT;

-- Update existing Elk Hair Caddis entry to include image and link
UPDATE flies 
SET image = 'Caddis_fly.png',
    link = 'https://www.flyfishfood.com/products/hackle-stacker-caddis-tan'
WHERE name = 'Elk Hair Caddis';

-- Add image and link fields to future fly inserts
-- These fields will be included in new fly entries going forward
