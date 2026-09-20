"use client";

import { useActionState } from "react";
import { saveProviderProfileAction, type FormState } from "./actions";
import type { ProviderProfile } from "@/generated/prisma/client";

const initialState: FormState = undefined;

export default function ProfileForm({ profile }: { profile: ProviderProfile | null }) {
  const [state, formAction, pending] = useActionState(saveProviderProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        方向
        <select
          name="track"
          required
          defaultValue={profile?.track ?? "DEV"}
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="DEV">开发</option>
          <option value="TEST">测试</option>
          <option value="OPS">运维</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        一句话标题
        <input
          name="headline"
          required
          defaultValue={profile?.headline}
          placeholder="例如：5 年全栈工程师，专注电商与支付系统"
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        个人简介
        <textarea
          name="bio"
          required
          rows={5}
          defaultValue={profile?.bio}
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        技能标签（逗号分隔）
        <input
          name="tags"
          required
          defaultValue={profile?.tags}
          placeholder="react, node, postgres"
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          时薪（选填）
          <input
            type="number"
            name="hourlyRate"
            min={0}
            defaultValue={profile?.hourlyRate ?? undefined}
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          从业年限（选填）
          <input
            type="number"
            name="yearsExperience"
            min={0}
            defaultValue={profile?.yearsExperience ?? undefined}
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        作品集 / 主页链接（选填）
        <input
          name="portfolioUrl"
          type="url"
          defaultValue={profile?.portfolioUrl ?? undefined}
          placeholder="https://"
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">已保存</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "保存中…" : "保存档案"}
      </button>
    </form>
  );
}
