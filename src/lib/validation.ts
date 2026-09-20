import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "姓名至少 2 个字符").max(60),
  email: z.string().trim().toLowerCase().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少 8 位"),
  role: z.enum(["DEMANDER", "PROVIDER"]),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export const requirementSchema = z.object({
  title: z.string().trim().min(4, "标题至少 4 个字符").max(120),
  description: z.string().trim().min(20, "需求描述至少 20 个字符").max(5000),
  category: z.enum(["DEV", "TEST", "OPS"]),
  tags: z.string().trim().max(300).optional().default(""),
  budgetMin: z.coerce.number().nonnegative().optional().nullable(),
  budgetMax: z.coerce.number().nonnegative().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export const providerProfileSchema = z.object({
  track: z.enum(["DEV", "TEST", "OPS"]),
  headline: z.string().trim().min(4, "标题至少 4 个字符").max(120),
  bio: z.string().trim().min(20, "个人简介至少 20 个字符").max(3000),
  tags: z.string().trim().max(300),
  hourlyRate: z.coerce.number().nonnegative().optional().nullable(),
  yearsExperience: z.coerce.number().int().nonnegative().optional().nullable(),
  portfolioUrl: z
    .string()
    .trim()
    .url("请输入合法的 URL")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

export function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,，、\s]+/)
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}
