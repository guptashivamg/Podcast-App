export type NotificationType = "new_podcast" | "follow" | "like";
export type NotificationTab = "all" | "unread";

export interface Notification {
  _id: string;
  _creationTime: number;
  type: NotificationType;
  isRead: boolean;
  creatorName: string;
  creatorId: string;
  creatorImageUrl?: string;
  podcastId?: string;
  podcastTitle?: string;
  podcastImageUrl?: string;
}