export interface RatingDto {
  id: string;
  jobListingId: string;
  jobTitle: string;
  fromId: string;
  fromName: string;
  toId: string;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface JobRatingsDto {
  listerToWorker: RatingDto | null;
  workerToLister: RatingDto | null;
  canRateAsLister: boolean;
  canRateAsWorker: boolean;
}
