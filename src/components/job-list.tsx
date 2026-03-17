"use client";

import Link from "next/link";

import { APP_BRAND, APP_CREW_COPY, APP_MANIFESTO, OPEN_ROLES_EMAIL } from "@/lib/hireflow/config";
import { JOBS_LAST_UPDATED } from "@/lib/hireflow/jobs";
import type { Job, JobCategoryFilter } from "@/lib/hireflow/types";

type GroupedJobs = {
  team: string;
  jobs: Job[];
};

type JobListProps = {
  activeCategory: JobCategoryFilter;
  groupedJobs: GroupedJobs[];
  categoryCounts: Record<JobCategoryFilter, number>;
  visibleCategories: JobCategoryFilter[];
  selectedJobId: string | null;
  totalJobs: number;
  onCategoryChange: (category: JobCategoryFilter) => void;
  onSelectJob: (jobId: string) => void;
};

export function JobList({
  activeCategory,
  groupedJobs,
  categoryCounts,
  visibleCategories,
  selectedJobId,
  totalJobs,
  onCategoryChange,
  onSelectJob,
}: JobListProps) {
  const hasJobs = groupedJobs.length > 0;

  return (
    <div className="min-h-screen bg-[#FFFDF4] text-[#141414]">
      <div className="border-b border-[rgba(20,20,20,0.08)] bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-6 text-sm text-[rgba(20,20,20,0.48)]">
            <Link href="/" className="text-[1.45rem] font-semibold tracking-[-0.055em] text-[#141414] sm:text-[1.6rem]">
              {APP_BRAND}
            </Link>
            <Link href="/" className="hidden items-center gap-2 transition hover:text-[#141414] sm:flex">
              <span aria-hidden="true">&larr;</span>
              <span>返回招聘页</span>
            </Link>
          </div>
          <div className="flex items-center gap-5 text-sm text-[rgba(20,20,20,0.48)]">
            <a href={`mailto:${OPEN_ROLES_EMAIL}`} className="hidden tracking-[0.18em] text-[rgba(20,20,20,0.54)] lg:block">
              {OPEN_ROLES_EMAIL}
            </a>
            <a
              href={`mailto:${OPEN_ROLES_EMAIL}`}
              className="inline-flex items-center rounded-xl bg-[#FFE411] px-5 py-3 font-semibold text-[#141414] transition hover:bg-[#f1d300]"
            >
              联系我们 →
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-14 sm:px-8 lg:px-12">
        <section className="grid gap-10 border-b border-[rgba(20,20,20,0.08)] pb-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div className="space-y-6">
            <div className="text-xs font-semibold tracking-[0.42em] text-[rgba(20,20,20,0.48)]">
              OPEN ROLES
            </div>
            <div className="space-y-4">
              <h1 className="max-w-[900px] text-5xl font-semibold leading-[0.93] tracking-[-0.075em] text-[#141414] sm:text-[5.75rem]">
                <span className="block">Mediocre Company.</span>
                <span className="block">
                  Make Something{" "}
                  <span className="relative inline-block">
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-[0.12em] h-[0.22em] rounded-full bg-[#FFE411]" />
                    <span className="relative">{APP_MANIFESTO.replace(/^Make Something\s*/, "")}</span>
                  </span>
                </span>
              </h1>
              <p className="max-w-[760px] text-xl leading-9 text-[rgba(20,20,20,0.58)]">
                {APP_CREW_COPY}。先看清团队和岗位，再进入投递流程。你可以先读完整 JD，再决定发邮件还是录制视频申请。
              </p>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <div className="text-6xl font-light tracking-[-0.08em] text-[#141414]">{totalJobs}</div>
            <div className="text-xs font-semibold tracking-[0.38em] text-[rgba(20,20,20,0.42)]">开放职位</div>
            <div className="text-xs font-semibold tracking-[0.32em] text-[rgba(20,20,20,0.34)]">最后更新 {JOBS_LAST_UPDATED}</div>
          </div>
        </section>

        <div className="border-b border-[rgba(20,20,20,0.08)] pt-7">
          <div className="flex flex-wrap gap-3 pb-2">
            {visibleCategories.map((category) => {
              const isActive = category === activeCategory;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full border px-4 py-2 text-base transition ${isActive ? "border-[#141414] bg-[#FFE411] text-[#141414]" : "border-[rgba(20,20,20,0.08)] bg-white text-[rgba(20,20,20,0.52)] hover:border-[rgba(20,20,20,0.16)] hover:text-[#141414]"}`}
                >
                  {category} <span className="text-sm text-[rgba(20,20,20,0.42)]">{categoryCounts[category]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-14 pt-12">
          {hasJobs ? (
            groupedJobs.map((group) => (
              <section key={group.team} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-semibold tracking-[0.38em] text-[rgba(20,20,20,0.46)]">{group.team}</h2>
                  <span className="rounded-full border border-[rgba(20,20,20,0.08)] bg-[#FFF8D2] px-2.5 py-1 text-xs font-semibold text-[#141414]">
                    {group.jobs.length}
                  </span>
                </div>

                <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(20,20,20,0.08)] bg-white shadow-[0_24px_60px_rgba(20,20,20,0.04)]">
                  <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_52px] border-b border-[rgba(20,20,20,0.06)] px-6 py-4 text-xs font-semibold tracking-[0.28em] text-[rgba(20,20,20,0.34)]">
                    <div>职位</div>
                    <div>团队</div>
                    <div>地点</div>
                    <div />
                  </div>
                  {group.jobs.map((job, index) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => onSelectJob(job.id)}
                      className={`grid w-full grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_52px] items-center px-6 py-6 text-left transition hover:bg-[#FFFBE3] ${index > 0 ? "border-t border-[rgba(20,20,20,0.06)]" : ""} ${selectedJobId === job.id ? "bg-[#FFF7C4]" : "bg-white"}`}
                    >
                      <div className="pr-6 text-2xl font-semibold tracking-[-0.04em] text-[#141414]">{job.title}</div>
                      <div className="pr-6 text-sm text-[rgba(20,20,20,0.56)]">{job.department}</div>
                      <div className="pr-4 text-sm text-[rgba(20,20,20,0.56)]">{job.locationLabel}</div>
                      <div className="text-right text-2xl text-[#141414]">→</div>
                    </button>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[rgba(20,20,20,0.12)] bg-white px-8 py-16 text-center">
              <div className="text-2xl font-semibold tracking-[-0.04em] text-[#141414]">这个分类暂时没有开放职位</div>
              <p className="mt-3 text-base text-[rgba(20,20,20,0.56)]">可以先查看其他分类，或通过邮箱与我们联系。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
