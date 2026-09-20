"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type FormState } from "../actions";

const initialState: FormState = undefined;

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold">创建账号</h1>
      <p className="mb-8 text-sm text-neutral-500">
        选择你的身份：发布需求，或作为开发/测试/运维人才承接需求。
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          姓名
          <input
            name="name"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          邮箱
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          密码（至少 8 位）
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:focus:border-neutral-100"
          />
        </label>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1">我是</legend>
          <label className="flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700">
            <input type="radio" name="role" value="DEMANDER" defaultChecked />
            需求方：我要发布软件开发/测试/运维需求
          </label>
          <label className="flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700">
            <input type="radio" name="role" value="PROVIDER" />
            服务方：我提供开发/测试/运维服务
          </label>
        </fieldset>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
        >
          {pending ? "注册中…" : "注册"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        已有账号？{" "}
        <Link href="/login" className="underline">
          去登录
        </Link>
      </p>
    </div>
  );
}
