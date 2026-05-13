import { JobStatus } from '../jobs/jobs.types';

export type ApplicationStatus =
  | 'PendingGuardianApproval'
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn';

export interface ApplicationDto {
  id: string;
  jobListingId: string;
  jobTitle: string;
  jobStatus: JobStatus;
  workerId: string;
  workerName: string;
  workerAverageRating: number | null;
  workerCompletedJobs: number;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
}
