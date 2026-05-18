export const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship"] as const;

export const JOB_STATUSES = ["applied", "interviewing", "offer", "rejected"] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type JobStatus = (typeof JOB_STATUSES)[number];
