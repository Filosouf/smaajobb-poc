export type JobStatus =
  | 'Draft'
  | 'AwaitingPayment'
  | 'Open'
  | 'Assigned'
  | 'AwaitingConfirmation'
  | 'Completed'
  | 'Cancelled'
  | 'Disputed';

export type PriceModel = 'FixedPrice' | 'HourlyRate';
export type DeadlineType = 'ByDate' | 'WithinDays' | 'OpenEnded';

export interface CategoryDto {
  id: number;
  slug: string;
  name: string;
  description: string;
  minAge: number;
  adultsOnly: boolean;
}

export interface PersonRef {
  id: string;
  fullName: string;
  averageRating: number | null;
  completedJobs: number;
}

export interface JobListItem {
  id: string;
  title: string;
  categoryId: number;
  categoryName: string;
  priceModel: PriceModel;
  price: number;
  estimatedHours: number;
  postalCode: string;
  city: string;
  status: JobStatus;
  publishedAt: string | null;
}

export interface JobDetail {
  id: string;
  lister: PersonRef;
  categoryId: number;
  categoryName: string;
  title: string;
  description: string;
  priceModel: PriceModel;
  price: number;
  estimatedHours: number;
  platformFee: number;
  deadlineType: DeadlineType;
  deadlineDate: string | null;
  deadlineDays: number | null;
  postalCode: string;
  city: string;
  status: JobStatus;
  assignedTo: PersonRef | null;
  createdAt: string;
  publishedAt: string | null;
  assignedAt: string | null;
  completedAt: string | null;
}

export interface JobInput {
  categoryId: number;
  title: string;
  description: string;
  priceModel: PriceModel;
  price: number;
  estimatedHours: number;
  deadlineType: DeadlineType;
  deadlineDate: string | null;
  deadlineDays: number | null;
  postalCode: string;
}

export interface JobSearchParams {
  categoryId?: number;
  postalCode?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: JobStatus;
  mineOnly?: boolean;
}

export interface PublishResponse {
  job: JobDetail;
  checkoutUrl: string | null;
}
