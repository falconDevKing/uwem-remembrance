-- Add "Vendor" and "Other" to invited_by constraint
ALTER TABLE public.registrations
  DROP CONSTRAINT IF EXISTS registrations_invited_by_check;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_invited_by_check
  CHECK (
    invited_by IS NULL
    OR invited_by IN (
      'Daddy',
      'Mummy Esther',
      'Joy',
      'Peace',
      'Emmanuel',
      'Work',
      'Church',
      'Family',
      'Vendor',
      'Other'
    )
  );

-- Add duplicate_phone flag column
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS duplicate_phone boolean NOT NULL DEFAULT false;
