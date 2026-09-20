import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import RequirementForm from "./RequirementForm";

export default async function NewRequirementPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/requirements/new");
  if (session.role !== "DEMANDER") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-neutral-500">
        只有需求方账号可以发布需求。
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">发布需求</h1>
      <p className="mb-8 text-sm text-neutral-500">
        描述越清晰，AI 匹配到的服务方越精准。系统会自动从描述中提取补充技能标签。
      </p>
      <RequirementForm />
    </div>
  );
}
