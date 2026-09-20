import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankRequirementsForCandidate, type ScoredRequirement } from "@/lib/matching";
import type { Requirement } from "@/generated/prisma/client";

const CATEGORY_LABEL: Record<string, string> = { DEV: "开发", TEST: "测试", OPS: "运维" };
const STATUS_LABEL: Record<string, string> = {
  OPEN: "招募中",
  MATCHING: "匹配中",
  IN_PROGRESS: "进行中",
  DELIVERED: "已交付",
  CLOSED: "已关闭",
  CANCELLED: "已取消",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  if (session.role === "DEMANDER") {
    const requirements = await prisma.requirement.findMany({
      where: { ownerId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });

    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">我的需求</h1>
          <Link
            href="/requirements/new"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            发布新需求
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {requirements.length === 0 && (
            <p className="text-sm text-neutral-500">你还没有发布任何需求。</p>
          )}
          {requirements.map((req) => (
            <Link
              key={req.id}
              href={`/requirements/${req.id}`}
              className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{req.title}</span>
                <span className="text-xs text-neutral-400">
                  {CATEGORY_LABEL[req.category]} · {STATUS_LABEL[req.status] ?? req.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-400">收到申请：{req._count.applications}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // PROVIDER dashboard
  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.userId } });
  const applications = await prisma.application.findMany({
    where: { providerId: session.userId },
    include: { requirement: true },
    orderBy: { createdAt: "desc" },
  });

  let recommended: ScoredRequirement<Requirement>[] = [];
  if (profile) {
    const openRequirements = await prisma.requirement.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    recommended = rankRequirementsForCandidate(
      {
        providerUserId: session.userId,
        name: session.name,
        track: profile.track,
        headline: profile.headline,
        tags: profile.tags,
        hourlyRate: profile.hourlyRate,
        yearsExperience: profile.yearsExperience,
      },
      openRequirements
    ).slice(0, 8);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">服务方控制台</h1>
        <Link
          href="/profile"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
        >
          {profile ? "编辑服务档案" : "完善服务档案"}
        </Link>
      </div>

      {!profile && (
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          先完善服务档案（方向、技能标签），才能获得 AI 智能推荐。
        </p>
      )}

      {profile && (
        <>
          <h2 className="mt-8 text-lg font-semibold">为你推荐</h2>
          <div className="mt-4 flex flex-col gap-3">
            {recommended.length === 0 && (
              <p className="text-sm text-neutral-500">暂无推荐，稍后再来看看。</p>
            )}
            {recommended.map((req) => (
              <Link
                key={req.id}
                href={`/requirements/${req.id}`}
                className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{req.title}</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">
                    匹配度 {Math.round(req.score * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-400">{req.reason}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-10 text-lg font-semibold">我的申请</h2>
      <div className="mt-4 flex flex-col gap-3">
        {applications.length === 0 && <p className="text-sm text-neutral-500">还没有申请过需求。</p>}
        {applications.map((app) => (
          <Link
            key={app.id}
            href={`/requirements/${app.requirementId}`}
            className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{app.requirement.title}</span>
              <span className="text-xs text-neutral-400">{app.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
