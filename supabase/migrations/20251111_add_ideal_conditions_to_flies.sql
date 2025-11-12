-- Add ideal_conditions column to store environmental matching data for flies
ALTER TABLE public.flies
ADD COLUMN IF NOT EXISTS ideal_conditions jsonb;

COMMENT ON COLUMN public.flies.ideal_conditions IS
  'JSON object defining the ideal environmental conditions (ranges and arrays) for this fly, used to match against WeatherMarker data.';

-- Seed example fly with ideal conditions profile
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.flies
    WHERE name = 'Elk Hair Caddis'
  ) THEN
    UPDATE public.flies
    SET ideal_conditions = jsonb_build_object(
      'airTemp', jsonb_build_object('min', 60, 'max', 80),
      'waterTemperature', jsonb_build_object('min', 50, 'max', 70),
      'streamFlow', jsonb_build_object('min', 50, 'max', 500),
      'windSpeedMph', jsonb_build_object('min', 0, 'max', 15),
      'weatherDescription', to_jsonb(ARRAY['Sunny', 'Partly Cloudy']),
      'moonPhase', to_jsonb(ARRAY['New Moon', 'Full Moon'])
    )
    WHERE name = 'Elk Hair Caddis';
  ELSE
    INSERT INTO public.flies (name, ideal_conditions)
    VALUES (
      'Elk Hair Caddis',
      jsonb_build_object(
        'airTemp', jsonb_build_object('min', 60, 'max', 80),
        'waterTemperature', jsonb_build_object('min', 50, 'max', 70),
        'streamFlow', jsonb_build_object('min', 50, 'max', 500),
        'windSpeedMph', jsonb_build_object('min', 0, 'max', 15),
        'weatherDescription', to_jsonb(ARRAY['Sunny', 'Partly Cloudy']),
        'moonPhase', to_jsonb(ARRAY['New Moon', 'Full Moon'])
      )
    );
  END IF;
END;
$$;

