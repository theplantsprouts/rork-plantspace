import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Globe,
  Contrast,
  Database,
  HelpCircle,
  Flag,
  Info,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { PlantTheme } from '@/constants/theme';
import { useSettings } from '@/hooks/use-settings';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  type: 'navigation' | 'toggle';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  const { settings, updateAppSetting } = useSettings();
  const darkMode = settings.app.darkMode;
  const isAdmin = user?.isAdmin || false;

  const handleLogout = () => {
    Alert.alert(
      '🌿 Leave the Garden?',
      'Are you sure you want to sign out?',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth');
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const settingSections: SettingSection[] = [
    ...(isAdmin ? [{
      title: 'Admin',
      items: [
        {
          id: 'admin-panel',
          title: 'Admin Panel',
          subtitle: 'Manage users, posts, and reports',
          icon: Shield,
          type: 'navigation' as const,
          onPress: () => router.push('/admin' as any),
        },
      ],
    }] : []),
    {
      title: 'Account',
      items: [
        {
          id: 'account',
          title: 'Account',
          subtitle: 'Manage your account information',
          icon: User,
          type: 'navigation',
          onPress: () => router.push('/account-settings' as any),
        },
        {
          id: 'privacy',
          title: 'Privacy',
          subtitle: 'Manage your privacy settings',
          icon: Lock,
          type: 'navigation',
          onPress: () => router.push('/privacy-settings' as any),
        },
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'Manage your notifications',
          icon: Bell,
          type: 'navigation',
          onPress: () => router.push('/notification-preferences' as any),
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'language',
          title: 'Language',
          subtitle: 'Choose your preferred language',
          icon: Globe,
          type: 'navigation',
          value: 'English',
          onPress: () => Alert.alert('Coming Soon', 'Language selection will be available soon!'),
        },
        {
          id: 'theme',
          title: 'Theme',
          subtitle: 'Choose your preferred theme',
          icon: Contrast,
          type: 'toggle',
          value: darkMode,
          onToggle: (value: boolean) => updateAppSetting('darkMode', value),
        },
        {
          id: 'data-usage',
          title: 'Data Usage',
          subtitle: 'Manage your app data',
          icon: Database,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Data usage settings will be available soon!'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help-center',
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: HelpCircle,
          type: 'navigation',
          onPress: () => router.push('/help-support' as any),
        },
        {
          id: 'report-problem',
          title: 'Report a Problem',
          subtitle: 'Report a problem',
          icon: Flag,
          type: 'navigation',
          onPress: () => router.push('/report-problem' as any),
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'About the app',
          icon: Info,
          type: 'navigation',
          onPress: () => router.push('/about' as any),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, isLast: boolean) => {
    const IconComponent = item.icon;
    
    return (
      <View key={item.id}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.settingItemLeft}>
            <View style={styles.settingIconContainer}>
              <IconComponent
                color={PlantTheme.colors.primary}
                size={24}
              />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          
          {item.type === 'toggle' ? (
            <Switch
              value={item.value as boolean}
              onValueChange={item.onToggle}
              trackColor={{
                false: '#E8EAE6',
                true: 'rgba(23, 207, 23, 0.3)',
              }}
              thumbColor={item.value ? PlantTheme.colors.primary : '#C1C8C0'}
              ios_backgroundColor="#E8EAE6"
            />
          ) : item.value && typeof item.value === 'string' ? (
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{item.value}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          ) : (
            <Text style={styles.chevron}>›</Text>
          )}
        </TouchableOpacity>
        {!isLast && <View style={styles.divider} />}
      </View>
    );
  };

  const renderSection = (section: SettingSection, index: number) => {
    return (
      <View key={section.title} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {index === 1 ? (
          <View style={styles.groupedCard}>
            {section.items.map((item, idx) => renderSettingItem(item, idx === section.items.length - 1))}
          </View>
        ) : (
          section.items.map((item) => (
            <View key={item.id} style={styles.settingCard}>
              {renderSettingItem(item, true)}
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1a1c1a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {settingSections.map((section, index) => renderSection(section, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F6F8F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: PlantTheme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  settingCard: {
    backgroundColor: '#EEF0ED',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  groupedCard: {
    backgroundColor: '#EEF0ED',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(23, 207, 23, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1c1a',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#424842',
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#424842',
  },
  chevron: {
    fontSize: 24,
    color: '#424842',
    fontWeight: '300' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EAE6',
    marginLeft: 80,
  },
});