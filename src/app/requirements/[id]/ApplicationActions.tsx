"use client";

import { useTransition } from "react";
import { updateApplicationStatusAction } from "../actions";

export default function ApplicationActions({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  if (status === "ACCEPTED" || status === "REJECTED") {
    return null;
  }

  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() => updateApplicationStatusAction(applicationId, "SHORTLISTED"))
        }
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-60 dark:border-neutral-700"
      >
        标记入围
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() => updateApplicationStatusAction(applicationId, "ACCEPTED"))
        }
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        录用
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() => updateApplicationStatusAction(applicationId, "REJECTED"))
        }
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-red-600 disabled:opacity-60 dark:border-neutral-700"
      >
        拒绝
      </button>
    </div>
  );
}
