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
  Sprout,
  Heart,
  Users,
  Globe,
  Shield,
  FileText,
} from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { useTheme } from '@/hooks/use-theme';

export default function AboutScreen() {
  const { colors } = useTheme();

  const links = [
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      onPress: () => Linking.openURL('https://plantspace.app/terms'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      onPress: () => Linking.openURL('https://plantspace.app/privacy'),
    },
    {
      id: 'website',
      title: 'Visit Our Website',
      icon: Globe,
      onPress: () => Linking.openURL('https://plantspace.app'),
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
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>About</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.logoContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Sprout color={colors.primary} size={64} />
          </View>

          <Text style={[styles.appName, { color: colors.onSurface }]}>
            PlantSpace
          </Text>
          <Text style={[styles.version, { color: colors.onSurfaceVariant }]}>
            Version 1.0.0
          </Text>

          <View style={[styles.missionCard, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.missionTitle, { color: colors.onSurface }]}>
              Our Mission
            </Text>
            <Text style={[styles.missionText, { color: colors.onSurfaceVariant }]}>
              PlantSpace is a community-driven platform where plant enthusiasts connect, share, and grow together. We believe in fostering a sustainable future through the love of plants and nature.
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Users color={colors.primary} size={28} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>
                Community
              </Text>
              <Text style={[styles.featureText, { color: colors.onSurfaceVariant }]}>
                Connect with plant lovers worldwide
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Heart color={colors.primary} size={28} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>
                Passion
              </Text>
              <Text style={[styles.featureText, { color: colors.onSurfaceVariant }]}>
                Share your love for plants
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Sprout color={colors.primary} size={28} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.onSurface }]}>
                Growth
              </Text>
              <Text style={[styles.featureText, { color: colors.onSurfaceVariant }]}>
                Learn and grow together
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Legal & Information
          </Text>

          {links.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <AnimatedButton
                key={link.id}
                onPress={link.onPress}
                style={[
                  styles.linkCard,
                  { backgroundColor: colors.surfaceContainer },
                  index === links.length - 1 && styles.lastCard,
                ]}
                bounceEffect="subtle"
                hapticFeedback="light"
              >
                <View style={styles.linkLeft}>
                  <View style={[styles.linkIcon, { backgroundColor: `${colors.primary}15` }]}>
                    <IconComponent color={colors.primary} size={20} />
                  </View>
                  <Text style={[styles.linkText, { color: colors.onSurface }]}>
                    {link.title}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.onSurfaceVariant }]}>›</Text>
              </AnimatedButton>
            );
          })}

          <View style={[styles.footerCard, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
              Made with 💚 by the PlantSpace Team
            </Text>
            <Text style={[styles.copyright, { color: colors.onSurfaceVariant }]}>
              © 2025 PlantSpace. All rights reserved.
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    marginBottom: 32,
  },
  missionCard: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    marginBottom: 32,
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  missionText: {
    fontSize: 16,
    lineHeight: 26,
  },
  featuresSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  linkCard: {
    width: '100%',
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
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300' as const,
  },
  footerCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
  },
});
