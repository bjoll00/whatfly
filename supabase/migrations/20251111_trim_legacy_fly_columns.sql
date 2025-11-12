-- Remove legacy descriptive columns so the flies table only stores map-aligned data.
ALTER TABLE public.flies
  ADD COLUMN IF NOT EXISTS imitated_insect jsonb,
  ADD COLUMN IF NOT EXISTS suggestion_profile jsonb;

COMMENT ON COLUMN public.flies.imitated_insect IS
  'Entomology-oriented description of the pattern: insect family, life stages, sizes, coloration, hatch timing.';

COMMENT ON COLUMN public.flies.suggestion_profile IS
  'Weights, requirements, and boosts that guide the fly suggestion engine when matching against environmental data.';

