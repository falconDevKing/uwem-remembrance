export const TABLE_OPTIONS = Array.from(
  { length: 30 },
  (_, index) => `Table ${index + 1}`
);

export const INVITED_BY_OPTIONS = [
  "Daddy",
  "Mummy Esther",
  "Joy",
  "Peace",
  "Emmanuel",
  "Work",
  "Church",
  "Family",
  "Vendor",
  "Other",
] as const;

export const MAX_PERSONS_PER_TABLE = 10;

export type InvitedBy = (typeof INVITED_BY_OPTIONS)[number];

export const INVITE_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const INVITE_CODE_PATTERN = /^INV-[A-Z0-9]{4}$/;
