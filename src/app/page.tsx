import { Suspense } from "react";

import { JobDirectory } from "@/components/job-directory";
import { jobs } from "@/lib/hireflow/jobs";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <JobDirectory jobs={jobs} />
    </Suspense>
  );
}
