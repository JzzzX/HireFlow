# 即刻招聘 生产就绪 — 实施计划

## Context
HireFlow demo 已由 Codex 基本完成：职位列表、详情面板、视频录制 wizard、OTP 验证、HR 邮件通知全部就绪。现在需要三项改造使其真正可用：替换即刻真实数据、R2 云存储（Vercel 无磁盘）、Turnstile 人机验证。

完整设计文档: `docs/superpowers/specs/2026-03-17-production-readiness-design.md`

## 实施步骤 (14步)

### Phase 1: 即刻真实数据 (Step 1-3)

**Step 1**: 从 okjike.com/careers 各职位详情页提取全部 ~18 个职位的 JD 数据

**Step 2**: 修改 `src/lib/hireflow/jobs.ts` — 替换示例数据为即刻真实职位，适配现有 Job 类型（department/team/region/locationLabel/level/applyEmail）。如需调整 JobRegion 类型（现有可能按国家分，即刻全在上海，需改为按分类筛选），同步修改 `types.ts` 和 `job-list.tsx` 的 tab 逻辑

**Step 3**: 修改 `src/lib/hireflow/config.ts` — 品牌 "HireFlow" → "即刻"，邮箱 → "hr@iftech.io"

### Phase 2: R2 文件存储 — 客户端直传 (Step 4-9)

**Step 4**: 安装 `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`

**Step 5**: 新建 `src/lib/server/r2.ts` — R2 S3 客户端，含 getPresignedUploadUrl / getPresignedDownloadUrl

**Step 6**: 修改 `src/app/api/uploads/sign/route.ts` — 返回 R2 presigned upload URL（前端直传用）

**Step 7**: 修改 `src/app/api/uploads/ingest/route.ts` — 改为"确认上传完成"端点，不再接收 file body

**Step 8**: 修改 `src/app/api/uploads/file/[assetKey]/route.ts` — 生成 R2 presigned download URL → 302

**Step 9**: 修改 `src/components/hireflow-app.tsx` 上传逻辑 — sign 获取 uploadUrl → PUT 直传 R2 → ingest 确认完成

### Phase 3: Turnstile 人机验证 (Step 10-13)

**Step 10**: 新建 `src/lib/server/turnstile.ts` — verifyTurnstile(token)

**Step 11**: 修改 `src/components/hireflow-app.tsx` — Submit 页嵌入 Turnstile widget，OTP 和 Submit 各自独立 widget

**Step 12**: 修改 `src/app/api/submit/route.ts` — 提交前验证 Turnstile token

**Step 13**: 修改 `src/app/api/otp/send/route.ts` — 发送 OTP 前验证 Turnstile token

### Phase 4: 收尾 (Step 14)

**Step 14**: 修改 `src/lib/server/runtime-store.ts` — 移除本地 fs 操作 + 更新 `.env.example` + `types.ts` 增加 turnstileToken

## 验证
1. `npm run dev` → `/` 显示即刻真实职位
2. 分类筛选 → 详情面板 → Apply → 录制 → R2 上传成功
3. OTP + Turnstile → 提交 → HR 邮箱收到带 R2 下载链接的通知
