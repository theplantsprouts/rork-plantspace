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
} from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from '@/hooks/use-theme';

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
  const { logout } = useAuth();
  const { settings, updateAppSetting } = useSettings();
  const { colors } = useTheme();
  const darkMode = settings.app.darkMode;

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
            <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}33` }]}>
              <IconComponent
                color={colors.primary}
                size={24}
              />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>{item.subtitle}</Text>
              )}
            </View>
          </View>
          
          {item.type === 'toggle' ? (
            <Switch
              value={item.value as boolean}
              onValueChange={item.onToggle}
              trackColor={{
                false: colors.outlineVariant,
                true: `${colors.primary}4D`,
              }}
              thumbColor={item.value ? colors.primary : colors.outline}
              ios_backgroundColor={colors.outlineVariant}
            />
          ) : item.value && typeof item.value === 'string' ? (
            <View style={styles.settingValueContainer}>
              <Text style={[styles.settingValue, { color: colors.onSurfaceVariant }]}>{item.value}</Text>
              <Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>›</Text>
            </View>
          ) : (
            <Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>›</Text>
          )}
        </TouchableOpacity>
        {!isLast && <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />}
      </View>
    );
  };

  const renderSection = (section: SettingSection, index: number) => {
    return (
      <View key={section.title} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{section.title}</Text>
        {index === 1 ? (
          <View style={[styles.groupedCard, { backgroundColor: colors.surfaceContainer }]}>
            {section.items.map((item, idx) => renderSettingItem(item, idx === section.items.length - 1))}
          </View>
        ) : (
          section.items.map((item) => (
            <View key={item.id} style={[styles.settingCard, { backgroundColor: colors.surfaceContainer }]}>
              {renderSettingItem(item, true)}
            </View>
          ))
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color={colors.onSurface} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Settings</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  settingCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  groupedCard: {
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
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300' as const,
  },
  divider: {
    height: 1,
    marginLeft: 80,
  },
});