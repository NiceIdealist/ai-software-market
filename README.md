# AI 软件交易平台

一个软件外包 / 众包交易平台：需求方发布软件开发、测试、运维需求，平台通过规则 + AI 辅助的方式，将需求智能撮合给合适的开发者、测试工程师、运维工程师。

## 功能概览

- **账号体系**：需求方 / 服务方两种角色，邮箱密码注册登录（JWT session cookie）。
- **需求发布与浏览**：需求方发布标题、描述、类别（开发/测试/运维）、预算、截止日期、技能标签；所有人可浏览与搜索。
- **服务方档案**：方向（DEV/TEST/OPS）、技能标签、时薪、经验年限、作品集链接。
- **AI 智能撮合**：
  - 发布需求时，若配置了 `ANTHROPIC_API_KEY`，调用大模型从需求描述中提取补充技能标签与一句话评估；未配置时功能自动降级为纯手动标签。
  - 无论是否启用大模型，撮合排序始终使用可解释的规则引擎（方向匹配 + 技能标签重合度 + 经验 + 预算契合度），需求方能看到候选服务方的推荐理由，服务方也能在控制台看到为自己推荐的需求。
- **申请与录用流程**：服务方申请承接需求，需求方可将申请标记为入围 / 录用 / 拒绝，录用后需求状态自动流转为进行中。

## 技术栈

- Next.js 16（App Router + Server Actions）+ TypeScript + Tailwind CSS
- Prisma 7（SQLite，通过 `@prisma/adapter-better-sqlite3` 驱动适配器）
- 轻量自建鉴权：`bcryptjs` 哈希密码 + `jose` 签发 JWT session cookie（未使用 next-auth，避免与 Next 16 / React 19 的 peer dependency 冲突）
- `zod` 做表单校验

## 本地开发

```bash
npm install
cp .env.example .env   # 并生成一个随机 AUTH_SECRET（如 `openssl rand -base64 32`）
npm run db:migrate      # 创建 SQLite 数据库并应用迁移
npm run db:seed         # 写入演示数据（需求方 + 开发/测试/运维服务方各一名）
npm run dev
```

演示账号（密码均为 `password123`）：

- 需求方：`demander@example.com`
- 开发：`dev@example.com`
- 测试：`test@example.com`
- 运维：`ops@example.com`

## 项目结构

```
src/
  app/
    (auth)/            登录、注册页面与 server actions
    requirements/       需求浏览、发布、详情、申请/撮合逻辑
    profile/            服务方档案编辑
    dashboard/          需求方 / 服务方控制台
  components/           NavBar 等共享组件
  lib/
    auth.ts             密码哈希、session cookie、当前用户
    matching.ts          规则撮合引擎 + 可选的 LLM 需求分析
    prisma.ts            Prisma Client 单例
    validation.ts         zod 表单校验 schema
prisma/
  schema.prisma          数据模型
  seed.ts                演示数据
```

## 后续可扩展方向

- 站内消息 / 通知
- 在线支付与担保交易
- 交付物验收与评价体系
- 管理员后台（审核、纠纷处理）
