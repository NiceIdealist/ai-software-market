import Link from "next/link";

const steps = [
  {
    title: "1. 发布需求",
    body: "需求方描述项目背景、预算与截止日期，选择开发 / 测试 / 运维类别。",
  },
  {
    title: "2. AI 智能撮合",
    body: "平台分析需求描述、提取技能标签，结合服务方的技能与经验自动排序推荐。",
  },
  {
    title: "3. 沟通与承接",
    body: "服务方申请承接，需求方从推荐列表中挑选并确认，进入交付与验收流程。",
  },
];

const tracks = [
  { label: "开发 DEV", desc: "前端、后端、移动端、AI 应用开发" },
  { label: "测试 TEST", desc: "功能测试、自动化测试、性能与安全测试" },
  { label: "运维 OPS", desc: "部署上线、监控告警、云资源与安全运维" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          AI 驱动的软件交易平台
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-neutral-500">
          需求方发布软件开发 / 测试 / 运维需求，平台用 AI 辅助分析需求并智能撮合最合适的服务方。
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            立即注册
          </Link>
          <Link
            href="/requirements"
            className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium dark:border-neutral-700"
          >
            浏览需求
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-800"
          >
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-neutral-500">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="text-center text-2xl font-semibold">覆盖全流程角色</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {tracks.map((track) => (
            <div
              key={track.label}
              className="rounded-lg bg-neutral-100 p-5 text-center dark:bg-neutral-900"
            >
              <div className="font-medium">{track.label}</div>
              <div className="mt-1 text-sm text-neutral-500">{track.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
