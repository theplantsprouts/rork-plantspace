import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Mail,
  MessageSquare,
  Video,
  ChevronRight,
} from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';

interface HelpItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  onPress: () => void;
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

export default function HelpSupportScreen() {
  const insets = useSafeAreaInsets();

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact us:',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@plantspace.app'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const helpSections: HelpSection[] = [
    {
      title: 'Getting Started',
      items: [
        {
          id: 'quick-start',
          title: 'Quick Start Guide',
          subtitle: 'Learn the basics of our app',
          icon: BookOpen,
          onPress: () =>
            Alert.alert(
              'Quick Start Guide',
              'Welcome to PlantSpace! Here you can:\n\n• Share your plant journey\n• Connect with plant lovers\n• Discover new plant care tips\n• Join a growing community'
            ),
        },
        {
          id: 'faq',
          title: 'FAQ',
          subtitle: 'Find answers to common questions',
          icon: HelpCircle,
          onPress: () =>
            Alert.alert(
              'Frequently Asked Questions',
              'Visit our FAQ section at plantspace.app/faq for detailed answers to common questions.'
            ),
        },
      ],
    },
    {
      title: 'Contact Us',
      items: [
        {
          id: 'contact-support',
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: Mail,
          onPress: handleContactSupport,
        },
      ],
    },
    {
      title: 'Community',
      items: [
        {
          id: 'community-forum',
          title: 'Community Forum',
          subtitle: 'Join discussions with other users',
          icon: MessageSquare,
          onPress: () =>
            Alert.alert(
              'Community Forum',
              'Join our community forum to connect with other plant enthusiasts and share your experiences!'
            ),
        },
        {
          id: 'tutorials',
          title: 'Tutorials',
          subtitle: 'Watch guides and walkthroughs',
          icon: Video,
          onPress: () =>
            Alert.alert(
              'Video Tutorials',
              'Check out our video tutorials to learn how to make the most of PlantSpace!'
            ),
        },
      ],
    },
  ];

  const renderHelpItem = (item: HelpItem) => {
    const IconComponent = item.icon;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.helpItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.helpItemLeft}>
          <View style={styles.iconContainer}>
            <IconComponent color={PlantTheme.colors.primary} size={24} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.helpTitle}>{item.title}</Text>
            <Text style={styles.helpSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <ChevronRight color="#9CA3AF" size={20} />
      </TouchableOpacity>
    );
  };

  const renderSection = (section: HelpSection) => {
    return (
      <View key={section.title} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCard}>
          {section.items.map((item, index) => (
            <View key={item.id}>
              {renderHelpItem(item)}
              {index < section.items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1a1c1a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
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
        {helpSections.map((section) => renderSection(section))}
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  helpItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(23, 207, 23, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a1c1a',
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 80,
  },
});
