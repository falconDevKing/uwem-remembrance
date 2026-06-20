"use server";

import { revalidatePath } from "next/cache";
import { createSession, verifySession } from "@/lib/session";
import {
  checkInRegistration,
  getRegistrationByInviteCode,
} from "@/lib/registrations";
import type { ActionResponse } from "@/lib/types";

export async function gateLoginAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const password = formData.get("password") as string;

  if (!password) {
    return { success: false, message: "Password is required." };
  }

  if (password !== process.env.GATE_PASSWORD) {
    return { success: false, message: "Incorrect gate password." };
  }

  await createSession("gate");
  return { success: true, message: "Authenticated as gate volunteer." };
}

export async function gateCheckInAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const session = await verifySession();
  if (!session.authenticated) {
    return { success: false, message: "Authentication required to check in guests." };
  }

  const inviteCode = formData.get("inviteCode") as string;
  let registration;
  try {
    registration = await getRegistrationByInviteCode(inviteCode);
  } catch (error) {
    console.error("Gate registration lookup failed", error);
    return { success: false, message: "Unable to load this registration." };
  }

  if (!registration) {
    return { success: false, message: "Registration not found." };
  }

  if (!registration.attendance_confirmed) {
    return { success: false, message: "This guest is unable to attend." };
  }

  let success = false;
  try {
    success = await checkInRegistration(registration.id);
  } catch (error) {
    console.error("Gate check-in failed", error);
    return { success: false, message: "Unable to check in this guest." };
  }
  if (!success) {
    return { success: false, message: "Guest is already checked in." };
  }

  revalidatePath(`/verify/${inviteCode}`);
  revalidatePath("/gate");
  return { success: true, message: "Guest checked in successfully." };
}
