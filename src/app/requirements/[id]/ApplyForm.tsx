"use client";

import { useTransition } from "react";
import { applyToRequirementAction } from "../actions";

export default function ApplyForm({
  requirementId,
  defaultMessage,
}: {
  requirementId: string;
  defaultMessage: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => applyToRequirementAction(requirementId, formData))}
      className="mt-3 flex flex-col gap-3"
    >
      <textarea
        name="message"
        rows={3}
        defaultValue={defaultMessage}
        placeholder="简单介绍你的方案、相关经验或报价（选填）"
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "提交中…" : "提交申请"}
      </button>
    </form>
  );
}
