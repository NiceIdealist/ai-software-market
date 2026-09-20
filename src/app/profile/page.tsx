import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");
  if (session.role !== "PROVIDER") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-neutral-500">
        只有服务方账号才有服务档案。
      </div>
    );
  }

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.userId },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">我的服务档案</h1>
      <p className="mb-8 text-sm text-neutral-500">
        完善技能标签和经验，能显著提高被 AI 匹配推荐的概率。
      </p>
      <ProfileForm profile={profile} />
    </div>
  );
}
