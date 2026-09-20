import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { rankCandidates } from "@/lib/matching";
import ApplyForm from "./ApplyForm";
import ApplicationActions from "./ApplicationActions";
import type { RequirementCategory } from "@/generated/prisma/enums";

const CATEGORY_LABEL: Record<RequirementCategory, string> = {
  DEV: "开发",
  TEST: "测试",
  OPS: "运维",
};

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "待处理",
  SHORTLISTED: "已入围",
  ACCEPTED: "已录用",
  REJECTED: "已拒绝",
  WITHDRAWN: "已撤回",
};

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const requirement = await prisma.requirement.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      applications: {
        include: { provider: { include: { providerProfile: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!requirement) notFound();

  const isOwner = session?.userId === requirement.owner.id;
  const myApplication = session
    ? requirement.applications.find((a) => a.providerId === session.userId)
    : undefined;

  let ranked: ReturnType<typeof rankCandidates> = [];
  if (isOwner) {
    const providers = await prisma.providerProfile.findMany({
      include: { user: { select: { id: true, name: true } } },
    });
    ranked = rankCandidates(requirement, [
      ...providers.map((p) => ({
        providerUserId: p.userId,
        name: p.user.name,
        track: p.track,
        headline: p.headline,
        tags: p.tags,
        hourlyRate: p.hourlyRate,
        yearsExperience: p.yearsExperience,
      })),
    ]).slice(0, 8);
  }

  const tags = requirement.tags.split(",").filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{requirement.title}</h1>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">
          {CATEGORY_LABEL[requirement.category]} · {requirement.status}
        </span>
      </div>

      <p className="mt-2 text-sm text-neutral-400">
        发布方：{requirement.owner.name} · 发布于{" "}
        {requirement.createdAt.toLocaleDateString("zh-CN")}
      </p>

      <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">
        {requirement.description}
      </p>

      {requirement.aiSummary && (
        <div className="mt-4 rounded-md border border-dashed border-neutral-300 p-3 text-sm text-neutral-500 dark:border-neutral-700">
          <span className="font-medium text-neutral-600 dark:text-neutral-300">AI 评估：</span>{" "}
          {requirement.aiSummary}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-6 text-sm text-neutral-500">
        {(requirement.budgetMin || requirement.budgetMax) && (
          <span>
            预算：{requirement.budgetMin ?? "?"} - {requirement.budgetMax ?? "?"}
          </span>
        )}
        {requirement.deadline && (
          <span>截止日期：{requirement.deadline.toLocaleDateString("zh-CN")}</span>
        )}
      </div>

      {!isOwner && session?.role === "PROVIDER" && (
        <div className="mt-10 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
          <h2 className="font-medium">
            {myApplication ? "更新我的申请" : "申请承接该需求"}
          </h2>
          <ApplyForm
            requirementId={requirement.id}
            defaultMessage={myApplication?.message ?? ""}
          />
          {myApplication && (
            <p className="mt-2 text-xs text-neutral-500">
              当前状态：{APPLICATION_STATUS_LABEL[myApplication.status] ?? myApplication.status}
            </p>
          )}
        </div>
      )}

      {!session && (
        <p className="mt-10 text-sm text-neutral-500">
          登录后服务方可申请承接，需求方可查看撮合结果。
        </p>
      )}

      {isOwner && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">AI 智能撮合推荐</h2>
          {ranked.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">暂无匹配的服务方，等待更多入驻。</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {ranked.map((candidate) => (
                <div
                  key={candidate.providerUserId}
                  className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{candidate.name}</span>
                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">
                      匹配度 {Math.round(candidate.score * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">{candidate.headline}</p>
                  <p className="mt-1 text-xs text-neutral-400">{candidate.reason}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-10 text-lg font-semibold">收到的申请</h2>
          {requirement.applications.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">暂无申请。</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {requirement.applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{app.provider.name}</span>
                    <span className="text-xs text-neutral-400">
                      {APPLICATION_STATUS_LABEL[app.status] ?? app.status}
                    </span>
                  </div>
                  {app.provider.providerProfile && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {app.provider.providerProfile.headline}
                    </p>
                  )}
                  {app.message && (
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                      {app.message}
                    </p>
                  )}
                  <ApplicationActions applicationId={app.id} status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
