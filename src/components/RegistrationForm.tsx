"use client";

import { useActionState, useState } from "react";
import { registerGuest } from "@/app/actions";
import type { ActionResponse } from "@/lib/types";
import PhoneInput from "@/components/PhoneInput";

const initialState: ActionResponse = { success: false, message: "" };

export default function RegistrationForm() {
  const [state, formAction, pending] = useActionState(registerGuest, initialState);
  const [extraCount, setExtraCount] = useState(0);

  if (state.success) {
    return (
      <div className="py-12 text-center" aria-live="polite">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-semibold text-foreground">Registration Confirmed</h3>
        {/* <p className="mt-3 text-lg text-muted">{state.message}</p> */}
        <p className="mt-3 text-lg text-muted">Thank you for choosing to share this day with us as we look forward to receiving you.</p>
        <p className="mt-3 italic text-xs text-muted">N.B.: A member of the team will reach out to you with your access details.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.message && !state.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-error" role="alert" aria-live="polite">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium">
          Full Name <span className="text-error">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Enter your full name"
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          WhatsApp Number <span className="text-error">*</span>
        </label>
        <PhoneInput
          name="phoneNumber"
          required
          placeholder="Enter your WhatsApp number"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email Address <span className="text-xs font-normal text-muted">(Optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">Extra Persons Attending With You</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setExtraCount((c) => Math.max(0, c - 1))}
            disabled={extraCount === 0}
            aria-label="Remove extra person"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg font-semibold transition-colors hover:border-gold hover:bg-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent disabled:hover:text-foreground"
          >
            &minus;
          </button>
          <span className="w-8 text-center text-lg font-semibold">{extraCount}</span>
          <button
            type="button"
            onClick={() => setExtraCount((c) => c + 1)}
            aria-label="Add extra person"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg font-semibold transition-colors hover:border-gold hover:bg-gold hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      {Array.from({ length: extraCount }).map((_, i) => (
        <fieldset key={i} className="border-t border-border pt-4">
          <legend className="mb-3 text-sm font-semibold text-gold">Extra Person {i + 1}</legend>
          <div className="space-y-4">
            <div>
              <label htmlFor={`extra-name-${i}`} className="mb-1.5 block text-sm font-medium">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                id={`extra-name-${i}`}
                name={`extraPersons[${i}].fullName`}
                type="text"
                required
                placeholder="Enter full name"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Phone Number <span className="text-xs font-normal text-muted">(Optional)</span>
              </label>
              <PhoneInput
                name={`extraPersons[${i}].phoneNumber`}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </fieldset>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gold-dark py-3.5 text-base font-semibold text-white transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {pending ? "Registering..." : "Register for Event"}
      </button>
    </form>
  );
}
