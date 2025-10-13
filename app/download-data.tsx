import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Download, FileText, Image, MessageCircle, Users } from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { MaterialButton } from '@/components/MaterialButton';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function DownloadDataScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const dataTypes = [
    {
      id: 'posts',
      title: 'Posts',
      subtitle: 'All your posts and captions',
      icon: FileText,
    },
    {
      id: 'photos',
      title: 'Photos & Videos',
      subtitle: 'All media you&apos;ve uploaded',
      icon: Image,
    },
    {
      id: 'comments',
      title: 'Comments',
      subtitle: 'All your comments and replies',
      icon: MessageCircle,
    },
    {
      id: 'connections',
      title: 'Connections',
      subtitle: 'Your followers and following list',
      icon: Users,
    },
  ];

  const handleDownloadData = async () => {
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Request Received',
        'Your data download request has been received. We&apos;ll send you an email with a download link within 48 hours.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

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
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Download Data</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Download color={colors.primary} size={48} />
          </View>

          <Text style={[styles.title, { color: colors.onSurface }]}>
            Download Your Data
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Get a copy of all your data from PlantSpace
          </Text>

          <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.infoTitle, { color: colors.onSurface }]}>
              What&apos;s included:
            </Text>
            {dataTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <View key={type.id} style={styles.dataTypeItem}>
                  <IconComponent color={colors.primary} size={20} />
                  <View style={styles.dataTypeText}>
                    <Text style={[styles.dataTypeTitle, { color: colors.onSurface }]}>
                      {type.title}
                    </Text>
                    <Text style={[styles.dataTypeSubtitle, { color: colors.onSurfaceVariant }]}>
                      {type.subtitle}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={[styles.warningBox, { backgroundColor: colors.surfaceContainer }]}>
            <Text style={[styles.warningText, { color: colors.onSurfaceVariant }]}>
              ⏱️ Processing your data may take up to 48 hours. We&apos;ll send you an email at {user?.email} when your download is ready.
            </Text>
          </View>

          <MaterialButton
            title={loading ? 'Requesting...' : 'Request Data Download'}
            onPress={handleDownloadData}
            disabled={loading}
            variant="filled"
            size="large"
            icon={<Download color="#FFFFFF" size={20} />}
            testID="download-data-button"
          />
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
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  infoBox: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  dataTypeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dataTypeText: {
    flex: 1,
    marginLeft: 12,
  },
  dataTypeTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  dataTypeSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  warningBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
