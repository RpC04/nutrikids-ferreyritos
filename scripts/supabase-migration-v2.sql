-- NutriKids Supabase migration (v2)
-- Adds recipe metadata, day-based shifts/jornadas, and global date range settings.

BEGIN;

-- 1) Recipes: add missing fields
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS preparation_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS servings INTEGER,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2) Activities: migrate legacy shift values and enforce new enum set
UPDATE activities
SET shift = 'day1'
WHERE shift = 'morning';

UPDATE activities
SET shift = 'day2'
WHERE shift = 'afternoon';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activities_shift_check'
  ) THEN
    ALTER TABLE activities DROP CONSTRAINT activities_shift_check;
  END IF;
END $$;

ALTER TABLE activities
  ADD CONSTRAINT activities_shift_check
  CHECK (shift IN ('day1', 'day2', 'both'));

-- 3) Registrations: migrate legacy jornada values and enforce new enum set
UPDATE registrations
SET jornada = 'day1'
WHERE jornada = 'morning';

UPDATE registrations
SET jornada = 'day2'
WHERE jornada = 'afternoon';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registrations_jornada_check'
  ) THEN
    ALTER TABLE registrations DROP CONSTRAINT registrations_jornada_check;
  END IF;
END $$;

ALTER TABLE registrations
  ADD CONSTRAINT registrations_jornada_check
  CHECK (jornada IN ('day1', 'day2', 'both'));

-- 4) Event settings: add global date range and team metadata
ALTER TABLE event_settings
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS display_date_label VARCHAR(255),
  ADD COLUMN IF NOT EXISTS team_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS team_size INTEGER;

UPDATE event_settings
SET
  start_date = COALESCE(start_date, event_date, CURRENT_DATE),
  end_date = COALESCE(end_date, event_date, start_date, CURRENT_DATE + 1),
  event_date = COALESCE(event_date, start_date, CURRENT_DATE),
  team_name = COALESCE(team_name, 'Equipo universitario independiente NutriKids'),
  team_size = COALESCE(team_size, 31);

ALTER TABLE event_settings
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN end_date SET NOT NULL;

INSERT INTO event_settings (
  event_date,
  start_date,
  end_date,
  display_date_label,
  team_name,
  team_size
)
SELECT
  CURRENT_DATE,
  CURRENT_DATE,
  CURRENT_DATE + 1,
  NULL,
  'Equipo universitario independiente NutriKids',
  31
WHERE NOT EXISTS (
  SELECT 1 FROM event_settings
);

COMMIT;
