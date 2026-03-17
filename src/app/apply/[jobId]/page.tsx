import { notFound } from "next/navigation";

import { HireFlowApp } from "@/components/hireflow-app";
import { getJobById } from "@/lib/hireflow/jobs";

export default async function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = getJobById(jobId);

  if (!job) {
    notFound();
  }

  return <HireFlowApp job={job} />;
}
