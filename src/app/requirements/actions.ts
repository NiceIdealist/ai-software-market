"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { requirementSchema, parseTags } from "@/lib/validation";
import { analyzeRequirementWithAI } from "@/lib/matching";

export type FormState = { error?: string } | undefined;

export async function createRequirementAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "DEMANDER") {
    return { error: "只有需求方账号可以发布需求" };
  }

  const parsed = requirementSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    tags: formData.get("tags") ?? "",
    budgetMin: formData.get("budgetMin") || undefined,
    budgetMax: formData.get("budgetMax") || undefined,
    deadline: formData.get("deadline") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "输入有误" };
  }

  const { title, description, category, tags, budgetMin, budgetMax, deadline } = parsed.data;

  const manualTags = parseTags(tags);
  const aiResult = await analyzeRequirementWithAI({ title, description, category });
  const finalTags = Array.from(new Set([...manualTags, ...(aiResult?.tags ?? [])]));

  const requirement = await prisma.requirement.create({
    data: {
      ownerId: session.userId,
      title,
      description,
      category,
      tags: finalTags.join(","),
      budgetMin: budgetMin ?? null,
      budgetMax: budgetMax ?? null,
      deadline: deadline ? new Date(deadline) : null,
      aiSummary: aiResult?.summary ?? null,
    },
  });

  revalidatePath("/requirements");
  redirect(`/requirements/${requirement.id}`);
}

export async function applyToRequirementAction(requirementId: string, formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "PROVIDER") {
    throw new Error("只有服务方账号可以申请承接需求");
  }

  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);

  await prisma.application.upsert({
    where: {
      requirementId_providerId: {
        requirementId,
        providerId: session.userId,
      },
    },
    create: {
      requirementId,
      providerId: session.userId,
      message: message || null,
    },
    update: {
      message: message || null,
      status: "PENDING",
    },
  });

  revalidatePath(`/requirements/${requirementId}`);
}

export async function updateApplicationStatusAction(
  applicationId: string,
  status: "SHORTLISTED" | "ACCEPTED" | "REJECTED"
) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { requirement: true },
  });

  if (!application || application.requirement.ownerId !== session.userId) {
    throw new Error("无权操作该申请");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  if (status === "ACCEPTED") {
    await prisma.requirement.update({
      where: { id: application.requirementId },
      data: { status: "IN_PROGRESS" },
    });
  }

  revalidatePath(`/requirements/${application.requirementId}`);
}
