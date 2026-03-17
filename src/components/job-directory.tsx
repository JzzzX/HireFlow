"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { JobDetailPanel } from "@/components/job-detail-panel";
import { JobList } from "@/components/job-list";
import { filterJobsByCategory, getCategoryCounts, getVisibleJobCategories, groupJobsByTeam } from "@/lib/hireflow/jobs";
import type { Job, JobCategoryFilter } from "@/lib/hireflow/types";

type JobDirectoryProps = {
  jobs: Job[];
};

function normalizeCategory(value: string | null): JobCategoryFilter {
  if (value === "实习" || value === "技术" || value === "产品/设计" || value === "运营/市场" || value === "职能") {
    return value;
  }
  return "All";
}

export function JobDirectory({ jobs }: JobDirectoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = normalizeCategory(searchParams.get("category"));
  const selectedJobId = searchParams.get("job");
  const selectedJob = selectedJobId ? jobs.find((job) => job.id === selectedJobId) ?? null : null;
  const categoryCounts = getCategoryCounts(jobs);
  const visibleCategories = getVisibleJobCategories(jobs);
  const filteredJobs = filterJobsByCategory(jobs, activeCategory);
  const groupedJobs = groupJobsByTeam(filteredJobs);

  function updateSearch(next: { job?: string | null; category?: JobCategoryFilter | null }) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.job === null) {
      params.delete("job");
    } else if (next.job) {
      params.set("job", next.job);
    }

    if (next.category === null || next.category === "All") {
      params.delete("category");
    } else if (next.category) {
      params.set("category", next.category);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <JobList
        activeCategory={activeCategory}
        groupedJobs={groupedJobs}
        categoryCounts={categoryCounts}
        visibleCategories={visibleCategories}
        selectedJobId={selectedJobId}
        totalJobs={jobs.length}
        onCategoryChange={(category) => updateSearch({ category, job: null })}
        onSelectJob={(jobId) => updateSearch({ category: activeCategory, job: jobId })}
      />
      <JobDetailPanel job={selectedJob} onClose={() => updateSearch({ category: activeCategory, job: null })} />
    </>
  );
}
