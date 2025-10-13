import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  FileQuestion,
} from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useTheme } from '@/hooks/use-theme';

export default function HelpSupportScreen() {
  const { colors } = useTheme();

  const helpOptions = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions',
      icon: FileQuestion,
      onPress: () => {
        Linking.openURL('https://plantspace.help/faq');
      },
    },
    {
      id: 'guide',
      title: 'User Guide',
      subtitle: 'Learn how to use PlantSpace',
      icon: BookOpen,
      onPress: () => {
        Linking.openURL('https://plantspace.help/guide');
      },
    },
    {
      id: 'community',
      title: 'Community Forum',
      subtitle: 'Connect with other users',
      icon: MessageCircle,
      onPress: () => {
        Linking.openURL('https://community.plantspace.app');
      },
    },
    {
      id: 'contact',
      title: 'Contact Support',
      subtitle: 'Get help from our team',
      icon: Mail,
      onPress: () => {
        Linking.openURL('mailto:support@plantspace.app');
      },
    },
    {
      id: 'report',
      title: 'Report a Problem',
      subtitle: 'Let us know about issues',
      icon: HelpCircle,
      onPress: () => {
        router.push('/report-problem');
      },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <AnimatedButton
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surfaceContainer }]}
            bounceEffect="subtle"
            hapticFeedback="light"
          >
            <ArrowLeft color={colors.onSurface} size={24} />
          </AnimatedButton>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.welcomeCard, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.welcomeTitle, { color: colors.onSurface }]}>
              How can we help you?
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.onSurfaceVariant }]}>
              Choose from the options below to get the help you need
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Support Options
          </Text>

          {helpOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <AnimatedButton
                key={option.id}
                onPress={option.onPress}
                style={[
                  styles.optionCard,
                  { backgroundColor: colors.surfaceContainer },
                  index === helpOptions.length - 1 && styles.lastCard,
                ]}
                bounceEffect="subtle"
                hapticFeedback="light"
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                    <IconComponent color={colors.primary} size={24} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.optionTitle, { color: colors.onSurface }]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.onSurfaceVariant }]}>
                      {option.subtitle}
                    </Text>
                  </View>
                </View>
                <ExternalLink color={colors.onSurfaceVariant} size={20} />
              </AnimatedButton>
            );
          })}

          <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
              💚 Our support team typically responds within 24 hours. For urgent issues, please use the &quot;Report a Problem&quot; option.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginRight: 48,
  },
  headerSpacer: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    textTransform: 'uppercase',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  lastCard: {
    marginBottom: 24,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
