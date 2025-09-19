import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { savePushToken } from '@/lib/firebase';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Disable notifications completely in Expo Go to prevent errors
if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.log('Notification handler setup failed:', error);
  }
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const registerForPushNotificationsAsync = async (userId?: string): Promise<string | null> => {
  // Skip notifications in Expo Go or web
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Push notifications not supported in Expo Go or web. Use a development build for mobile.');
    return null;
  }

  let token: string | null = null;

  try {
    // Only proceed on physical devices
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions denied');
      return null;
    }
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '969912616990',
    });
    token = tokenData.data;
    
    // Save token to Firebase if userId is provided
    if (userId && token) {
      await savePushToken(userId, token);
    }
    
    console.log('Push token registered successfully');
  } catch (error) {
    console.error('Push notification registration failed:', error);
    // Don't throw error, just return null
  }

  return token;
};

export const sendLocalNotification = async (notification: NotificationData) => {
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Local notifications not supported in Expo Go or web:', notification.title);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Local notification failed:', error);
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
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Notification listeners not supported in Expo Go or web');
    return { remove: () => {} };
  }
  
  try {
    return Notifications.addNotificationReceivedListener(listener);
  } catch (error) {
    console.error('Failed to add notification listener:', error);
    return { remove: () => {} };
  }
};

export const addNotificationResponseReceivedListener = (
  listener: (response: Notifications.NotificationResponse) => void
) => {
  if (isExpoGo || Platform.OS === 'web') {
    console.log('Notification response listeners not supported in Expo Go or web');
    return { remove: () => {} };
  }
  
  try {
    return Notifications.addNotificationResponseReceivedListener(listener);
  } catch (error) {
    console.error('Failed to add notification response listener:', error);
    return { remove: () => {} };
  }
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