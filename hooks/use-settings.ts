import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  followers: boolean;
  directMessages: boolean;
  updates: boolean;
  promotions: boolean;
}

interface PrivacySettings {
  privateProfile: boolean;
  messagePrivacy: 'everyone' | 'following' | 'none';
  personalizedAds: boolean;
}

interface AppSettings {
  darkMode: boolean;
  language: string;
}

interface Settings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  app: AppSettings;
}

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    likes: true,
    comments: true,
    followers: true,
    directMessages: false,
    updates: true,
    promotions: false,
  },
  privacy: {
    privateProfile: true,
    messagePrivacy: 'everyone',
    personalizedAds: false,
  },
  app: {
    darkMode: false,
    language: 'English',
  },
};

const SETTINGS_STORAGE_KEY = '@plantspace_settings';

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateNotificationSetting = useCallback((key: keyof NotificationSettings, value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  }, [settings]);

  const updatePrivacySetting = useCallback(<K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  }, [settings]);

  const updateAppSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = {
      ...settings,
      app: {
        ...settings.app,
        [key]: value,
      },
    };
    saveSettings(newSettings);
  }, [settings]);

  return useMemo(() => ({
    settings,
    isLoading,
    updateNotificationSetting,
    updatePrivacySetting,
    updateAppSetting,
  }), [settings, isLoading, updateNotificationSetting, updatePrivacySetting, updateAppSetting]);
});
