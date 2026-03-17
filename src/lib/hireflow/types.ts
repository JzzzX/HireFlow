export type ApplyMethod = "video" | "email";

export type RecordingPreset = "pitch" | "deep-dive";

export type FrameOption = "landscape" | "portrait";

export type JobCategoryFilter = "All" | "实习" | "技术" | "产品/设计" | "运营/市场" | "职能";

export type JobLevel = "INTERN" | "FULL-TIME" | "CONTRACT";

export type JobSection = {
  title: string;
  items: string[];
};

export type Job = {
  id: string;
  title: string;
  department: string;
  team: string;
  category: Exclude<JobCategoryFilter, "All">;
  locationLabel: string;
  level: JobLevel;
  applyEmail: string;
  sections: JobSection[];
  sourceUrl: string;
  updatedAt: string;
};

export type WizardStep = "method" | "consent" | "format" | "frame" | "record" | "submit";

export type RecordStage = "setup" | "recording" | "review";

export type MediaStatus = {
  cameraReady: boolean;
  micReady: boolean;
  lightingReady: boolean;
  unsupported: boolean;
  message?: string;
};

export type UploadedAsset = {
  assetKey: string;
  assetUrl: string;
  contentType: string;
  filename: string;
  size: number;
};

export type ApplicationDraft = {
  method: ApplyMethod | null;
  acceptedTerms: boolean;
  aiOptOut: boolean;
  preset: RecordingPreset;
  frame: FrameOption;
  recordStage: RecordStage;
  mediaStatus: MediaStatus;
  recordingTimeLeft: number;
  recordingUrl: string | null;
  recordingMimeType: string | null;
  applicantName: string;
  applicantEmail: string;
  submitTurnstileToken: string | null;
  resumeName: string | null;
  submitStatus: "idle" | "uploading-video" | "uploading-resume" | "submitting" | "success" | "error";
  submitMessage: string | null;
};

export type SubmissionPayload = {
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  acceptedTerms: boolean;
  aiOptOut: boolean;
  preset: RecordingPreset;
  frame: FrameOption;
  videoAssetKey: string;
  resumeAssetKey: string;
  turnstileToken: string;
};

export type UploadKind = "video" | "resume";
