"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, deleteSession, verifySession } from "@/lib/session";
import {
  checkInRegistration,
  getRegistrationById,
} from "@/lib/registrations";
import type { ActionResponse } from "@/lib/types";

export async function gateDashboardLoginAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const password = formData.get("password") as string;
  if (!password) return { success: false, message: "Password is required." };
  if (password !== process.env.NEXT_PUBLIC_GATE_PASSWORD) {
    return { success: false, message: "Incorrect gate password." };
  }

  await createSession("gate");
  redirect("/gate");
}

export async function gateDashboardLogoutAction(): Promise<void> {
  await deleteSession("gate");
  redirect("/gate");
}

export async function gateDashboardCheckInAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const session = await verifySession();
  if (
    !session.authenticated ||
    (session.role !== "gate" && session.role !== "admin")
  ) {
    redirect("/gate");
  }

  const id = formData.get("id") as string;
  try {
    const registration = await getRegistrationById(id);
    if (!registration) {
      return { success: false, message: "Registration not found." };
    }
    if (!registration.attendance_confirmed) {
      return { success: false, message: "This guest is unable to attend." };
    }

    const success = await checkInRegistration(id);
    if (!success) {
      return { success: false, message: "Guest is already checked in." };
    }

    revalidatePath("/gate");
    revalidatePath(`/verify/${registration.invite_code}`);
    return { success: true, message: `${registration.full_name} checked in.` };
  } catch (error) {
    console.error("Gate dashboard check-in failed", error);
    return { success: false, message: "Unable to check in this guest." };
  }
}
