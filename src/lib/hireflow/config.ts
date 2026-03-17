import type { FrameOption, RecordingPreset, WizardStep } from "@/lib/hireflow/types";

export const APP_BRAND = "Mediocre Company";
export const APP_COMPANY = "Mediocre Company";
export const APP_MANIFESTO = "Make Something Wonderful.";
export const APP_CREW_COPY = "我们是一群少年心气又脚踏实地做酷产品的海盗";
export const OPEN_ROLES_EMAIL = process.env.NEXT_PUBLIC_OPEN_ROLES_EMAIL ?? "hr@iftech.io";
export const VISUAL_STEPS: WizardStep[] = ["method", "consent", "format", "frame", "record", "submit"];
export const STEP_LABELS: Record<WizardStep, string> = {
  method: "申请方式",
  consent: "知情同意",
  format: "视频时长",
  frame: "画幅比例",
  record: "录制视频",
  submit: "提交申请",
};

export const PRESET_META: Record<
  RecordingPreset,
  { label: string; subtitle: string; durationSeconds: number }
> = {
  pitch: {
    label: "90 秒快答",
    subtitle: "适合简洁有力地介绍自己。",
    durationSeconds: 90,
  },
  "deep-dive": {
    label: "3 分钟详述",
    subtitle: "留出更多空间讲清经历与动机。",
    durationSeconds: 180,
  },
};

export const FRAME_META: Record<FrameOption, { label: string; subtitle: string; aspectRatio: string }> = {
  landscape: {
    label: "横版 16:9",
    subtitle: "适合大多数录制场景",
    aspectRatio: "16 / 9",
  },
  portrait: {
    label: "竖版 3:4",
    subtitle: "更近景，更有交流感",
    aspectRatio: "3 / 4",
  },
};

export const VIDEO_ACCEPT = "video/webm,video/mp4";
export const RESUME_ACCEPT = "application/pdf";
export const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 80 * 1024 * 1024;
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
