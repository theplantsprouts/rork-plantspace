import { Platform } from 'react-native';
import { savePushToken } from '@/lib/firebase';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only import and use expo-notifications if not in Expo Go
let Notifications: any = null;
let Device: any = null;

if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    
    // Set notification handler
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
    console.log('Expo notifications not available:', error);
    Notifications = null;
    Device = null;
  }
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const registerForPushNotificationsAsync = async (userId?: string): Promise<string | null> => {
  // Skip notifications in Expo Go or web
  if (isExpoGo || Platform.OS === 'web' || !Notifications || !Device) {
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
  if (isExpoGo || Platform.OS === 'web' || !Notifications) {
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
  trigger: any
) => {
  if (isExpoGo || !Notifications) {
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
  if (!Notifications) {
    console.log('Notifications not available');
    return;
  }
  
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async () => {
  if (!Notifications) {
    console.log('Notifications not available');
    return;
  }
  
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// Notification listeners
export const addNotificationReceivedListener = (
  listener: (notification: any) => void
) => {
  if (isExpoGo || Platform.OS === 'web' || !Notifications) {
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
  listener: (response: any) => void
) => {
  if (isExpoGo || Platform.OS === 'web' || !Notifications) {
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
  if (Platform.OS === 'ios' && Notifications) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
};

export const getBadgeCount = async (): Promise<number> => {
  if (Platform.OS === 'ios' && Notifications) {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }
  return 0;
};