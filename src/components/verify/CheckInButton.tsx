"use client";

import { useActionState } from "react";
import { gateCheckInAction } from "@/app/verify/[inviteCode]/actions";
import type { ActionResponse } from "@/lib/types";

const initialState: ActionResponse = { success: false, message: "" };

export default function CheckInButton({
  inviteCode,
}: {
  inviteCode: string;
}) {
  const [state, formAction, pending] = useActionState(
    gateCheckInAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="mt-6 rounded-xl bg-green-50 p-4 text-center">
        <p className="text-lg font-semibold text-green-700">
          Successfully checked in!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <form action={formAction}>
        <input type="hidden" name="inviteCode" value={inviteCode} />
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
        >
          {pending && (
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {pending ? "Checking in..." : "Mark as Checked In"}
        </button>
      </form>
      {state.message && !state.success && (
        <p className="mt-2 text-center text-sm text-error">
          {state.message}
        </p>
      )}
    </div>
  );
}
