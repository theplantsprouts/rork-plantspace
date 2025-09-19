import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { savePushToken } from '@/lib/firebase';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior only if not in Expo Go
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const registerForPushNotificationsAsync = async (userId?: string): Promise<string | null> => {
  // Skip notifications in Expo Go
  if (isExpoGo) {
    console.log('Push notifications not supported in Expo Go. Use a development build instead.');
    return null;
  }

  let token: string | null = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '969912616990', // Your Firebase project number
      });
      token = tokenData.data;
      
      // Save token to Firebase if userId is provided
      if (userId && token) {
        await savePushToken(userId, token);
      }
      
      console.log('Push token registered:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  return token;
};

export const sendLocalNotification = async (notification: NotificationData) => {
  if (isExpoGo) {
    console.log('Local notifications not fully supported in Expo Go:', notification.title);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

export const scheduledNotification = async (
  notification: NotificationData,
  trigger: Notifications.NotificationTriggerInput
) => {
  if (isExpoGo) {
    console.log('Scheduled notifications not fully supported in Expo Go:', notification.title);
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      },
      trigger,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// Notification listeners
export const addNotificationReceivedListener = (
  listener: (notification: Notifications.Notification) => void
) => {
  if (isExpoGo) {
    console.log('Notification listeners not fully supported in Expo Go');
    return { remove: () => {} };
  }
  return Notifications.addNotificationReceivedListener(listener);
};

export const addNotificationResponseReceivedListener = (
  listener: (response: Notifications.NotificationResponse) => void
) => {
  if (isExpoGo) {
    console.log('Notification response listeners not fully supported in Expo Go');
    return { remove: () => {} };
  }
  return Notifications.addNotificationResponseReceivedListener(listener);
};

// Badge management
export const setBadgeCount = async (count: number) => {
  if (Platform.OS === 'ios') {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
};

export const getBadgeCount = async (): Promise<number> => {
  if (Platform.OS === 'ios') {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }
  return 0;
};