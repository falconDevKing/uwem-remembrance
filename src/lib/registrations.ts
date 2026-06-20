import "server-only";
import { randomInt } from "node:crypto";
import { getSupabase } from "./supabase";
import { INVITE_CODE_ALPHABET } from "./event-options";
import type { InvitedBy } from "./event-options";
import type { DashboardStats, ExtraPerson, PaginatedRegistrations, Registration, RegistrationListItem, RegistrationStatusFilter } from "./types";

const REGISTRATION_COLUMNS =
  "id, full_name, phone_number, email, attendance_confirmed, invite_code, is_primary_attendee, linked_to_id, checked_in, checked_in_at, admin_notes, table_assignment, invited_by, deleted, duplicate_phone, created_at, updated_at";

const INVITE_CODE_RETRIES = 10;

function databaseError(operation: string, message: string): Error {
  return new Error(`Unable to ${operation}: ${message}`);
}

function safeSearchTerm(value: string): string {
  return value
    .replace(/[,().%"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function generateInviteCode(): string {
  let suffix = "";
  for (let index = 0; index < 4; index++) {
    suffix += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return `INV-${suffix}`;
}

function isInviteCodeCollision(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

function generateUniqueBatchCodes(count: number): string[] {
  const codes = new Set<string>();
  while (codes.size < count) codes.add(generateInviteCode());
  return [...codes];
}

export async function createRegistration(data: { fullName: string; phoneNumber: string; email: string | null; extraPersons: ExtraPerson[] }): Promise<string> {
  const supabase = getSupabase();
  let primary: { id: string } | null = null;

  for (let attempt = 0; attempt < INVITE_CODE_RETRIES; attempt++) {
    const result = await supabase
      .from("registrations")
      .insert({
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        email: data.email,
        invite_code: generateInviteCode(),
        is_primary_attendee: true,
        linked_to_id: null,
      })
      .select("id")
      .single();

    if (!result.error) {
      primary = result.data as { id: string };
      break;
    }
    if (!isInviteCodeCollision(result.error)) {
      throw databaseError("create registration", result.error.message);
    }
  }

  if (!primary?.id || typeof primary.id !== "string") {
    throw databaseError("create registration", "could not generate a unique invite code");
  }

  if (data.extraPersons.length > 0) {
    let extrasError: { code?: string; message: string } | null = null;

    for (let attempt = 0; attempt < INVITE_CODE_RETRIES; attempt++) {
      const codes = generateUniqueBatchCodes(data.extraPersons.length);
      const extras = data.extraPersons.map((extraPerson, index) => ({
        full_name: extraPerson.fullName,
        phone_number: extraPerson.phoneNumber || null,
        email: null,
        invite_code: codes[index],
        is_primary_attendee: false,
        linked_to_id: primary.id,
      }));
      const result = await supabase.from("registrations").insert(extras);
      extrasError = result.error;
      if (!extrasError || !isInviteCodeCollision(extrasError)) break;
    }

    if (extrasError) {
      const { error: cleanupError } = await supabase.from("registrations").delete().eq("id", primary.id);
      if (cleanupError) {
        console.error("Failed to clean up partial registration", cleanupError);
      }
      throw databaseError("create extra persons", extrasError.message);
    }
  }

  return primary.id;
}

export async function addRegistration(data: { full_name: string; phone_number: string; email: string | null }): Promise<string> {
  return createRegistration({
    fullName: data.full_name,
    phoneNumber: data.phone_number,
    email: data.email,
    extraPersons: [],
  });
}

async function attachSourceNames(registrations: Registration[]): Promise<RegistrationListItem[]> {
  const sourceIds = [...new Set(registrations.map((registration) => registration.linked_to_id).filter((id): id is string => Boolean(id)))];
  const sourceNames = new Map<string, string>();

  if (sourceIds.length > 0) {
    const { data: sources, error } = await getSupabase().from("registrations").select("id, full_name").in("id", sourceIds);
    if (error) throw databaseError("load source registrations", error.message);
    for (const source of sources ?? []) {
      sourceNames.set(source.id as string, source.full_name as string);
    }
  }

  return registrations.map((registration) => ({
    ...registration,
    source_name: registration.linked_to_id ? (sourceNames.get(registration.linked_to_id) ?? null) : null,
  }));
}

export async function getPaginatedRegistrations({
  page,
  pageSize,
  query,
  status,
  withNotes = false,
}: {
  page: number;
  pageSize: number;
  query: string;
  status: RegistrationStatusFilter;
  withNotes?: boolean;
}): Promise<PaginatedRegistrations> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let request = getSupabase()
    .from("registrations")
    .select(REGISTRATION_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  const searchTerm = safeSearchTerm(query);
  if (searchTerm) {
    request = request.or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`);
  }
  if (status === "checked_in") {
    request = request.eq("attendance_confirmed", true).eq("checked_in", true);
  }
  if (status === "not_checked_in") {
    request = request.eq("attendance_confirmed", true).eq("checked_in", false);
  }
  if (status === "unable") request = request.eq("attendance_confirmed", false);
  if (status === "deleted") {
    request = request.eq("deleted", true);
  } else {
    request = request.eq("deleted", false);
  }
  if (withNotes) request = request.not("admin_notes", "is", null);

  const { data, error, count } = await request;
  if (error) throw databaseError("load registrations", error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rows = await attachSourceNames((data ?? []) as Registration[]);

  return {
    registrations: rows,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getPaginatedGateRegistrations({
  page,
  pageSize,
  query,
}: {
  page: number;
  pageSize: number;
  query: string;
}): Promise<PaginatedRegistrations> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let request = getSupabase()
    .from("registrations")
    .select(REGISTRATION_COLUMNS, { count: "exact" })
    .eq("deleted", false)
    .order("checked_in", { ascending: true })
    .order("attendance_confirmed", { ascending: false })
    .order("full_name", { ascending: true })
    .order("id", { ascending: true })
    .range(from, to);

  const searchTerm = safeSearchTerm(query);
  if (searchTerm) {
    request = request.or(`full_name.ilike.%${searchTerm}%,invite_code.ilike.%${searchTerm}%`);
  }

  const { data, error, count } = await request;
  if (error) throw databaseError("load gate registrations", error.message);

  const total = count ?? 0;
  return {
    registrations: await attachSourceNames((data ?? []) as Registration[]),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAllRegistrations(): Promise<Registration[]> {
  const { data, error } = await getSupabase()
    .from("registrations")
    .select(REGISTRATION_COLUMNS)
    .eq("deleted", false)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw databaseError("load registrations", error.message);
  return (data ?? []) as Registration[];
}

export async function getRegistrationById(id: string): Promise<Registration | undefined> {
  const { data, error } = await getSupabase().from("registrations").select(REGISTRATION_COLUMNS).eq("id", id).maybeSingle();

  if (error) throw databaseError("load registration", error.message);
  return (data as Registration | null) ?? undefined;
}

export async function getRegistrationByInviteCode(code: string): Promise<Registration | undefined> {
  const { data, error } = await getSupabase().from("registrations").select(REGISTRATION_COLUMNS).eq("invite_code", code).eq("deleted", false).maybeSingle();

  if (error) throw databaseError("load registration", error.message);
  return (data as Registration | null) ?? undefined;
}

export async function getExtrasForRegistration(id: string): Promise<Registration[]> {
  const { data, error } = await getSupabase()
    .from("registrations")
    .select(REGISTRATION_COLUMNS)
    .eq("linked_to_id", id)
    .eq("deleted", false)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw databaseError("load extra persons", error.message);
  return (data ?? []) as Registration[];
}

export async function getLinkedPrimary(linkedToId: string): Promise<Registration | undefined> {
  return getRegistrationById(linkedToId);
}

async function countRegistrations(filter?: { column: "is_primary_attendee" | "checked_in" | "attendance_confirmed"; value: boolean }): Promise<number> {
  let request = getSupabase().from("registrations").select("id", { count: "exact", head: true });
  request = request.eq("deleted", false);
  if (filter) request = request.eq(filter.column, filter.value);
  const { count, error } = await request;
  if (error) throw databaseError("count registrations", error.message);
  return count ?? 0;
}

export async function computeStats(): Promise<DashboardStats> {
  const [totalPeople, totalRegistrations, totalExpectedGuests, totalCheckedIn] = await Promise.all([
    countRegistrations(),
    countRegistrations({ column: "is_primary_attendee", value: true }),
    countRegistrations({ column: "attendance_confirmed", value: true }),
    countRegistrations({ column: "checked_in", value: true }),
  ]);

  return {
    totalRegistrations,
    totalExtraPersons: totalPeople - totalRegistrations,
    totalExpectedGuests,
    totalCheckedIn,
    notYetCheckedIn: totalExpectedGuests - totalCheckedIn,
  };
}

export async function checkInRegistration(id: string): Promise<boolean> {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from("registrations")
    .update({ checked_in: true, checked_in_at: now })
    .eq("id", id)
    .eq("deleted", false)
    .eq("attendance_confirmed", true)
    .eq("checked_in", false)
    .select("id")
    .maybeSingle();

  if (error) throw databaseError("check in registration", error.message);
  return Boolean(data);
}

export async function uncheckInRegistration(id: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from("registrations")
    .update({ checked_in: false, checked_in_at: null })
    .eq("id", id)
    .eq("deleted", false)
    .eq("checked_in", true)
    .select("id")
    .maybeSingle();

  if (error) throw databaseError("undo check-in", error.message);
  return Boolean(data);
}

export async function setRegistrationDeleted(id: string, deleted: boolean): Promise<boolean> {
  const { data, error } = await getSupabase().from("registrations").update({ deleted }).eq("id", id).select("id").maybeSingle();

  if (error) throw databaseError("update deleted status", error.message);
  return Boolean(data);
}

export async function updateRegistration(id: string, updates: Partial<Pick<Registration, "admin_notes">>): Promise<boolean> {
  const { data, error } = await getSupabase().from("registrations").update(updates).eq("id", id).eq("deleted", false).select("id").maybeSingle();

  if (error) throw databaseError("update registration", error.message);
  return Boolean(data);
}

export async function updateTableAssignment(id: string, tableAssignment: string | null): Promise<boolean> {
  const registration = await getRegistrationById(id);
  if (!registration || registration.deleted) return false;

  let groupIds = [id];
  if (registration.is_primary_attendee) {
    const extras = await getExtrasForRegistration(id);
    groupIds = [id, ...extras.map((e) => e.id)];
  }

  const { data, error } = await getSupabase()
    .from("registrations")
    .update({ table_assignment: tableAssignment })
    .in("id", groupIds)
    .eq("deleted", false)
    .select("id");
  if (error) throw databaseError("update table assignment", error.message);
  return Boolean(data?.length);
}

export async function updateInvitedBy(id: string, invitedBy: InvitedBy | null): Promise<boolean> {
  const registration = await getRegistrationById(id);
  if (!registration || registration.deleted) return false;
  const primaryId = registration.linked_to_id ?? registration.id;

  const primary = primaryId === registration.id ? registration : await getRegistrationById(primaryId);
  if (!primary) return false;

  const extras = await getExtrasForRegistration(primaryId);
  const groupIds = [primaryId, ...extras.map((e) => e.id)];

  const { data, error } = await getSupabase()
    .from("registrations")
    .update({ invited_by: invitedBy })
    .in("id", groupIds)
    .eq("deleted", false)
    .select("id");
  if (error) throw databaseError("update inviter", error.message);
  return Boolean(data?.length);
}

export async function getTableOccupantCount(tableAssignment: string): Promise<number> {
  const { count, error } = await getSupabase()
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("table_assignment", tableAssignment)
    .eq("deleted", false);

  if (error) throw databaseError("count table occupants", error.message);
  return count ?? 0;
}

export async function flagDuplicatePhone(registrationId: string, phoneNumber: string | null): Promise<void> {
  if (!phoneNumber) return;

  const { count, error } = await getSupabase()
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("phone_number", phoneNumber)
    .eq("deleted", false)
    .neq("id", registrationId);

  if (error) {
    console.error("Failed to check duplicate phone", error);
    return;
  }

  if ((count ?? 0) > 0) {
    await getSupabase().from("registrations").update({ duplicate_phone: true }).eq("id", registrationId);
  }
}

export async function setAttendanceConfirmed(id: string, attendanceConfirmed: boolean): Promise<boolean> {
  const updates = attendanceConfirmed
    ? { attendance_confirmed: true }
    : {
        attendance_confirmed: false,
        checked_in: false,
        checked_in_at: null,
      };
  const { data, error } = await getSupabase().from("registrations").update(updates).eq("id", id).eq("deleted", false).select("id").maybeSingle();
  if (error) throw databaseError("update attendance", error.message);
  return Boolean(data);
}
