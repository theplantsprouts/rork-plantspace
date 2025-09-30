import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Sprout, ChevronRight } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';

interface AboutLink {
  id: string;
  title: string;
  onPress: () => void;
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  const aboutLinks: AboutLink[] = [
    {
      id: 'terms',
      title: 'Terms of Service',
      onPress: () => {
        Alert.alert(
          'Terms of Service',
          'By using PlantSpace, you agree to our terms and conditions. Visit plantspace.app/terms for full details.'
        );
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      onPress: () => {
        Alert.alert(
          'Privacy Policy',
          'We respect your privacy. Learn more about how we protect your data at plantspace.app/privacy'
        );
      },
    },
    {
      id: 'licenses',
      title: 'Open Source Licenses',
      onPress: () => {
        Alert.alert(
          'Open Source Licenses',
          'PlantSpace is built with open source software. View all licenses at plantspace.app/licenses'
        );
      },
    },
  ];

  const renderLink = (link: AboutLink, isLast: boolean) => {
    return (
      <View key={link.id}>
        <TouchableOpacity
          style={styles.linkItem}
          onPress={link.onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.linkText}>{link.title}</Text>
          <ChevronRight color="#9CA3AF" size={20} />
        </TouchableOpacity>
        {!isLast && <View style={styles.divider} />}
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
        <Text style={styles.headerTitle}>About</Text>
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
        <View style={styles.logoSection}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Sprout color="#FFFFFF" size={32} />
            </View>
          </View>
          <Text style={styles.appName}>PlantSpace</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.missionSection}>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            PlantSpace is dedicated to connecting plant enthusiasts worldwide,
            fostering a vibrant community where knowledge, tips, and experiences are
            shared to cultivate a greener planet.
          </Text>
        </View>

        <View style={styles.linksSection}>
          {aboutLinks.map((link, index) =>
            renderLink(link, index === aboutLinks.length - 1)
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with 🌱 for plant lovers</Text>
          <Text style={styles.copyright}>© 2024 PlantSpace. All rights reserved.</Text>
        </View>
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
    paddingTop: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoOuter: {
    padding: 12,
    backgroundColor: 'rgba(23, 207, 23, 0.2)',
    borderRadius: 9999,
    marginBottom: 16,
  },
  logoInner: {
    width: 64,
    height: 64,
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#6B7280',
  },
  missionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a1c1a',
    marginBottom: 8,
  },
  missionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  linksSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#1a1c1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
