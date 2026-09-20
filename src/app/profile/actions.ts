"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { providerProfileSchema } from "@/lib/validation";

export type FormState = { error?: string; success?: boolean } | undefined;

export async function saveProviderProfileAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "PROVIDER") {
    return { error: "只有服务方账号可以设置服务档案" };
  }

  const parsed = providerProfileSchema.safeParse({
    track: formData.get("track"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    tags: formData.get("tags"),
    hourlyRate: formData.get("hourlyRate") || undefined,
    yearsExperience: formData.get("yearsExperience") || undefined,
    portfolioUrl: formData.get("portfolioUrl") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "输入有误" };
  }

  const { track, headline, bio, tags, hourlyRate, yearsExperience, portfolioUrl } = parsed.data;

  await prisma.providerProfile.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      track,
      headline,
      bio,
      tags: tags.toLowerCase(),
      hourlyRate: hourlyRate ?? null,
      yearsExperience: yearsExperience ?? null,
      portfolioUrl: portfolioUrl || null,
    },
    update: {
      track,
      headline,
      bio,
      tags: tags.toLowerCase(),
      hourlyRate: hourlyRate ?? null,
      yearsExperience: yearsExperience ?? null,
      portfolioUrl: portfolioUrl || null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
