# 即刻招聘 生产就绪设计 (v2 — 修正版)

## 概述

将 HireFlow demo 升级为即刻公司真实可用的招聘入口。大部分 UI 功能已由 Codex 完成（职位列表、详情面板、视频录制wizard、OTP验证、提交邮件通知）。剩余工作：替换真实数据、R2存储、Turnstile人机验证。

## 已完成 (不需要改动的部分)

- 职位列表页 (`src/components/job-list.tsx`, `job-directory.tsx`, `job-detail-panel.tsx`)
- 申请流程 wizard (`src/components/hireflow-app.tsx`, 1309行)
- 路由 (`src/app/page.tsx` → 职位列表, `src/app/apply/[jobId]/page.tsx` → 申请)
- OTP 验证 (`src/app/api/otp/send/route.ts`, `verify/route.ts`)
- 提交 + HR 邮件通知 (`src/app/api/submit/route.ts`, 已用 `job.applyEmail`)
- 文件上传 token 系统 (`src/app/api/uploads/sign/route.ts`, `ingest/route.ts`)
- 类型系统 (`src/lib/hireflow/types.ts`, Job 类型已含 department/team/region/level/applyEmail)

## 现有 Job 类型 (保持不变)

```ts
// 已有，不需要重定义
type Job = {
  id: string;
  title: string;
  department: string;
  team: string;
  region: JobRegion;
  locationLabel: string;
  level: string;
  overview: string;
  responsibilities: string[];
  applyEmail: string;
};
```

## 技术决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 部署 | Vercel | 零配置 |
| 视频存储 | Cloudflare R2 (presigned upload) | Vercel有4.5MB body限制，必须客户端直传 |
| 人机验证 | Cloudflare Turnstile | 免费，截图原版同款 |

## 环境变量 (新增)

```env
# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=hireflow-uploads

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

---

## 工作项 1: 替换即刻真实招聘数据

### 修改: `src/lib/hireflow/jobs.ts`

当前有 6 个示例职位（Korean intern, Singapore People Ops 等），全部替换为即刻 careers 页面的 ~18 个真实职位。

数据来源：`okjike.com/careers` 各分类页面 + 各职位详情页。

| 分类 | 职位 |
|------|------|
| 实习 | 小宇宙内容运营实习生、小宇宙产品实习生、AI产品助理实习生、小宇宙商业化项目运营实习生、小宇宙算法实习生、小宇宙创作者运营实习生 |
| 技术 | SRE工程师、小宇宙iOS开发工程师、小宇宙前端开发工程师、AI插件全栈工程师(偏前端)、AI工具后端工程师、小宇宙算法工程师 |
| 产品/设计 | 产品经理(小宇宙商业化方向)、UI设计师 |
| 运营/市场 | 小宇宙内容运营实习生、大客户经理、小宇宙商业化项目运营实习生、小宇宙商务运营-产品运营方向 |

需要适配现有 `Job` 类型字段：
- `region`: 全部为 "China" (现有 JobRegion 类型需要检查是否包含)
- `department`: 按分类映射
- `team`: "即刻" or "小宇宙"
- `applyEmail`: "hr@iftech.io"
- `overview` + `responsibilities`: 从各职位详情页提取

如果现有 `JobRegion` 类型不包含 "China"，需要调整为中文分类方式（实习/技术/产品&设计/运营&市场）。这可能需要修改 `types.ts` 中的 `JobRegion` 类型和 `job-list.tsx` 中的 tab 筛选逻辑。

### 修改: `src/lib/hireflow/config.ts`

- `APP_BRAND`: "HireFlow" → "即刻"
- `OPEN_ROLES_EMAIL`: → "hr@iftech.io"

---

## 工作项 2: R2 文件存储 (客户端直传)

### 关键变更：客户端直传 R2

Vercel serverless function 有 4.5MB body 限制，视频最大 80MB 不可能通过 API route 中转。必须改为 **presigned upload URL** 方案：

**上传流程变更：**
```
当前: 前端 → /api/uploads/ingest (serverless) → 写本地磁盘
改为: 前端 → /api/uploads/sign (获取presigned URL) → 直接 PUT 到 R2
```

### 新建: `src/lib/server/r2.ts`

```ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 S3 兼容客户端
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

// 生成上传用 presigned URL (前端直传用)
export async function getPresignedUploadUrl(
  key: string, contentType: string, maxSize: number
): Promise<string>;

// 生成下载用 presigned URL (邮件链接用)
export async function getPresignedDownloadUrl(
  key: string, expiresInSeconds?: number // 默认 30 天
): Promise<string>;
```

### 修改: `src/app/api/uploads/sign/route.ts`

当前：发 token + assetKey
改为：发 token + assetKey + **R2 presigned upload URL**

```ts
// 返回给前端:
{
  token: string;
  assetKey: string;
  uploadUrl: string;  // 新增: R2 presigned PUT URL
}
```

### 修改: `src/app/api/uploads/ingest/route.ts`

当前：接收文件 body 存本地
改为：**前端已直传 R2**，此 endpoint 改为"确认上传完成"：
- 前端上传完成后调用此 endpoint 通知后端
- 后端记录 assetKey → R2 key 的映射到 runtime store
- 不再接收文件 body

### 修改: `src/app/api/uploads/file/[assetKey]/route.ts`

当前：从本地读文件返回
改为：生成 R2 presigned download URL → 302 重定向

### 修改: `src/components/hireflow-app.tsx`

上传逻辑变更：
```ts
// 当前:
// 1. POST /api/uploads/sign → { token, assetKey }
// 2. PUT /api/uploads/ingest + file body

// 改为:
// 1. POST /api/uploads/sign → { token, assetKey, uploadUrl }
// 2. PUT uploadUrl (直传R2) + file body
// 3. POST /api/uploads/ingest (确认上传完成, 不带file body)
```

### 修改: `src/lib/server/runtime-store.ts`

- `consumeUploadToken`: 不再写本地文件，只记录 R2 key
- 移除 `ensureUploadsRoot` 等本地文件系统操作
- `persistSubmission`: 替换为 R2 存储 JSON 或直接移除（邮件是主要记录）

### 修改: `src/app/api/submit/route.ts`

- 视频和简历的下载链接改为 R2 presigned download URL (30天有效期)
- 保持现有 `applyEmail` 逻辑不变

### 新增依赖

`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

### R2 CORS 配置

R2 bucket 需要配置 CORS 允许前端域名直接上传:
```json
[{
  "AllowedOrigins": ["https://your-domain.vercel.app", "http://localhost:3000"],
  "AllowedMethods": ["PUT", "GET"],
  "AllowedHeaders": ["Content-Type"],
  "MaxAgeSeconds": 3600
}]
```

---

## 工作项 3: Cloudflare Turnstile 人机验证

### 新建: `src/lib/server/turnstile.ts`

```ts
export async function verifyTurnstile(token: string): Promise<boolean> {
  // POST https://challenges.cloudflare.com/turnstile/v0/siteverify
  // body: { secret: TURNSTILE_SECRET_KEY, response: token }
}
```

### 修改: `src/components/hireflow-app.tsx`

**Submit 步骤：**
- "Submit Application" 按钮上方嵌入 Turnstile widget
- 用 `window.turnstile.render()` 挂载，验证成功后 token 存入 draft.turnstileToken
- Submit 按钮在无 token 时 disabled

**OTP 发送：**
- Send Code 按钮点击前需要独立的 Turnstile 验证
- OTP 步骤和 Submit 步骤各自有自己的 Turnstile widget 实例
- Turnstile token 是一次性的，所以两个步骤分别渲染独立的 widget

**Turnstile token 生命周期：**
- OTP 步骤：用户进入 submit 页面时渲染 widget → 获取 token → 发送 OTP 时消耗
- Submit 步骤：OTP 验证完成后渲染新的 widget → 获取 token → 提交时消耗
- 如果 token 过期（5分钟），自动重新渲染 widget

### 修改: `src/lib/hireflow/types.ts`

```ts
// ApplicationDraft 增加:
turnstileToken: string | null;

// SubmissionPayload 增加:
turnstileToken: string;
```

### 修改: `src/app/api/submit/route.ts`

- 提交前验证 `body.turnstileToken`，失败返回 403

### 修改: `src/app/api/otp/send/route.ts`

- 发送 OTP 前验证 Turnstile token，防止滥发
- 请求 body 增加 `turnstileToken` 字段

### 开发模式

Cloudflare 测试 key（始终通过）: `1x00000000000000000000AA`

---

## 修改文件清单 (修正版)

| 操作 | 文件 | 说明 |
|------|------|------|
| **新建** | `src/lib/server/r2.ts` | R2 S3 客户端 |
| **新建** | `src/lib/server/turnstile.ts` | Turnstile 验证 |
| **修改** | `src/lib/hireflow/jobs.ts` | 替换为即刻真实招聘数据 |
| **修改** | `src/lib/hireflow/config.ts` | 品牌 → 即刻 |
| **修改** | `src/lib/hireflow/types.ts` | 增加 turnstileToken 字段 |
| **修改** | `src/components/hireflow-app.tsx` | R2直传 + Turnstile widget |
| **修改** | `src/app/api/uploads/sign/route.ts` | 返回 R2 presigned upload URL |
| **修改** | `src/app/api/uploads/ingest/route.ts` | 改为确认上传完成 |
| **修改** | `src/app/api/uploads/file/[assetKey]/route.ts` | R2 presigned download URL |
| **修改** | `src/app/api/submit/route.ts` | Turnstile验证 + R2下载链接 |
| **修改** | `src/app/api/otp/send/route.ts` | Turnstile验证 |
| **修改** | `src/lib/server/runtime-store.ts` | 移除本地文件存储 |
| **修改** | `.env.example` | 新增环境变量 |
| **修改** | `package.json` | 新增 @aws-sdk 依赖 |
| 可能修改 | `src/lib/hireflow/types.ts` | JobRegion 调整（如需中文分类） |
| 可能修改 | `src/components/job-list.tsx` | Tab 筛选逻辑调整 |

---

## 验证计划

### 本地开发
1. `npm run dev` → `/` 显示即刻真实职位列表
2. 分类筛选正常
3. 职位详情 → Apply → 进入录制流程
4. 录制视频 → 检查 R2 bucket 有文件（用 Cloudflare dashboard）
5. OTP 发送 → Turnstile 验证（测试 key）
6. 提交 → HR 邮箱收到带 R2 下载链接的通知
7. 下载链接可用（30天有效期）

### Vercel 部署后
1. 配置所有环境变量
2. 端到端走完全流程
3. R2 CORS 配置验证
4. 确认视频上传不经过 serverless function

## 上线 Checklist

- [ ] Cloudflare: 创建 R2 bucket + 配置 CORS
- [ ] Cloudflare: 创建 Turnstile site，获取 site key + secret key
- [ ] Resend: 配置发信域名（或用默认测试域名）
- [ ] 从 okjike.com/careers 提取全部职位 JD 数据
- [ ] Vercel: 创建项目 + 配置环境变量
- [ ] 端到端测试通过
