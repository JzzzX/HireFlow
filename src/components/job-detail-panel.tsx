"use client";

import Link from "next/link";

import type { Job } from "@/lib/hireflow/types";

type JobDetailPanelProps = {
  job: Job | null;
  onClose: () => void;
};

function levelLabel(level: Job["level"]) {
  if (level === "INTERN") {
    return "实习";
  }
  if (level === "CONTRACT") {
    return "合同";
  }
  return "全职";
}

export function JobDetailPanel({ job, onClose }: JobDetailPanelProps) {
  return (
    <>
      <div
        aria-hidden={job ? "false" : "true"}
        className={`fixed inset-0 z-40 bg-[rgba(14,16,24,0.42)] backdrop-blur-[2px] transition ${job ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        aria-hidden={job ? "false" : "true"}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[620px] flex-col border-l border-[rgba(20,20,20,0.08)] bg-[#fffef8] shadow-[-28px_0_70px_rgba(20,20,20,0.14)] transition duration-300 ${job ? "translate-x-0" : "translate-x-full"}`}
      >
        {job && (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-[rgba(20,20,20,0.08)] px-8 py-7">
              <div className="space-y-4">
                <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[#141414]">{job.title}</h2>
                <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-[0.24em] text-[#141414]">
                  <span className="rounded-full border border-[rgba(20,20,20,0.1)] bg-[#FFF3A8] px-3 py-1">{job.team}</span>
                  <span className="rounded-full border border-[rgba(20,20,20,0.1)] bg-[#FFF3A8] px-3 py-1">{job.locationLabel}</span>
                  <span className="rounded-full border border-[rgba(20,20,20,0.1)] bg-[#FFF3A8] px-3 py-1">{levelLabel(job.level)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(20,20,20,0.08)] text-xl text-[rgba(20,20,20,0.5)] transition hover:border-[rgba(20,20,20,0.18)] hover:bg-[#FFE411] hover:text-[#141414]"
                aria-label="关闭职位详情"
              >
                ×
              </button>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto px-8 py-8">
              {job.sections.map((section) => (
                <section key={section.title} className="space-y-5">
                  <div className="text-xs font-semibold tracking-[0.32em] text-[rgba(20,20,20,0.5)]">{section.title}</div>
                  <ol className="space-y-5">
                    {section.items.map((item, index) => (
                      <li key={`${section.title}-${item}`} className="flex gap-4">
                        <div className="pt-0.5 text-2xl font-semibold tracking-[-0.04em] text-[#141414]">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="text-lg leading-8 text-[rgba(20,20,20,0.78)]">{item}</div>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>

            <div className="flex items-center justify-between gap-6 border-t border-[rgba(20,20,20,0.08)] px-8 py-6">
              <div className="max-w-sm text-sm leading-7 text-[rgba(20,20,20,0.56)]">
                发一份简历和简短自我介绍给我们。每一份申请，团队都会认真查看并回复。
              </div>
              <Link
                href={`/apply/${job.id}`}
                className="inline-flex items-center rounded-2xl bg-[#FFE411] px-6 py-3 text-sm font-semibold text-[#141414] transition hover:bg-[#f1d300]"
              >
                申请这个职位 →
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
