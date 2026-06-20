export interface ExtraPerson {
  fullName: string;
  phoneNumber: string;
}

export interface RegistrationFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  extraPersons: ExtraPerson[];
}

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface Registration {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  attendance_confirmed: boolean;
  invite_code: string;
  is_primary_attendee: boolean;
  linked_to_id: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  admin_notes: string | null;
  table_assignment: string | null;
  invited_by: import("./event-options").InvitedBy | null;
  deleted: boolean;
  duplicate_phone: boolean;
  created_at: string;
  updated_at: string;
}

export type RegistrationStatusFilter =
  | "all"
  | "checked_in"
  | "not_checked_in"
  | "unable"
  | "deleted";

export interface RegistrationListItem extends Registration {
  source_name: string | null;
}

export interface PaginatedRegistrations {
  registrations: RegistrationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalRegistrations: number;
  totalExtraPersons: number;
  totalExpectedGuests: number;
  totalCheckedIn: number;
  notYetCheckedIn: number;
}

export type SessionRole = "admin" | "gate";

export interface SessionResult {
  authenticated: boolean;
  role?: SessionRole;
}
