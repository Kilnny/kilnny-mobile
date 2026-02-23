export enum NotificationType {
  BUILD_READY = 'BUILD_READY',
  INVITATION = 'INVITATION',
  FEEDBACK_RECEIVED = 'FEEDBACK_RECEIVED',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}
