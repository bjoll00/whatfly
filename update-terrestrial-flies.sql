-- Update terrestrial flies to only suggest during warm seasons
-- Run this in your Supabase SQL editor

-- Update Chernobyl Ant to only suggest during warm seasons
UPDATE flies 
SET best_conditions = '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "high"], "time_of_day": ["summer", "late_summer", "early_fall"], "water_temperature_range": {"min": 50, "max": 80}}'
WHERE name = 'Chernobyl Ant';

-- Update Chubby Chernobyl to only suggest during warm seasons
UPDATE flies 
SET best_conditions = '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "high"], "time_of_day": ["summer", "late_summer", "early_fall"], "water_temperature_range": {"min": 50, "max": 80}}'
WHERE name = 'Chubby Chernobyl';

-- Update other terrestrial flies to be season-specific
UPDATE flies 
SET best_conditions = '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["summer", "late_summer", "early_fall"], "water_temperature_range": {"min": 50, "max": 80}}'
WHERE name = 'Ant';

UPDATE flies 
SET best_conditions = '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["summer", "late_summer", "early_fall"], "water_temperature_range": {"min": 50, "max": 80}}'
WHERE name = 'Beetle';

UPDATE flies 
SET best_conditions = '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["late_summer", "early_fall"], "water_temperature_range": {"min": 55, "max": 80}}'
WHERE name = 'Cricket';

UPDATE flies 
SET best_conditions = '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["summer", "late_summer"], "water_temperature_range": {"min": 50, "max": 80}}'
WHERE name = 'Flying Ant';

UPDATE flies 
SET best_conditions = '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["summer", "late_summer"], "water_temperature_range": {"min": 60, "max": 85}}'
WHERE name = 'Cicada';

-- Update Hopper to be more season-specific (late summer/fall)
UPDATE flies 
SET best_conditions = '{"weather": ["sunny", "cloudy"], "water_clarity": ["clear", "slightly_murky"], "water_level": ["normal", "low"], "time_of_day": ["late_summer", "early_fall", "fall"], "water_temperature_range": {"min": 55, "max": 80}}'
WHERE name = 'Hopper';

-- Verify the updates
SELECT name, best_conditions FROM flies 
WHERE name IN ('Chernobyl Ant', 'Chubby Chernobyl', 'Ant', 'Beetle', 'Cricket', 'Flying Ant', 'Cicada', 'Hopper')
ORDER BY name;
