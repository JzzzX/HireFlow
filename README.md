# hiring_assist

即刻招聘视频投递站点。候选人可以浏览职位、查看 JD、录制自我介绍视频、上传简历，并直接把申请投递给 HR 邮箱。

当前线上入口：

- `https://hiringassist.vercel.app`

## 功能范围

- 职位列表页，支持按分类浏览
- 右侧 JD 详情面板
- 视频申请向导
- 浏览器内摄像头录制与回看
- PDF 简历上传
- Turnstile 人机验证
- 申请提交后通知 HR，并附带视频/简历下载链接
- 传统邮件投递入口，带引导弹窗

## 技术栈

- Next.js 16
- React 19
- Tailwind CSS 4
- 腾讯云 COS，S3 兼容直传
- Upstash Redis
- Cloudflare Turnstile
- Resend
- Vercel

## 当前申请链路

1. 候选人在 `/` 浏览职位并进入 `/apply/[jobId]`
2. 浏览器录制视频并选择 PDF 简历
3. 前端请求 `/api/uploads/sign`
4. 服务端返回 COS presigned PUT URL
5. 浏览器直接上传文件到 COS
6. 前端调用 `/api/uploads/ingest` 确认上传完成
7. 候选人完成一次 Turnstile
8. 前端调用 `/api/submit`
9. 服务端校验职位、Turnstile、已上传资产
10. 服务端向 HR 邮箱发送一封申请通知邮件，邮件内包含下载链接

当前版本已移除 OTP 验证，候选人邮箱仅作为联系信息随申请一并发送给 HR。

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开 `http://localhost:3000`。

## 环境变量

复制 `.env.example` 为 `.env.local`，并填写以下变量：

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NOTIFY_EMAIL=

NEXT_PUBLIC_OPEN_ROLES_EMAIL=
NEXT_PUBLIC_APPLY_EMAIL_OVERRIDE=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET_NAME=
COS_REGION=
```

说明：

- `NOTIFY_EMAIL`：最终 HR 通知收件邮箱
- `NEXT_PUBLIC_OPEN_ROLES_EMAIL`：页面顶部展示邮箱
- `NEXT_PUBLIC_APPLY_EMAIL_OVERRIDE`：覆盖职位默认投递邮箱，便于统一切到测试收件箱

## 第三方平台配置

### Turnstile

允许的 Hostname 至少包含：

- `localhost`
- `hiringassist.vercel.app`

### 腾讯云 COS CORS

至少允许以下 Origin：

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://hiringassist.vercel.app"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

### Resend

当前第一阶段测试建议把 HR 通知收件箱保持为 Resend 账号自身邮箱。若要切换到其他邮箱，需要：

1. 在 Resend 验证自有域名
2. 将 `RESEND_FROM_EMAIL` 改成该域名下的地址
3. 再把 `NOTIFY_EMAIL` / `NEXT_PUBLIC_APPLY_EMAIL_OVERRIDE` 切到目标邮箱

## 验证命令

```bash
npm run lint -- --max-warnings=0
npm run build
```

## 部署

当前已部署到 Vercel。后续 redeploy 前，确认：

- Vercel 环境变量已同步
- Turnstile 已加入线上域名
- COS CORS 已加入线上域名

然后直接重新部署即可。
