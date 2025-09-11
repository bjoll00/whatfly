-- Add Custom Flies to WhatFly Database
-- Run this in your Supabase SQL editor

INSERT INTO flies (name, type, size, color, description, best_conditions) VALUES

-- Chubby Chernobyl - Large terrestrial dry fly
('Chubby Chernobyl', 'dry', '8', 'Black', 'Large, high-floating terrestrial pattern with foam body. Excellent for summer fishing when fish are looking up for large insects.', '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "high"], "time_of_day": ["morning", "afternoon"], "water_temperature_range": {"min": 50, "max": 80}}'),

-- Rainbow Warrior - Modern nymph pattern
('Rainbow Warrior', 'nymph', '16', 'Multi', 'Modern, flashy nymph pattern with rainbow tinsel. Highly effective in clear water and when fish are feeding on small nymphs.', '{"weather": ["sunny", "cloudy", "overcast"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["morning", "midday", "afternoon"], "water_temperature_range": {"min": 40, "max": 70}}'),

-- Perdigon - Spanish-style nymph
('Perdigon', 'nymph', '18', 'Black', 'Spanish-style nymph with tungsten bead. Sinks quickly and imitates small mayfly nymphs. Very effective in deep, fast water.', '{"weather": ["cloudy", "overcast", "rainy"], "water_clarity": ["clear", "slightly_murky", "murky"], "water_level": ["normal", "high"], "time_of_day": ["morning", "midday", "afternoon"], "water_temperature_range": {"min": 35, "max": 65}}'),

-- Frenchie - Modern midge pattern
('Frenchie', 'nymph', '20', 'Black', 'Modern midge pattern with flashy ribbing. Excellent for selective fish feeding on small midges. Works well in clear, cold water.', '{"weather": ["cloudy", "overcast"], "water_clarity": ["clear"], "water_level": ["normal", "low"], "time_of_day": ["morning", "midday", "afternoon"], "water_temperature_range": {"min": 35, "max": 60}}');

-- Verify the inserts
SELECT name, type, size, color FROM flies WHERE name IN ('Chubby Chernobyl', 'Rainbow Warrior', 'Perdigon', 'Frenchie');
