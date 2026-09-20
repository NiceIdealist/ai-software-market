"use client";

import { useActionState } from "react";
import { createRequirementAction, type FormState } from "../actions";

const initialState: FormState = undefined;

export default function RequirementForm() {
  const [state, formAction, pending] = useActionState(createRequirementAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        标题
        <input
          name="title"
          required
          placeholder="例如：为跨境电商开发订单管理后台"
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        需求描述
        <textarea
          name="description"
          required
          rows={6}
          placeholder="项目背景、功能范围、技术栈偏好、交付标准等"
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        类别
        <select
          name="category"
          required
          defaultValue="DEV"
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="DEV">开发</option>
          <option value="TEST">测试</option>
          <option value="OPS">运维</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        技能标签（逗号分隔，选填，AI 会自动补充）
        <input
          name="tags"
          placeholder="react, node, postgres"
          className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          预算下限
          <input
            type="number"
            name="budgetMin"
            min={0}
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          预算上限
          <input
            type="number"
            name="budgetMax"
            min={0}
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        截止日期（选填）
        <input
          type="date"
          name="deadline"
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "发布中…" : "发布需求"}
      </button>
    </form>
  );
}
