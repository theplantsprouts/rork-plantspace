import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  User,
  Leaf,
  Mail,
  Lock,
  Shield,
  Smartphone,
  Key,
  UserX,
  Bell,
  Heart,
  Users,
  Newspaper,
  Palette,
  TreePine,
  Sun,
  Droplets,
  EyeOff,
  UserMinus,
  HelpCircle,
  Bug,
  Phone,
  Sprout,
  FileText,
  Scale,
  BookOpen,
  Info,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';
import { PlantTheme } from '@/constants/theme';
import { GlassCard } from '@/components/GlassContainer';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

interface SettingSection {
  title: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [likesNotifications, setLikesNotifications] = useState(true);
  // const [commentsNotifications, setCommentsNotifications] = useState(true);
  const [followersNotifications, setFollowersNotifications] = useState(true);
  const [updatesNotifications, setUpdatesNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [plantAnimations, setPlantAnimations] = useState(true);
  const [blurLevel, setBlurLevel] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      '🌿 Leave the Garden?',
      'Are you sure you want to sign out of PlantSpace?',
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

  const handleLeaveToGarden = () => {
    router.push('/(tabs)/home');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '🚨 Delete Garden Account',
      'This will permanently delete your account and all your seeds. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Feature Coming Soon', 'Account deletion will be available in a future update.');
          },
        },
      ]
    );
  };

  const openURL = (url: string) => {
    if (!url?.trim() || url.length > 200) return;
    const sanitizedUrl = url.trim();
    Linking.openURL(sanitizedUrl).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  const settingSections: SettingSection[] = [
    {
      title: 'Profile Settings',
      icon: Leaf,
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          subtitle: 'Update your garden profile',
          icon: User,
          type: 'navigation',
          onPress: () => router.push('/profile-setup'),
        },
        {
          id: 'change-username',
          title: 'Change Username',
          subtitle: `@${user?.username || 'username'}`,
          icon: Sprout,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Username changes will be available soon!'),
        },
        {
          id: 'change-email',
          title: 'Change Email',
          subtitle: user?.email || 'email@example.com',
          icon: Mail,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Email changes will be available soon!'),
        },
        {
          id: 'change-password',
          title: 'Change Password',
          subtitle: 'Update your account password',
          icon: Lock,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Password changes will be available soon!'),
        },
      ],
    },
    {
      title: 'Account & Security',
      icon: Shield,
      items: [
        {
          id: '2fa',
          title: 'Two-Factor Authentication',
          subtitle: 'Add extra security to your garden',
          icon: Shield,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Two-factor authentication will be available soon!'),
        },
        {
          id: 'login-activity',
          title: 'Login Activity',
          subtitle: 'See devices logged into your account',
          icon: Smartphone,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Login activity tracking will be available soon!'),
        },
        {
          id: 'reauth',
          title: 'Re-authentication',
          subtitle: 'Verify your identity',
          icon: Key,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Re-authentication will be available soon!'),
        },
        {
          id: 'delete-account',
          title: 'Delete Account',
          subtitle: 'Permanently remove your garden',
          icon: UserX,
          type: 'action',
          destructive: true,
          onPress: handleDeleteAccount,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          id: 'push-notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          icon: Bell,
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'likes-comments',
          title: 'Sunshine & Roots',
          subtitle: 'Likes and comments on your seeds',
          icon: Heart,
          type: 'toggle',
          value: likesNotifications,
          onToggle: setLikesNotifications,
        },
        {
          id: 'follower-activity',
          title: 'Garden Friends Activity',
          subtitle: 'New followers and mentions',
          icon: Users,
          type: 'toggle',
          value: followersNotifications,
          onToggle: setFollowersNotifications,
        },
        {
          id: 'updates',
          title: 'PlantSpace Updates',
          subtitle: 'News and feature announcements',
          icon: Newspaper,
          type: 'toggle',
          value: updatesNotifications,
          onToggle: setUpdatesNotifications,
        },
      ],
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          id: 'theme',
          title: 'Theme',
          subtitle: darkMode ? 'Dark Mode' : 'Light Mode',
          icon: darkMode ? Sun : Sun,
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          id: 'plant-animations',
          title: 'Plant Animations',
          subtitle: 'Enable growth and leaf animations',
          icon: TreePine,
          type: 'toggle',
          value: plantAnimations,
          onToggle: setPlantAnimations,
        },
        {
          id: 'accent-color',
          title: 'Accent Color',
          subtitle: 'Choose your garden theme',
          icon: Droplets,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Color customization will be available soon!'),
        },
        {
          id: 'blur-level',
          title: 'Glass Effect',
          subtitle: 'Adjust background blur intensity',
          icon: Sun,
          type: 'toggle',
          value: blurLevel,
          onToggle: setBlurLevel,
        },
      ],
    },
    {
      title: 'Privacy',
      icon: EyeOff,
      items: [
        {
          id: 'blocked-accounts',
          title: 'Blocked Accounts',
          subtitle: 'Manage blocked garden friends',
          icon: UserMinus,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Blocked accounts management will be available soon!'),
        },
        {
          id: 'muted-words',
          title: 'Muted Words & Topics',
          subtitle: 'Hide content with specific words',
          icon: EyeOff,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Content filtering will be available soon!'),
        },
      ],
    },
    {
      title: 'Support & Help',
      icon: HelpCircle,
      items: [
        {
          id: 'help-center',
          title: 'Help Center',
          subtitle: 'Find answers to common questions',
          icon: BookOpen,
          type: 'navigation',
          onPress: () => openURL('https://plantspace.help'),
        },
        {
          id: 'faq',
          title: 'FAQ',
          subtitle: 'Frequently asked questions',
          icon: HelpCircle,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'FAQ section will be available soon!'),
        },
        {
          id: 'report-bug',
          title: 'Report a Bug',
          subtitle: 'Help us improve PlantSpace',
          icon: Bug,
          type: 'navigation',
          onPress: () => router.push('/debug'),
        },
        {
          id: 'contact-support',
          title: 'Contact Support',
          subtitle: 'Get help from our garden team',
          icon: Phone,
          type: 'navigation',
          onPress: () => openURL('mailto:support@plantspace.app'),
        },
      ],
    },
    {
      title: 'About',
      icon: Info,
      items: [
        {
          id: 'about-plantspace',
          title: 'About PlantSpace',
          subtitle: 'Learn about our mission',
          icon: Sprout,
          type: 'navigation',
          onPress: () => Alert.alert('🌱 PlantSpace', 'A social platform for plant lovers and environmental enthusiasts. Growing a better future together!'),
        },
        {
          id: 'terms',
          title: 'Terms & Policies',
          subtitle: 'Privacy policy and terms of service',
          icon: FileText,
          type: 'navigation',
          onPress: () => openURL('https://plantspace.app/terms'),
        },
        {
          id: 'community-guidelines',
          title: 'Community Guidelines',
          subtitle: 'How to be a good garden citizen',
          icon: Scale,
          type: 'navigation',
          onPress: () => openURL('https://plantspace.app/guidelines'),
        },
        {
          id: 'app-version',
          title: 'App Version',
          subtitle: 'v1.0.0 (Build 1)',
          icon: Info,
          type: 'navigation',
          onPress: () => Alert.alert('PlantSpace v1.0.0', 'Build 1\n\nMade with 🌱 for plant lovers everywhere'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          item.destructive && styles.destructiveItem,
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemLeft}>
          <View style={[
            styles.settingIconContainer,
            item.destructive && styles.destructiveIconContainer,
          ]}>
            <IconComponent
              color={item.destructive ? PlantTheme.colors.error : PlantTheme.colors.primary}
              size={20}
            />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[
              styles.settingTitle,
              item.destructive && styles.destructiveText,
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{
              false: PlantTheme.colors.glassBorder,
              true: PlantTheme.colors.primaryLight,
            }}
            thumbColor={item.value ? PlantTheme.colors.primary : PlantTheme.colors.gray}
            ios_backgroundColor={PlantTheme.colors.glassBorder}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSection = (section: SettingSection) => {
    const SectionIcon = section.icon;
    
    return (
      <GlassCard key={section.title} style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconContainer}>
            <SectionIcon color={PlantTheme.colors.primary} size={24} />
          </View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        
        <View style={styles.sectionContent}>
          {section.items.map(renderSettingItem)}
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '🌿 Garden Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: PlantTheme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft color={PlantTheme.colors.textPrimary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <LinearGradient
        colors={[
          PlantTheme.colors.backgroundStart,
          PlantTheme.colors.backgroundEnd,
          PlantTheme.colors.primaryLight,
        ]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {settingSections.map(renderSection)}
        
        {/* Leave to Garden Button */}
        <GlassCard style={[styles.sectionCard, styles.leaveToGardenCard]}>
          <TouchableOpacity
            style={styles.leaveToGardenButton}
            onPress={handleLeaveToGarden}
            activeOpacity={0.7}
          >
            <View style={styles.leaveToGardenIconContainer}>
              <Sprout color={PlantTheme.colors.primary} size={20} />
            </View>
            <Text style={styles.leaveToGardenText}>Leave to the Garden</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Logout Button */}
        <GlassCard style={[styles.sectionCard, styles.logoutCard]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIconContainer}>
              <ArrowLeft color={PlantTheme.colors.error} size={20} />
            </View>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: PlantTheme.colors.glassBorder,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PlantTheme.colors.textPrimary,
  },
  sectionContent: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIconContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PlantTheme.colors.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: PlantTheme.colors.textSecondary,
  },
  destructiveItem: {
    // No additional background styling needed
  },
  destructiveText: {
    color: PlantTheme.colors.error,
  },
  leaveToGardenCard: {
    marginTop: 8,
  },
  leaveToGardenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  leaveToGardenIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaveToGardenText: {
    fontSize: 16,
    fontWeight: '600',
    color: PlantTheme.colors.primary,
  },
  logoutCard: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: PlantTheme.colors.error,
  },
});