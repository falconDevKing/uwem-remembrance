"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, verifySession, deleteSession } from "@/lib/session";
import {
  checkInRegistration,
  uncheckInRegistration,
  setRegistrationDeleted,
  updateRegistration,
  updateTableAssignment,
  updateInvitedBy,
  setAttendanceConfirmed,
  setInviteSent,
  addRegistration,
  getTableOccupantCount,
  getRegistrationById,
  getExtrasForRegistration,
} from "@/lib/registrations";
import { MAX_PERSONS_PER_TABLE } from "@/lib/event-options";
import { INVITED_BY_OPTIONS } from "@/lib/event-options";
import type { InvitedBy } from "@/lib/event-options";
import type { ActionResponse } from "@/lib/types";

export async function loginAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const password = formData.get("password") as string;

  if (!password) {
    return { success: false, message: "Password is required." };
  }

  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return { success: false, message: "Incorrect password." };
  }

  await createSession("admin");
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await deleteSession("admin");
  redirect("/admin/login");
}

export async function checkInGuestAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated) redirect("/admin/login");

  const id = formData.get("id") as string;
  let success = false;
  try {
    success = await checkInRegistration(id);
  } catch (error) {
    console.error("Admin check-in failed", error);
    return { success: false, message: "Unable to check in this guest." };
  }

  if (!success) {
    return { success: false, message: "Guest not found, unable to attend, or already checked in." };
  }

  revalidatePath("/admin");
  revalidatePath("/gate");
  revalidatePath(`/admin/registrations/${id}`);
  return { success: true, message: "Guest checked in successfully." };
}

export async function uncheckInGuestAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  let success = false;
  try {
    success = await uncheckInRegistration(id);
  } catch (error) {
    console.error("Undo check-in failed", error);
    return { success: false, message: "Unable to undo this check-in." };
  }

  if (!success) {
    return { success: false, message: "Guest not found or not checked in." };
  }

  revalidatePath("/admin");
  revalidatePath("/gate");
  revalidatePath(`/admin/registrations/${id}`);
  return { success: true, message: "Check-in undone." };
}

export async function deleteRegistrationAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  let success = false;
  try {
    success = await setRegistrationDeleted(id, true);
  } catch (error) {
    console.error("Registration soft deletion failed", error);
    return { success: false, message: "Unable to mark this registration as deleted." };
  }

  if (!success) {
    return { success: false, message: "Registration not found." };
  }

  revalidatePath("/admin");
  revalidatePath("/gate");
  return { success: true, message: "Registration marked as deleted." };
}

export async function restoreRegistrationAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  try {
    const success = await setRegistrationDeleted(id, false);
    if (!success) return { success: false, message: "Registration not found." };
  } catch (error) {
    console.error("Registration restore failed", error);
    return { success: false, message: "Unable to restore this registration." };
  }

  revalidatePath("/admin");
  revalidatePath("/gate");
  revalidatePath(`/admin/registrations/${id}`);
  return { success: true, message: "Registration restored." };
}

export async function updateTableAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  const table = (formData.get("table") as string)?.trim() || null;

  if (table) {
    try {
      const registration = await getRegistrationById(id);
      if (!registration || registration.deleted) {
        return { success: false, message: "Registration not found." };
      }

      let groupSize = 1;
      if (registration.is_primary_attendee) {
        const extras = await getExtrasForRegistration(id);
        groupSize = 1 + extras.length;
      }

      const currentCount = await getTableOccupantCount(table);
      const alreadyAtTable = registration.table_assignment === table ? groupSize : 0;
      const netNew = groupSize - alreadyAtTable;

      if (currentCount + netNew > MAX_PERSONS_PER_TABLE) {
        return {
          success: false,
          message: `${table} is at capacity (${currentCount}/${MAX_PERSONS_PER_TABLE}). Cannot assign ${groupSize} person(s).`,
        };
      }
    } catch (error) {
      console.error("Table capacity check failed", error);
      return { success: false, message: "Unable to check table capacity." };
    }
  }

  let success = false;
  try {
    success = await updateTableAssignment(id, table);
  } catch (error) {
    console.error("Table assignment update failed", error);
    return { success: false, message: "Unable to update the table assignment." };
  }

  if (!success) {
    return { success: false, message: "Registration not found." };
  }

  revalidatePath(`/admin/registrations/${id}`);
  revalidatePath("/admin");
  revalidatePath("/gate");
  return { success: true, message: "Table assignment updated." };
}

export async function updateNotesAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;
  let success = false;
  try {
    success = await updateRegistration(id, { admin_notes: notes });
  } catch (error) {
    console.error("Admin notes update failed", error);
    return { success: false, message: "Unable to update the notes." };
  }

  if (!success) {
    return { success: false, message: "Registration not found." };
  }

  revalidatePath(`/admin/registrations/${id}`);
  revalidatePath("/admin");
  return { success: true, message: "Notes updated." };
}

export async function updateInvitedByAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  const value = (formData.get("invitedBy") as string)?.trim() || null;
  if (value && !INVITED_BY_OPTIONS.includes(value as InvitedBy)) {
    return { success: false, message: "Invalid invited-by option." };
  }

  try {
    const success = await updateInvitedBy(id, value as InvitedBy | null);
    if (!success) return { success: false, message: "Registration not found." };
  } catch (error) {
    console.error("Invited-by update failed", error);
    return { success: false, message: "Unable to update who invited this guest." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/registrations/${id}`);
  return { success: true, message: "Invited-by assignment updated for the group." };
}

export async function updateAttendanceAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  const attendanceConfirmed = formData.get("attendanceConfirmed") === "true";
  try {
    const success = await setAttendanceConfirmed(id, attendanceConfirmed);
    if (!success) return { success: false, message: "Registration not found." };
  } catch (error) {
    console.error("Attendance update failed", error);
    return { success: false, message: "Unable to update attendance." };
  }

  revalidatePath("/admin");
  revalidatePath("/gate");
  revalidatePath(`/admin/registrations/${id}`);
  return {
    success: true,
    message: attendanceConfirmed ? "Guest marked as attending." : "Guest marked as unable to attend.",
  };
}

export async function markInviteSentAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") redirect("/admin/login");

  const id = formData.get("id") as string;
  const sent = formData.get("sent") === "true";
  try {
    const success = await setInviteSent(id, sent);
    if (!success) return { success: false, message: "Registration not found." };
  } catch (error) {
    console.error("Mark invite sent failed", error);
    return { success: false, message: "Unable to update invite sent status." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/registrations/${id}`);
  return { success: true, message: sent ? "Invite marked as sent." : "Invite marked as not sent." };
}

export async function createGuestAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated || session.role !== "admin") {
    redirect("/admin/login");
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || null;

  if (!fullName) {
    return { success: false, message: "Full name is required." };
  }

  if (!phoneNumber) {
    return { success: false, message: "WhatsApp number is required." };
  }

  try {
    await addRegistration({
      full_name: fullName,
      phone_number: phoneNumber,
      email,
    });
  } catch (error) {
    console.error("Admin guest creation failed", error);
    return { success: false, message: "Unable to add this guest." };
  }
  revalidatePath("/admin");
  return { success: true, message: `Guest "${fullName}" added successfully.` };
}
