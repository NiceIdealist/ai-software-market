import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { RequirementCategory } from "@/generated/prisma/enums";

const CATEGORY_LABEL: Record<RequirementCategory, string> = {
  DEV: "开发",
  TEST: "测试",
  OPS: "运维",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "招募中",
  MATCHING: "匹配中",
  IN_PROGRESS: "进行中",
  DELIVERED: "已交付",
  CLOSED: "已关闭",
  CANCELLED: "已取消",
};

export default async function RequirementsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const requirements = await prisma.requirement.findMany({
    where: {
      ...(category && ["DEV", "TEST", "OPS"].includes(category)
        ? { category: category as RequirementCategory }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { tags: { contains: q.toLowerCase() } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } }, _count: { select: { applications: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">浏览需求</h1>
        <Link
          href="/requirements/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          发布新需求
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">全部类别</option>
          <option value="DEV">开发</option>
          <option value="TEST">测试</option>
          <option value="OPS">运维</option>
        </select>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="搜索标题 / 描述 / 标签"
          className="min-w-64 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
        >
          筛选
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-4">
        {requirements.length === 0 && (
          <p className="text-sm text-neutral-500">暂无匹配的需求。</p>
        )}
        {requirements.map((req) => (
          <Link
            key={req.id}
            href={`/requirements/${req.id}`}
            className="block rounded-lg border border-neutral-200 p-5 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">{req.title}</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
                  {CATEGORY_LABEL[req.category]}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-1 dark:bg-neutral-800">
                  {STATUS_LABEL[req.status] ?? req.status}
                </span>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{req.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
              <span>发布方：{req.owner.name}</span>
              {(req.budgetMin || req.budgetMax) && (
                <span>
                  预算：{req.budgetMin ?? "?"} - {req.budgetMax ?? "?"}
                </span>
              )}
              <span>申请数：{req._count.applications}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
