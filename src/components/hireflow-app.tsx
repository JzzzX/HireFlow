"use client";

import Link from "next/link";
import * as React from "react";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";

import { TurnstileWidget } from "@/components/turnstile-widget";
import {
  APP_BRAND,
  APP_COMPANY,
  FRAME_META,
  MAX_RESUME_SIZE_BYTES,
  PRESET_META,
  RESUME_ACCEPT,
  STEP_LABELS,
  VISUAL_STEPS,
} from "@/lib/hireflow/config";
import { consentParagraphs } from "@/lib/hireflow/consent-copy";
import type {
  ApplicationDraft,
  ApplyMethod,
  FrameOption,
  Job,
  MediaStatus,
  RecordStage,
  RecordingPreset,
  SubmissionPayload,
  UploadedAsset,
  UploadKind,
  WizardStep,
} from "@/lib/hireflow/types";

type Action =
  | { type: "step"; step: WizardStep }
  | { type: "method"; method: ApplyMethod }
  | { type: "terms"; value: boolean }
  | { type: "aiOptOut"; value: boolean }
  | { type: "preset"; preset: RecordingPreset }
  | { type: "frame"; frame: FrameOption }
  | { type: "recordStage"; stage: RecordStage }
  | { type: "mediaStatus"; status: MediaStatus }
  | { type: "timeLeft"; value: number }
  | { type: "recording"; url: string | null; mimeType: string | null }
  | { type: "applicantName"; value: string }
  | { type: "applicantEmail"; value: string }
  | { type: "submitTurnstileToken"; value: string | null }
  | { type: "resumeName"; value: string | null }
  | { type: "submitState"; status: ApplicationDraft["submitStatus"]; message?: string | null }
  | { type: "resetSubmission" };

const initialDraft: ApplicationDraft = {
  method: null,
  acceptedTerms: false,
  aiOptOut: false,
  preset: "pitch",
  frame: "landscape",
  recordStage: "setup",
  mediaStatus: {
    cameraReady: false,
    micReady: false,
    lightingReady: false,
    unsupported: false,
  },
  recordingTimeLeft: PRESET_META.pitch.durationSeconds,
  recordingUrl: null,
  recordingMimeType: null,
  applicantName: "",
  applicantEmail: "",
  submitTurnstileToken: null,
  resumeName: null,
  submitStatus: "idle",
  submitMessage: null,
};

function draftReducer(state: ApplicationDraft, action: Action): ApplicationDraft {
  switch (action.type) {
    case "step":
      return { ...state, submitMessage: null, submitStatus: state.submitStatus === "success" ? "success" : "idle" };
    case "method":
      return { ...state, method: action.method };
    case "terms":
      return { ...state, acceptedTerms: action.value };
    case "aiOptOut":
      return { ...state, aiOptOut: action.value };
    case "preset":
      return {
        ...state,
        preset: action.preset,
        recordingTimeLeft: PRESET_META[action.preset].durationSeconds,
      };
    case "frame":
      return { ...state, frame: action.frame };
    case "recordStage":
      return { ...state, recordStage: action.stage };
    case "mediaStatus":
      return { ...state, mediaStatus: action.status };
    case "timeLeft":
      return { ...state, recordingTimeLeft: action.value };
    case "recording":
      return { ...state, recordingUrl: action.url, recordingMimeType: action.mimeType };
    case "applicantName":
      return { ...state, applicantName: action.value };
    case "applicantEmail":
      return {
        ...state,
        applicantEmail: action.value,
        submitTurnstileToken: null,
      };
    case "submitTurnstileToken":
      return { ...state, submitTurnstileToken: action.value };
    case "resumeName":
      return { ...state, resumeName: action.value };
    case "submitState":
      return {
        ...state,
        submitStatus: action.status,
        submitMessage: action.message ?? state.submitMessage,
      };
    case "resetSubmission":
      return {
        ...state,
        submitStatus: "idle",
        submitMessage: null,
      };
    default:
      return state;
  }
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function activeVisualStep(step: WizardStep) {
  return VISUAL_STEPS.indexOf(step);
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${mins}:${String(remainder).padStart(2, "0")}`;
}

function pickMimeType() {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return "";
  }
  const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
  return candidates.find((value) => window.MediaRecorder.isTypeSupported(value)) ?? "";
}

function badgeClass(active: boolean) {
  return classNames(
    "grid h-3 w-3 place-items-center rounded-full transition-all duration-200",
    active ? "w-10 rounded-full bg-[#FFE411]" : "bg-[rgba(20,20,20,0.16)]",
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={classNames(
        "rounded-2xl bg-[#FFE411] px-7 py-3 text-sm font-semibold text-[#141414] transition hover:bg-[#f1d300] disabled:cursor-not-allowed disabled:bg-[#f6e991] disabled:text-[rgba(20,20,20,0.42)]",
        props.className,
      )}
    />
  );
}

function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={classNames(
        "rounded-2xl border border-[rgba(20,20,20,0.12)] bg-white px-7 py-3 text-sm font-semibold text-[#141414] transition hover:border-[rgba(20,20,20,0.24)] hover:bg-[#fffbe4] disabled:cursor-not-allowed disabled:opacity-60",
        props.className,
      )}
    />
  );
}

function DarkGhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={classNames(
        "min-w-[108px] rounded-[1.15rem] border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#FFE411]/60 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    />
  );
}

function DarkPrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={classNames(
        "min-w-[108px] rounded-[1.15rem] bg-[#FFE411] px-5 py-3 text-sm font-semibold text-[#141414] shadow-[0_12px_24px_rgba(255,228,17,0.26)] transition hover:bg-[#f1d300] disabled:cursor-not-allowed disabled:bg-[#c9b957] disabled:text-[rgba(20,20,20,0.5)]",
        props.className,
      )}
    />
  );
}

function StepBadge({
  step,
  active,
  completed,
  enabled,
  dark,
  onSelect,
}: {
  step: WizardStep;
  active: boolean;
  completed: boolean;
  enabled: boolean;
  dark: boolean;
  onSelect?: (step: WizardStep) => void;
}) {
  const clickable = enabled && completed && !active && onSelect;

  return (
    <button
      type="button"
      aria-label={STEP_LABELS[step]}
      aria-current={active ? "step" : undefined}
      disabled={!clickable}
      onClick={() => clickable && onSelect(step)}
      className={classNames(
        "rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFE411]",
        badgeClass(active),
        active
          ? "shadow-[0_0_0_1px_rgba(255,228,17,0.22)]"
          : clickable
            ? dark
              ? "bg-white/58 hover:bg-[#FFE411]"
              : "bg-[#141414] hover:bg-[#FFE411]"
            : dark
              ? "bg-white/18"
              : "bg-[rgba(20,20,20,0.16)]",
      )}
    />
  );
}

function StepShell({
  step,
  children,
  backHref,
  jobTitle,
  dark = false,
  minimalHeader = false,
  furthestStepIndex,
  disableStepNavigation = false,
  onStepSelect,
}: {
  step: WizardStep;
  children: React.ReactNode;
  backHref: string;
  jobTitle: string;
  dark?: boolean;
  minimalHeader?: boolean;
  furthestStepIndex: number;
  disableStepNavigation?: boolean;
  onStepSelect?: (step: WizardStep) => void;
}) {
  return (
    <div className={classNames("min-h-screen", dark ? "bg-[#131313] text-white" : "bg-[#FFFDF4] text-[#141414]")}>
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-5 py-6 sm:px-8 lg:px-12">
        {minimalHeader ? (
          <header className="flex items-center justify-center py-2">
            <div className="flex items-center gap-2">
              {VISUAL_STEPS.map((item, index) => (
                <StepBadge
                  key={item}
                  step={item}
                  active={index === activeVisualStep(step)}
                  completed={index <= furthestStepIndex}
                  enabled={!disableStepNavigation}
                  dark
                  onSelect={onStepSelect}
                />
              ))}
            </div>
          </header>
        ) : (
          <header className="flex items-center justify-between gap-4">
            <div className={classNames("flex items-center gap-8 text-sm", dark ? "text-white/60" : "text-[rgba(20,20,20,0.48)]")}>
              <div className="whitespace-nowrap text-[1.35rem] font-semibold tracking-[-0.05em] text-inherit sm:text-[1.5rem]">
                {APP_BRAND}
              </div>
              <Link href={backHref} className="hidden items-center gap-2 transition hover:text-current sm:flex">
                <span aria-hidden="true">&larr;</span>
                <span>返回职位列表</span>
              </Link>
              <div
                className={classNames(
                  "hidden max-w-[320px] truncate rounded-full px-4 py-1.5 text-xs font-semibold tracking-[0.18em] lg:block",
                  dark ? "bg-white/8 text-white/72" : "bg-[#FFF3A8] text-[#141414]",
                )}
              >
                {jobTitle}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {VISUAL_STEPS.map((item, index) => (
                <StepBadge
                  key={item}
                  step={item}
                  active={index === activeVisualStep(step)}
                  completed={index <= furthestStepIndex}
                  enabled={!disableStepNavigation}
                  dark={dark}
                  onSelect={onStepSelect}
                />
              ))}
            </div>
            <div className="w-[176px]" />
          </header>
        )}
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}

function IllustrationCard({ tone }: { tone: "blue" | "gold" | "rose" | "neutral" }) {
  const gradient =
    tone === "gold"
      ? "from-[#FFF8C9] via-[#FFE95A] to-[#FFE411]"
      : tone === "rose"
        ? "from-[#FFF7D5] via-[#FFEEC0] to-[#F7E4AE]"
        : tone === "blue"
          ? "from-[#FFF8D2] via-[#FFEFB1] to-[#FFE36F]"
          : "from-[#FFFDF0] via-[#FFF7D9] to-[#FFF0A4]";

  return (
    <div className="relative flex h-72 items-center justify-center overflow-hidden bg-[#FFFBE8]">
      <div className={classNames("absolute inset-x-8 inset-y-10 rounded-[2rem] bg-gradient-to-br opacity-95", gradient)} />
      <div className="relative flex h-44 w-56 items-center justify-center rounded-[2rem] border border-white/60 bg-white/50 shadow-[0_16px_38px_rgba(20,28,58,0.07)]">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white/75 shadow-inner">
          <div className="h-4 w-4 rounded-full bg-[#141414]" />
        </div>
      </div>
    </div>
  );
}

function FrameArtwork({ portrait }: { portrait: boolean }) {
  return (
    <div className="relative flex h-72 items-center justify-center overflow-hidden bg-[#FFFBE8]">
      <div className={classNames("rounded-[2rem] border border-white/80 bg-white/55 shadow-[0_16px_38px_rgba(20,28,58,0.07)]", portrait ? "h-48 w-36" : "h-48 w-[26rem] max-w-[84%]")} />
      <div className="absolute top-14 h-3 w-3 rounded-full bg-[#141414]" />
      <div className={classNames("absolute rounded-full bg-[#FFEFA2]", portrait ? "h-20 w-20" : "h-12 w-12")} />
    </div>
  );
}

function ReadinessPill({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className={classNames("flex items-center gap-2 text-sm", ready ? "text-white/80" : "text-white/35")}>
      <div
        className={classNames(
          "grid h-5 w-5 place-items-center rounded-full border text-[10px] font-semibold",
          ready ? "border-[#2A6D41] bg-[#183922] text-[#8EF6A8]" : "border-white/15 bg-white/6 text-white/35",
        )}
      >
        {ready ? "OK" : "--"}
      </div>
      <span>{label}</span>
    </div>
  );
}

async function uploadAsset(kind: UploadKind, file: Blob, filename: string, contentType: string): Promise<UploadedAsset> {
  const signResponse = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind,
      filename,
      contentType,
      size: file.size,
    }),
  });

  const signData = (await signResponse.json()) as {
    message?: string;
    token: string;
    assetKey: string;
    uploadUrl: string;
  };

  if (!signResponse.ok) {
    throw new Error(signData.message ?? "创建上传通道失败。");
  }

  const uploadResponse = await fetch(signData.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("上传失败。");
  }

  const confirmResponse = await fetch("/api/uploads/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: signData.token,
    }),
  });
  const confirmData = (await confirmResponse.json()) as UploadedAsset & { message?: string };

  if (!confirmResponse.ok) {
    throw new Error(confirmData.message ?? "上传确认失败。");
  }

  return confirmData;
}

async function createPosterFromVideoUrl(videoUrl: string) {
  return new Promise<string | null>((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    const cleanup = () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    const capture = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const context = canvas.getContext("2d");
        if (!context) {
          cleanup();
          resolve(null);
          return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const poster = canvas.toDataURL("image/jpeg", 0.86);
        cleanup();
        resolve(poster);
      } catch {
        cleanup();
        resolve(null);
      }
    };

    video.onloadeddata = () => {
      if (video.readyState >= 2) {
        capture();
      } else {
        cleanup();
        resolve(null);
      }
    };

    video.onerror = () => {
      cleanup();
      resolve(null);
    };
  });
}

type HireFlowAppProps = {
  job: Job;
};

export function HireFlowApp({ job }: HireFlowAppProps) {
  const [step, setStep] = useState<WizardStep>("method");
  const [furthestStepIndex, setFurthestStepIndex] = useState(0);
  const [draft, dispatch] = React.useReducer(draftReducer, initialDraft);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingPosterUrl, setRecordingPosterUrl] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [emailApplyOpen, setEmailApplyOpen] = useState(false);
  const [submitTurnstileKey, setSubmitTurnstileKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunkRef = useRef<Blob[]>([]);
  const previousApplicantEmailRef = useRef(initialDraft.applicantEmail);

  const backHref = `/?job=${encodeURIComponent(job.id)}`;
  const presetMeta = PRESET_META[draft.preset];
  const stepIndex = activeVisualStep(step);
  const emailApplyHref = `mailto:${job.applyEmail}?subject=${encodeURIComponent(`申请职位：${job.title}`)}`;
  const canContinueFromConsent = draft.acceptedTerms;
  const canSubmit =
    draft.applicantName.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(draft.applicantEmail) &&
    Boolean(recordingBlob) &&
    Boolean(resumeFile);

  const resetTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopMediaStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const resetRecording = () => {
    resetTimer();
    recorderRef.current = null;
    setRecordingBlob(null);
    setRecordingPosterUrl(null);
    setReviewStatus("idle");
    setReviewMessage(null);
    if (draft.recordingUrl) {
      URL.revokeObjectURL(draft.recordingUrl);
    }
    dispatch({ type: "recording", url: null, mimeType: null });
    dispatch({ type: "recordStage", stage: "setup" });
    dispatch({ type: "timeLeft", value: presetMeta.durationSeconds });
    setFurthestStepIndex((current) => Math.min(current, activeVisualStep("record")));
  };

  useEffect(() => {
    setFurthestStepIndex((current) => Math.max(current, stepIndex));
  }, [stepIndex]);

  useEffect(() => {
    if (previousApplicantEmailRef.current === draft.applicantEmail) {
      return;
    }

    previousApplicantEmailRef.current = draft.applicantEmail;
    setSubmitTurnstileKey((value) => value + 1);
  }, [draft.applicantEmail]);

  useEffect(() => {
    return () => {
      resetTimer();
      stopMediaStream();
      if (draft.recordingUrl) {
        URL.revokeObjectURL(draft.recordingUrl);
      }
    };
  }, [draft.recordingUrl]);

  useEffect(() => {
    if (step !== "record" || draft.recordStage === "review") {
      return;
    }

    if (streamRef.current) {
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") {
      dispatch({
        type: "mediaStatus",
        status: {
          cameraReady: false,
          micReady: false,
          lightingReady: false,
          unsupported: true,
          message: "当前浏览器不支持站内录制，请改用 Chrome，或选择邮件投递。",
        },
      });
      return;
    }

    let cancelled = false;

    async function bootstrapMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: draft.frame === "landscape" ? 720 : 960 },
          },
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (previewRef.current) {
          previewRef.current.srcObject = stream;
          previewRef.current.muted = true;
          await previewRef.current.play().catch(() => undefined);
        }

        dispatch({
          type: "mediaStatus",
          status: {
            cameraReady: stream.getVideoTracks().length > 0,
            micReady: stream.getAudioTracks().length > 0,
            lightingReady: stream.getVideoTracks().length > 0,
            unsupported: false,
            message: "设备已准备就绪，可以开始录制。",
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "无法访问摄像头或麦克风。";
        dispatch({
          type: "mediaStatus",
          status: {
            cameraReady: false,
            micReady: false,
            lightingReady: false,
            unsupported: false,
            message,
          },
        });
      }
    }

    void bootstrapMedia();

    return () => {
      cancelled = true;
    };
  }, [draft.frame, draft.recordStage, step]);

  useEffect(() => {
    if (step !== "record" || draft.recordStage === "review") {
      stopMediaStream();
    }
  }, [draft.recordStage, step]);

  function moveTo(nextStep: WizardStep) {
    startTransition(() => {
      dispatch({ type: "resetSubmission" });
      setStep(nextStep);
    });
  }

  function jumpToStep(nextStep: WizardStep) {
    const nextIndex = activeVisualStep(nextStep);
    if (nextIndex > furthestStepIndex || draft.recordStage === "recording") {
      return;
    }

    if (nextStep === "record") {
      dispatch({ type: "recordStage", stage: draft.recordingUrl ? "review" : "setup" });
    }

    moveTo(nextStep);
  }

  function handleBack() {
    if (step === "consent") {
      jumpToStep("method");
      return;
    }
    if (step === "format") {
      jumpToStep("consent");
      return;
    }
    if (step === "frame") {
      jumpToStep("format");
      return;
    }
    if (step === "record") {
      jumpToStep("frame");
      return;
    }
    if (step === "submit") {
      jumpToStep("record");
      return;
    }
  }

  function handlePresetChange(nextPreset: RecordingPreset) {
    if (nextPreset === draft.preset) {
      return;
    }

    if (recordingBlob || draft.recordingUrl) {
      resetRecording();
    }
    setFurthestStepIndex(activeVisualStep("format"));

    dispatch({ type: "preset", preset: nextPreset });
  }

  function handleFrameChange(nextFrame: FrameOption) {
    if (nextFrame === draft.frame) {
      return;
    }

    if (recordingBlob || draft.recordingUrl) {
      resetRecording();
    }
    setFurthestStepIndex(activeVisualStep("frame"));

    dispatch({ type: "frame", frame: nextFrame });
  }

  function startRecording() {
    if (!streamRef.current) {
      return;
    }

    setReviewStatus("idle");
    setReviewMessage(null);
    setRecordingPosterUrl(null);
    const mimeType = pickMimeType();
    const recorder = mimeType
      ? new MediaRecorder(streamRef.current, {
          mimeType,
          videoBitsPerSecond: 1_500_000,
          audioBitsPerSecond: 64_000,
        })
      : new MediaRecorder(streamRef.current);

    chunkRef.current = [];
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunkRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunkRef.current, { type: recorder.mimeType || "video/webm" });
      if (blob.size === 0) {
        setRecordingBlob(null);
        setReviewStatus("error");
        setReviewMessage("录制结果为空，请重新录制一次。");
        dispatch({ type: "recording", url: null, mimeType: null });
        dispatch({ type: "recordStage", stage: "review" });
        dispatch({ type: "timeLeft", value: presetMeta.durationSeconds });
        stopMediaStream();
        return;
      }

      const url = URL.createObjectURL(blob);
      setRecordingBlob(blob);
      setReviewStatus("loading");
      setReviewMessage("正在生成回看画面...");
      dispatch({ type: "recording", url, mimeType: blob.type });
      dispatch({ type: "recordStage", stage: "review" });
      dispatch({ type: "timeLeft", value: presetMeta.durationSeconds });
      stopMediaStream();

      void createPosterFromVideoUrl(url).then((poster) => {
        setRecordingPosterUrl(poster);
      });
    };

    let secondsLeft = presetMeta.durationSeconds;
    recorder.start(1000);
    dispatch({ type: "recordStage", stage: "recording" });
    dispatch({ type: "timeLeft", value: secondsLeft });
    resetTimer();
    timerRef.current = window.setInterval(() => {
      secondsLeft -= 1;
      dispatch({ type: "timeLeft", value: Math.max(0, secondsLeft) });
      if (secondsLeft <= 0) {
        stopRecording();
      }
    }, 1000);
  }

  function stopRecording() {
    resetTimer();
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!recordingBlob || !resumeFile) {
      dispatch({ type: "submitState", status: "error", message: "请先准备好视频和 PDF 简历。" });
      return;
    }
    if (!canSubmit) {
      dispatch({ type: "submitState", status: "error", message: "请先补全姓名、邮箱、视频和 PDF 简历。" });
      return;
    }
    if (!draft.submitTurnstileToken) {
      dispatch({ type: "submitState", status: "error", message: "请先完成人机验证。" });
      return;
    }

    try {
      dispatch({ type: "submitState", status: "uploading-video", message: "正在上传视频..." });
      const videoAsset = await uploadAsset(
        "video",
        recordingBlob,
        `intro-${draft.applicantName.trim().toLowerCase().replace(/\s+/g, "-") || "candidate"}.webm`,
        draft.recordingMimeType ?? "video/webm",
      );

      dispatch({ type: "submitState", status: "uploading-resume", message: "正在上传简历..." });
      const resumeAsset = await uploadAsset("resume", resumeFile, resumeFile.name, resumeFile.type || "application/pdf");

      dispatch({ type: "submitState", status: "submitting", message: "正在提交申请..." });
      const payload: SubmissionPayload = {
        jobId: job.id,
        applicantName: draft.applicantName.trim(),
        applicantEmail: draft.applicantEmail.trim(),
        acceptedTerms: draft.acceptedTerms,
        aiOptOut: draft.aiOptOut,
        preset: draft.preset,
        frame: draft.frame,
        videoAssetKey: videoAsset.assetKey,
        resumeAssetKey: resumeAsset.assetKey,
        turnstileToken: draft.submitTurnstileToken,
      };

      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "申请提交失败。");
      }

      dispatch({ type: "submitState", status: "success", message: data.message ?? "申请提交成功。" });
      dispatch({ type: "submitTurnstileToken", value: null });
      setSubmitTurnstileKey((value) => value + 1);
    } catch (error) {
      dispatch({ type: "submitTurnstileToken", value: null });
      setSubmitTurnstileKey((value) => value + 1);
      dispatch({
        type: "submitState",
        status: "error",
        message: error instanceof Error ? error.message : "提交过程中发生错误。",
      });
    }
  }

  function renderMethodStep() {
    return (
      <StepShell
        step={step}
        backHref={backHref}
        jobTitle={job.title}
        furthestStepIndex={furthestStepIndex}
        onStepSelect={jumpToStep}
      >
        <div className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col justify-center gap-12 py-10">
          <div className="space-y-5">
            <div className="inline-flex rounded-full bg-[#FFE411] px-4 py-1 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#141414]">
              {APP_COMPANY} · {job.title}
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#141414] sm:text-6xl">
                你想用哪种方式投递？
              </h1>
              <p className="max-w-xl text-lg text-[rgba(20,20,20,0.58)]">先决定是直接发邮件，还是继续完成视频申请流程。</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {(
              [
                {
                  key: "video" as const,
                  title: "录制视频申请",
                  subtitle: "用 90 秒或 3 分钟，快速介绍你自己。",
                  tone: "blue" as const,
                },
                {
                  key: "email" as const,
                  title: "邮件投递",
                  subtitle: "通过邮件发送简历，走传统申请流程。",
                  tone: "gold" as const,
                },
              ] satisfies Array<{ key: ApplyMethod; title: string; subtitle: string; tone: "blue" | "gold" }>
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => dispatch({ type: "method", method: item.key })}
                className={classNames(
                  "overflow-hidden rounded-[2rem] border text-left shadow-[0_16px_46px_rgba(18,28,56,0.05)] transition hover:-translate-y-0.5",
                  draft.method === item.key ? "border-[#141414] bg-[#fffdf0]" : "border-[rgba(20,20,20,0.08)] bg-white",
                )}
              >
                <IllustrationCard tone={item.tone} />
                <div className="space-y-1 px-7 py-6">
                  <h2 className="text-2xl font-semibold text-[#141414]">{item.title}</h2>
                  <p className="text-base text-[rgba(20,20,20,0.54)]">{item.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <PrimaryButton
              type="button"
              disabled={!draft.method}
              onClick={() => {
                if (draft.method === "email") {
                  setEmailApplyOpen(true);
                  return;
                }
                moveTo("consent");
              }}
            >
              继续
            </PrimaryButton>
          </div>
        </div>
        {emailApplyOpen && (
          <>
            <button
              type="button"
              aria-label="关闭邮件投递弹窗"
              className="fixed inset-0 z-40 bg-[rgba(20,20,20,0.28)] backdrop-blur-[3px]"
              onClick={() => setEmailApplyOpen(false)}
            />
            <div className="fixed inset-0 z-50 grid place-items-center px-5">
              <div className="w-full max-w-[640px] overflow-hidden rounded-[2rem] border border-[rgba(20,20,20,0.12)] bg-[#fffdf4] shadow-[0_30px_90px_rgba(20,20,20,0.18)]">
                <div className="border-b border-[rgba(20,20,20,0.08)] bg-[linear-gradient(180deg,#FFF4A4_0%,#FFE411_100%)] px-8 py-7">
                  <div className="inline-flex rounded-full border border-[rgba(20,20,20,0.12)] bg-white/55 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.24em] text-[#141414]">
                    EMAIL APPLY
                  </div>
                  <div className="mt-4 space-y-2">
                    <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#141414]">用邮件投递这个职位</h2>
                    <p className="max-w-[460px] text-base leading-7 text-[rgba(20,20,20,0.64)]">
                      我们已经帮你准备好岗位收件邮箱和建议主题。确认后会直接打开你的邮件客户端。
                    </p>
                  </div>
                </div>

                <div className="space-y-5 px-8 py-7">
                  <div className="rounded-[1.5rem] border border-[rgba(20,20,20,0.08)] bg-white px-5 py-4">
                    <div className="text-xs font-semibold tracking-[0.24em] text-[rgba(20,20,20,0.46)]">申请职位</div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#141414]">{job.title}</div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-[rgba(20,20,20,0.08)] bg-white px-5 py-4">
                      <div className="text-xs font-semibold tracking-[0.24em] text-[rgba(20,20,20,0.46)]">收件邮箱</div>
                      <div className="mt-2 break-all text-lg font-semibold text-[#141414]">{job.applyEmail}</div>
                    </div>
                    <div className="rounded-[1.5rem] border border-[rgba(20,20,20,0.08)] bg-white px-5 py-4">
                      <div className="text-xs font-semibold tracking-[0.24em] text-[rgba(20,20,20,0.46)]">建议主题</div>
                      <div className="mt-2 text-lg font-semibold text-[#141414]">申请职位：{job.title}</div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-[rgba(20,20,20,0.08)] bg-[#fff8d2] px-5 py-4 text-sm leading-7 text-[rgba(20,20,20,0.72)]">
                    邮件里建议附上简历、你的基本介绍，以及任何可以帮助团队了解你的作品链接或个人主页。
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <SecondaryButton type="button" onClick={() => setEmailApplyOpen(false)}>
                      暂不发送
                    </SecondaryButton>
                    <PrimaryButton
                      type="button"
                      onClick={() => {
                        window.location.href = emailApplyHref;
                        setEmailApplyOpen(false);
                      }}
                    >
                      打开邮件客户端
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </StepShell>
    );
  }

  function renderConsentStep() {
    return (
      <StepShell
        step={step}
        backHref={backHref}
        jobTitle={job.title}
        furthestStepIndex={furthestStepIndex}
        onStepSelect={jumpToStep}
      >
        <div className="mx-auto flex w-full max-w-[940px] flex-1 flex-col justify-center gap-8 py-12">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">开始之前</h1>
            <p className="text-lg text-[rgba(20,20,20,0.58)]">请先认真阅读以下知情同意与透明度说明。</p>
          </div>

          <div>
            <div className="mb-3 text-center text-sm text-[rgba(20,20,20,0.4)]">向下滚动查看完整内容</div>
            <div className="max-h-[320px] overflow-y-auto rounded-[2rem] border border-[rgba(20,20,20,0.08)] bg-white px-8 py-7 shadow-[0_16px_46px_rgba(18,28,56,0.05)]">
              <ol className="space-y-6 text-[1.06rem] leading-8 text-[#202431]">
                {consentParagraphs.map((paragraph) => (
                  <li key={paragraph} className="list-decimal ml-6">
                    {paragraph}
                  </li>
                ))}
              </ol>
              <div className="mt-8 rounded-[1.5rem] bg-[#FFF4B3] px-6 py-5 text-lg font-medium text-[#141414]">
                这份说明由长期从事 AI 产品工作的团队认真起草。我们相信，招聘里最重要的不是 AI 做了多少，
                而是它知道什么时候应该退后一步。
              </div>
            </div>
          </div>

          <div className="space-y-4 text-lg">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={draft.acceptedTerms}
                onChange={(event) => dispatch({ type: "terms", value: event.target.checked })}
                className="mt-1 h-5 w-5 accent-[#141414]"
              />
              <span>我已阅读并同意以上条款。</span>
            </label>
            <label className="flex items-start gap-3 text-[rgba(20,20,20,0.62)]">
              <input
                type="checkbox"
                checked={draft.aiOptOut}
                onChange={(event) => dispatch({ type: "aiOptOut", value: event.target.checked })}
                className="mt-1 h-5 w-5 accent-[#141414]"
              />
              <span>我选择不使用 AI 文本分析。若不勾选，系统仅生成转写摘要，帮助团队更快完成初筛。</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4">
            <SecondaryButton type="button" onClick={handleBack}>
              返回
            </SecondaryButton>
            <PrimaryButton type="button" disabled={!canContinueFromConsent} onClick={() => moveTo("format")}>
              继续
            </PrimaryButton>
          </div>
        </div>
      </StepShell>
    );
  }

  function renderFormatStep() {
    return (
      <StepShell
        step={step}
        backHref={backHref}
        jobTitle={job.title}
        furthestStepIndex={furthestStepIndex}
        onStepSelect={jumpToStep}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col justify-center gap-12 py-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">选择视频时长</h1>
            <p className="text-lg text-[rgba(20,20,20,0.58)]">你想用多长时间完成自我介绍？</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {(Object.entries(PRESET_META) as Array<[RecordingPreset, (typeof PRESET_META)[RecordingPreset]]>).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetChange(key)}
                className={classNames(
                  "overflow-hidden rounded-[2rem] border text-left shadow-[0_16px_46px_rgba(18,28,56,0.05)] transition hover:-translate-y-0.5",
                  draft.preset === key ? "border-[#141414] bg-[#fffdf0]" : "border-[rgba(20,20,20,0.08)] bg-white",
                )}
              >
                <IllustrationCard tone={key === "pitch" ? "blue" : "rose"} />
                <div className="space-y-1 px-7 py-6">
                  <h2 className="text-2xl font-semibold text-[#141414]">{value.label}</h2>
                  <p className="text-base text-[rgba(20,20,20,0.54)]">{value.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <SecondaryButton type="button" onClick={handleBack}>
              返回
            </SecondaryButton>
            <PrimaryButton type="button" onClick={() => moveTo("frame")}>
              继续
            </PrimaryButton>
          </div>
        </div>
      </StepShell>
    );
  }

  function renderFrameStep() {
    return (
      <StepShell
        step={step}
        backHref={backHref}
        jobTitle={job.title}
        furthestStepIndex={furthestStepIndex}
        onStepSelect={jumpToStep}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col justify-center gap-12 py-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">选择画幅比例</h1>
            <p className="text-lg text-[rgba(20,20,20,0.58)]">决定你在画面中的呈现方式。</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {(Object.entries(FRAME_META) as Array<[FrameOption, (typeof FRAME_META)[FrameOption]]>).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFrameChange(key)}
                className={classNames(
                  "overflow-hidden rounded-[2rem] border text-left shadow-[0_16px_46px_rgba(18,28,56,0.05)] transition hover:-translate-y-0.5",
                  draft.frame === key ? "border-[#141414] bg-[#fffdf0]" : "border-[rgba(20,20,20,0.08)] bg-white",
                )}
              >
                <FrameArtwork portrait={key === "portrait"} />
                <div className="flex items-start gap-4 px-7 py-6">
                  <div
                    className={classNames(
                      "mt-1 h-6 w-6 rounded-full border-2",
                      draft.frame === key ? "border-[#141414]" : "border-[rgba(20,20,20,0.18)]",
                    )}
                  >
                    <div
                      className={classNames(
                        "m-1 h-2.5 w-2.5 rounded-full transition",
                        draft.frame === key ? "bg-[#FFE411]" : "bg-transparent",
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-[#141414]">{value.label}</h2>
                    <p className="text-base text-[rgba(20,20,20,0.54)]">{value.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <SecondaryButton type="button" onClick={handleBack}>
              返回
            </SecondaryButton>
            <PrimaryButton type="button" onClick={() => moveTo("record")}>
              继续
            </PrimaryButton>
          </div>
        </div>
      </StepShell>
    );
  }

  function renderRecordStep() {
    const isPortrait = draft.frame === "portrait";
    const stageFrameClass = isPortrait
      ? "mx-auto w-full max-w-[26rem] aspect-[3/4]"
      : "mx-auto w-full max-w-[1120px] aspect-video";
    const toolbarClass = isPortrait ? "w-full max-w-[30rem]" : "w-full max-w-[40rem]";

    return (
      <StepShell
        step={step}
        backHref={backHref}
        jobTitle={job.title}
        dark
        minimalHeader
        furthestStepIndex={furthestStepIndex}
        disableStepNavigation={draft.recordStage === "recording"}
        onStepSelect={jumpToStep}
      >
        <div className="flex flex-1 flex-col justify-center gap-6 py-3">
          <div className="mx-auto flex w-full max-w-[1220px] flex-1 flex-col items-center justify-center gap-5">
            <div
              className={classNames(
                "overflow-hidden rounded-[2rem] bg-black/88 shadow-[0_28px_80px_rgba(0,0,0,0.35)]",
                stageFrameClass,
              )}
            >
              {draft.recordStage === "review" ? (
                <div className="relative h-full w-full bg-black">
                  {draft.recordingUrl ? (
                    <video
                      src={draft.recordingUrl ?? undefined}
                      poster={recordingPosterUrl ?? undefined}
                      controls
                      playsInline
                      preload="metadata"
                      onLoadedData={() => {
                        setReviewStatus("ready");
                        setReviewMessage(null);
                      }}
                      onError={() => {
                        setReviewStatus("error");
                        setReviewMessage("视频加载失败，请重新录制一次。");
                      }}
                      className="h-full w-full bg-black object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-sm text-white/60">暂无可回看的视频内容。</div>
                  )}

                  {draft.recordingUrl && reviewStatus === "loading" && (
                    <div className="absolute inset-0 grid place-items-center bg-black/68 px-6 text-center">
                      <div className="space-y-3">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <p className="text-sm text-white/78">{reviewMessage ?? "正在准备回看画面..."}</p>
                      </div>
                    </div>
                  )}

                  {draft.recordingUrl && reviewStatus === "error" && (
                    <div className="absolute inset-0 grid place-items-center bg-black/72 px-6 text-center">
                      <div className="max-w-sm space-y-3">
                        <p className="text-lg font-semibold text-white">回看加载失败</p>
                        <p className="text-sm text-white/70">{reviewMessage ?? "请重新录制一次。"}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <video
                  ref={previewRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full bg-[#0B0B0B] object-cover scale-x-[-1]"
                />
              )}
            </div>

            {draft.recordStage === "recording" && (
              <div className="rounded-full border border-[#FFE411]/30 bg-[#2A270A] px-5 py-2 text-sm font-medium text-[#fff2a6]">
                正在录制，剩余时间 {formatDuration(draft.recordingTimeLeft)}
              </div>
            )}

            <div
              className={classNames(
                "flex flex-wrap items-center justify-center gap-3 rounded-[1.75rem] border border-white/10 bg-white/6 px-6 py-4 text-white shadow-[0_18px_48px_rgba(0,0,0,0.28)]",
                toolbarClass,
              )}
            >
              <DarkGhostButton type="button" onClick={handleBack}>
                返回
              </DarkGhostButton>
              {draft.recordStage === "review" ? (
                <>
                  <div className="min-w-40 text-center text-lg font-medium text-white/76">录制完成</div>
                  <DarkGhostButton type="button" onClick={resetRecording}>
                    重新录制
                  </DarkGhostButton>
                  <DarkPrimaryButton type="button" onClick={() => moveTo("submit")}>
                    继续
                  </DarkPrimaryButton>
                </>
              ) : draft.recordStage === "recording" ? (
                <DarkPrimaryButton type="button" onClick={stopRecording}>
                  结束录制
                </DarkPrimaryButton>
              ) : (
                <>
                  <ReadinessPill label="摄像头" ready={draft.mediaStatus.cameraReady} />
                  <ReadinessPill label="麦克风" ready={draft.mediaStatus.micReady} />
                  <ReadinessPill label="光线" ready={draft.mediaStatus.lightingReady} />
                  <DarkPrimaryButton
                    type="button"
                    disabled={!draft.mediaStatus.cameraReady || !draft.mediaStatus.micReady || draft.mediaStatus.unsupported}
                    onClick={startRecording}
                  >
                    开始录制
                  </DarkPrimaryButton>
                </>
              )}
            </div>

            {draft.mediaStatus.message && draft.recordStage !== "review" && (
              <div className="max-w-[720px] text-center text-sm text-white/60">{draft.mediaStatus.message}</div>
            )}
          </div>
        </div>
      </StepShell>
    );
  }

  function renderSubmitStep() {
    const isPortrait = draft.frame === "portrait";
    const submitGridClass = isPortrait ? "xl:grid-cols-[minmax(0,0.86fr)_420px]" : "xl:grid-cols-[minmax(0,1.2fr)_420px]";
    const submitPreviewFrameClass = isPortrait
      ? "mx-auto w-full max-w-[25rem] aspect-[3/4]"
      : "w-full aspect-video";

    return (
      <StepShell
        step={step}
        backHref={backHref}
        jobTitle={job.title}
        furthestStepIndex={furthestStepIndex}
        onStepSelect={jumpToStep}
      >
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className={classNames("mx-auto grid w-full max-w-[1360px] gap-10", submitGridClass)}>
            <div className="flex items-center justify-center">
              <div className={classNames("overflow-hidden rounded-[2rem] bg-black shadow-[0_28px_80px_rgba(0,0,0,0.15)]", submitPreviewFrameClass)}>
                {draft.recordingUrl ? (
                  <video
                    src={draft.recordingUrl}
                    poster={recordingPosterUrl ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full bg-black object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-white/60">暂无可预览的视频内容。</div>
                )}
              </div>
            </div>

            <div className="space-y-6 rounded-[2rem] bg-white p-8 shadow-[0_16px_46px_rgba(18,28,56,0.07)]">
              <div className="space-y-3">
                <SecondaryButton type="button" className="px-6 py-2.5" onClick={handleBack}>
                  返回
                </SecondaryButton>
                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold tracking-[-0.05em]">最后一步</h1>
                  <p className="text-lg text-[rgba(20,20,20,0.58)]">填写你的信息并提交申请。</p>
                  <div className="text-sm font-medium text-[rgba(20,20,20,0.62)]">申请职位：{job.title}</div>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-[#232736]">你的姓名 *</span>
                  <input
                    value={draft.applicantName}
                    onChange={(event) => dispatch({ type: "applicantName", value: event.target.value })}
                    placeholder="请输入真实姓名"
                    className="h-14 w-full rounded-2xl border border-[rgba(20,20,20,0.12)] px-4 outline-none transition focus:border-[#141414]"
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-sm font-semibold text-[#232736]">邮箱地址 *</span>
                  <input
                    value={draft.applicantEmail}
                    onChange={(event) => dispatch({ type: "applicantEmail", value: event.target.value })}
                    placeholder="name@example.com"
                    className="h-14 w-full rounded-2xl border border-[rgba(20,20,20,0.12)] px-4 outline-none transition focus:border-[#141414]"
                  />
                  <p className="text-sm leading-7 text-[rgba(20,20,20,0.54)]">
                    这个邮箱会随申请一起发给招聘团队，方便他们直接联系你，不再要求额外的验证码确认。
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-semibold text-[#232736]">上传简历 *</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-[126px] w-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[rgba(20,20,20,0.12)] bg-[#FFFDF7] px-5 text-center transition hover:border-[#141414]"
                  >
                    <div className="text-base font-semibold text-[#141414]">点击上传</div>
                    <div className="text-sm text-[rgba(20,20,20,0.5)]">{draft.resumeName ?? "仅支持 PDF，大小不超过 10 MB。"}</div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={RESUME_ACCEPT}
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (!file) {
                        setResumeFile(null);
                        dispatch({ type: "resumeName", value: null });
                        return;
                      }
                      if (file.type !== "application/pdf" || file.size > MAX_RESUME_SIZE_BYTES) {
                        dispatch({
                          type: "submitState",
                          status: "error",
                          message: "简历必须是 10 MB 以内的 PDF 文件。",
                        });
                        event.target.value = "";
                        return;
                      }
                      setResumeFile(file);
                      dispatch({ type: "resumeName", value: file.name });
                      dispatch({ type: "submitState", status: "idle", message: null });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold tracking-[0.16em] text-[rgba(20,20,20,0.54)]">提交前，请完成人机验证</div>
                  <TurnstileWidget
                    action="application_submit"
                    resetKey={submitTurnstileKey}
                    onTokenChange={(token) => dispatch({ type: "submitTurnstileToken", value: token })}
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  className="h-14 w-full"
                  disabled={!canSubmit || !draft.submitTurnstileToken || isPending || draft.submitStatus === "submitting"}
                >
                  {draft.submitStatus === "uploading-video"
                    ? "正在上传视频..."
                    : draft.submitStatus === "uploading-resume"
                      ? "正在上传简历..."
                      : draft.submitStatus === "submitting"
                        ? "正在提交..."
                        : "提交申请"}
                </PrimaryButton>

                {draft.submitMessage && (
                  <div
                    className={classNames(
                      "rounded-2xl px-4 py-3 text-sm",
                      draft.submitStatus === "success"
                        ? "bg-[#ECF9F0] text-[#1E7A43]"
                        : draft.submitStatus === "error"
                          ? "bg-[#FFF1F0] text-[#B23B33]"
                          : "bg-[#FFF4B3] text-[#141414]",
                    )}
                  >
                    {draft.submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </StepShell>
    );
  }

  return (
    <>
      {step === "method" && renderMethodStep()}
      {step === "consent" && renderConsentStep()}
      {step === "format" && renderFormatStep()}
      {step === "frame" && renderFrameStep()}
      {step === "record" && renderRecordStep()}
      {step === "submit" && renderSubmitStep()}
    </>
  );
}
