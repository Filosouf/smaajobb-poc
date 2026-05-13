export interface MessageDto {
  id: string;
  jobListingId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}
