"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { gateLoginAction } from "@/app/verify/[inviteCode]/actions";
import type { ActionResponse } from "@/lib/types";

const initialState: ActionResponse = { success: false, message: "" };

export default function VerifyLoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: ActionResponse, formData: FormData) => {
      const result = await gateLoginAction(prev, formData);
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.success && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="gate-password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="gate-password"
          name="password"
          type="password"
          required
          placeholder="Enter gate password"
          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-dark py-3 text-base font-semibold text-white transition-colors hover:bg-gold disabled:opacity-60"
      >
        {pending && (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {pending ? "Verifying..." : "Continue"}
      </button>
    </form>
  );
}
