"use client";

import { useActionState } from "react";
import { gateDashboardLoginAction } from "@/app/gate/actions";
import type { ActionResponse } from "@/lib/types";

const initialState: ActionResponse = { success: false, message: "" };

export default function GateLoginForm() {
  const [state, action, pending] = useActionState(
    gateDashboardLoginAction,
    initialState
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="gate-password" className="mb-1.5 block text-sm font-medium">
          Gate password
        </label>
        <input
          id="gate-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-border bg-white px-4 py-3 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Open Gate List"}
      </button>
      {state.message && !state.success && (
        <p role="alert" className="text-sm text-error">
          {state.message}
        </p>
      )}
    </form>
  );
}
