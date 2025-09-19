// Removed unused imports for Expo Go compatibility

// Notifications are not supported in Expo Go SDK 53+
// This is a stub implementation for development
console.log('Push notifications are not supported in Expo Go. Use a development build for full notification support.');

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const registerForPushNotificationsAsync = async (userId?: string): Promise<string | null> => {
  console.log('Push notifications not supported in Expo Go SDK 53+. Use a development build for mobile push notifications.');
  
  // Return null to indicate notifications are not available
  return null;
};

export const sendLocalNotification = async (notification: NotificationData) => {
  console.log('Local notifications not supported in Expo Go SDK 53+:', notification.title);
  // In a development build, you would implement actual notifications here
};

export const scheduledNotification = async (
  notification: NotificationData,
  trigger: any
) => {
  console.log('Scheduled notifications not supported in Expo Go SDK 53+:', notification.title);
  return null;
};

export const cancelNotification = async (notificationId: string) => {
  console.log('Notification cancellation not supported in Expo Go SDK 53+');
};

export const cancelAllNotifications = async () => {
  console.log('Notification cancellation not supported in Expo Go SDK 53+');
};

// Notification listeners
export const addNotificationReceivedListener = (
  listener: (notification: any) => void
) => {
  console.log('Notification listeners not supported in Expo Go SDK 53+');
  return { remove: () => {} };
};

export const addNotificationResponseReceivedListener = (
  listener: (response: any) => void
) => {
  console.log('Notification response listeners not supported in Expo Go SDK 53+');
  return { remove: () => {} };
};

// Badge management
export const setBadgeCount = async (count: number) => {
  console.log('Badge count not supported in Expo Go SDK 53+');
};

export const getBadgeCount = async (): Promise<number> => {
  console.log('Badge count not supported in Expo Go SDK 53+');
  return 0;
};