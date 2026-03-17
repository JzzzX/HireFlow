import { NextResponse } from "next/server";

import { APP_BRAND } from "@/lib/hireflow/config";
import { getJobById } from "@/lib/hireflow/jobs";
import type { SubmissionPayload } from "@/lib/hireflow/types";
import { sendEmail } from "@/lib/server/email";
import { getUploadByKey, persistSubmission } from "@/lib/server/runtime-store";
import { verifyTurnstile } from "@/lib/server/turnstile";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SubmissionPayload | null;

  if (!body) {
    return NextResponse.json({ message: "缺少提交数据。" }, { status: 400 });
  }

  if (!body.applicantName?.trim() || !body.applicantEmail?.trim()) {
    return NextResponse.json({ message: "姓名和邮箱不能为空。" }, { status: 400 });
  }

  const job = getJobById(body.jobId);
  if (!job) {
    return NextResponse.json({ message: "职位不存在或已下线。" }, { status: 400 });
  }

  const turnstile = await verifyTurnstile(body.turnstileToken, request.headers.get("x-forwarded-for"));
  if (!turnstile.ok) {
    return NextResponse.json({ message: "请先完成人机验证再提交。" }, { status: 403 });
  }

  const video = await getUploadByKey(body.videoAssetKey);
  const resume = await getUploadByKey(body.resumeAssetKey);
  if (!video || !resume) {
    return NextResponse.json({ message: "找不到已上传的文件。" }, { status: 400 });
  }

  const record = await persistSubmission({
    jobId: body.jobId,
    applicantName: body.applicantName,
    applicantEmail: body.applicantEmail,
    acceptedTerms: body.acceptedTerms,
    aiOptOut: body.aiOptOut,
    preset: body.preset,
    frame: body.frame,
    videoAssetKey: body.videoAssetKey,
    resumeAssetKey: body.resumeAssetKey,
    jobTitle: job.title,
    department: job.department,
    team: job.team,
    category: job.category,
    locationLabel: job.locationLabel,
    level: job.level,
    applyEmail: job.applyEmail,
  });
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const videoUrl = `${origin}/api/uploads/file/${video.assetKey}`;
  const resumeUrl = `${origin}/api/uploads/file/${resume.assetKey}`;
  const notifyEmail = job.applyEmail || process.env.NOTIFY_EMAIL || "hr@iftech.io";

  try {
    const emailResult = await sendEmail({
      to: notifyEmail,
      subject: `${APP_BRAND} 新申请：${job.title} / ${body.applicantName}`,
      text: [
        `申请编号：${record.referenceId}`,
        `职位：${job.title}`,
        `团队：${job.team}`,
        `部门：${job.department}`,
        `分类：${job.category}`,
        `地点：${job.locationLabel}`,
        `姓名：${body.applicantName}`,
        `邮箱：${body.applicantEmail}`,
        `视频时长：${body.preset}`,
        `画幅：${body.frame}`,
        `是否退出 AI 文本分析：${body.aiOptOut ? "是" : "否"}`,
        `视频下载：${videoUrl}`,
        `简历下载：${resumeUrl}`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>${APP_BRAND} 新申请</h2>
          <p><strong>申请编号：</strong>${record.referenceId}</p>
          <p><strong>职位：</strong>${job.title}</p>
          <p><strong>团队：</strong>${job.team}</p>
          <p><strong>部门：</strong>${job.department}</p>
          <p><strong>分类：</strong>${job.category}</p>
          <p><strong>地点：</strong>${job.locationLabel}</p>
          <p><strong>姓名：</strong>${body.applicantName}</p>
          <p><strong>邮箱：</strong>${body.applicantEmail}</p>
          <p><strong>视频时长：</strong>${body.preset}</p>
          <p><strong>画幅：</strong>${body.frame}</p>
          <p><strong>是否退出 AI 文本分析：</strong>${body.aiOptOut ? "是" : "否"}</p>
          <p><a href="${videoUrl}">下载视频</a></p>
          <p><a href="${resumeUrl}">下载简历</a></p>
        </div>
      `,
    });

    return NextResponse.json({
      message: emailResult.preview
        ? `申请已记录，编号 ${record.referenceId}。邮件预览已输出到服务端日志。`
        : `申请提交成功，编号 ${record.referenceId}。`,
    });
  } catch (error) {
    console.error("[hireflow-submit-email-failed]", {
      referenceId: record.referenceId,
      notifyEmail,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json({
      message: `申请已记录，编号 ${record.referenceId}。通知邮件暂时发送失败，团队可稍后从系统记录中查看。`,
    });
  }
}
