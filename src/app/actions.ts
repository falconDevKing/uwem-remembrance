"use server";

import type { ActionResponse } from "@/lib/types";
import { createRegistration, flagDuplicatePhone, getRegistrationById } from "@/lib/registrations";

export async function registerGuest(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim() || "";

  if (!fullName || fullName.length === 0) {
    return {
      success: false,
      message: "Full name is required.",
      errors: { fullName: ["Full name is required."] },
    };
  }

  if (!phoneNumber) {
    return {
      success: false,
      message: "WhatsApp number is required.",
      errors: { phoneNumber: ["WhatsApp number is required."] },
    };
  }

  const extraPersons: { fullName: string; phoneNumber: string }[] = [];
  let i = 0;
  while (formData.has(`extraPersons[${i}].fullName`)) {
    const epName = (formData.get(`extraPersons[${i}].fullName`) as string)?.trim();
    const epPhone = (formData.get(`extraPersons[${i}].phoneNumber`) as string)?.trim() || "";

    if (!epName || epName.length === 0) {
      return {
        success: false,
        message: `Extra person ${i + 1} name is required.`,
        errors: {
          [`extraPersons[${i}].fullName`]: [`Extra person ${i + 1} name is required.`],
        },
      };
    }

    extraPersons.push({ fullName: epName, phoneNumber: epPhone });
    i++;
  }

  let registrationId: string;
  try {
    registrationId = await createRegistration({
      fullName,
      phoneNumber,
      email: email || null,
      extraPersons,
    });
  } catch (error) {
    console.error("Registration submission failed", error);
    return {
      success: false,
      message: "We could not complete your registration. Please try again.",
    };
  }

  try {
    const registration = await getRegistrationById(registrationId);
    if (registration) {
      await flagDuplicatePhone(registrationId, registration.phone_number);
    }
  } catch {
    // Non-critical — don't fail registration over duplicate check
  }

  return {
    success: true,
    message: "Thank you for choosing to share this day with us as we look forward to receiving you.",
  };
}
