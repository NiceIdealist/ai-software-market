import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const demander = await prisma.user.upsert({
    where: { email: "demander@example.com" },
    update: {},
    create: {
      email: "demander@example.com",
      name: "张女士（需求方）",
      passwordHash,
      role: "DEMANDER",
    },
  });

  const devProvider = await prisma.user.upsert({
    where: { email: "dev@example.com" },
    update: {},
    create: {
      email: "dev@example.com",
      name: "李工（全栈开发）",
      passwordHash,
      role: "PROVIDER",
      providerProfile: {
        create: {
          track: "DEV",
          headline: "5 年全栈工程师，擅长 React / Node / Postgres",
          bio: "曾负责多个电商与 SaaS 项目的从 0 到 1 开发，熟悉支付、订单、权限系统设计。",
          tags: "react,node,postgres,typescript,nextjs",
          hourlyRate: 80,
          yearsExperience: 5,
        },
      },
    },
  });

  const testProvider = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "王工（测试工程师）",
      passwordHash,
      role: "PROVIDER",
      providerProfile: {
        create: {
          track: "TEST",
          headline: "资深测试工程师，自动化测试与性能测试专家",
          bio: "熟悉 Playwright、Jest、k6，擅长为中大型系统搭建自动化回归测试体系。",
          tags: "playwright,jest,k6,automation,qa",
          hourlyRate: 60,
          yearsExperience: 4,
        },
      },
    },
  });

  const opsProvider = await prisma.user.upsert({
    where: { email: "ops@example.com" },
    update: {},
    create: {
      email: "ops@example.com",
      name: "赵工（运维工程师）",
      passwordHash,
      role: "PROVIDER",
      providerProfile: {
        create: {
          track: "OPS",
          headline: "云原生运维专家，熟悉 K8s / AWS / 监控告警体系",
          bio: "负责过多个高并发系统的部署与稳定性保障，擅长成本优化与灾备方案设计。",
          tags: "kubernetes,aws,docker,monitoring,devops",
          hourlyRate: 70,
          yearsExperience: 6,
        },
      },
    },
  });

  const requirement = await prisma.requirement.upsert({
    where: { id: "seed-requirement-1" },
    update: {},
    create: {
      id: "seed-requirement-1",
      ownerId: demander.id,
      title: "为跨境电商开发订单管理后台",
      description:
        "需要开发一个订单管理后台，包含订单列表、状态流转、退款处理、多语言支持，技术栈希望使用 React + Node + Postgres。",
      category: "DEV",
      tags: "react,node,postgres",
      budgetMin: 20000,
      budgetMax: 40000,
      status: "OPEN",
    },
  });

  await prisma.application.upsert({
    where: {
      requirementId_providerId: { requirementId: requirement.id, providerId: devProvider.id },
    },
    update: {},
    create: {
      requirementId: requirement.id,
      providerId: devProvider.id,
      message: "我有类似电商后台开发经验，可以提供技术方案与排期。",
    },
  });

  console.log("Seed data created:");
  console.log({ demander: demander.email, devProvider: devProvider.email, testProvider: testProvider.email, opsProvider: opsProvider.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
