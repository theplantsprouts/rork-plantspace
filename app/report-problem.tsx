import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Flag, AlertCircle } from 'lucide-react-native';
import { AnimatedButton } from '@/components/AnimatedPressable';
import { MaterialInput } from '@/components/MaterialInput';
import { MaterialButton } from '@/components/MaterialButton';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

const PROBLEM_CATEGORIES = [
  'Bug or Technical Issue',
  'Account Problem',
  'Content Issue',
  'Privacy Concern',
  'Feature Request',
  'Other',
];

export default function ReportProblemScreen() {
  const { user } = useAuth();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const handleSubmit = async () => {
    setError('');

    if (!category) {
      setError('Please select a category');
      return;
    }

    if (!description.trim()) {
      setError('Please describe the problem');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please provide more details (at least 10 characters)');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our team will review it and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 1500);
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
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Report a Problem</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Flag color={colors.primary} size={48} />
            </View>

            <Text style={[styles.title, { color: colors.onSurface }]}>
              Report an Issue
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Help us improve PlantSpace by reporting problems
            </Text>

            <View style={styles.form}>
              <View style={styles.categorySection}>
                <Text style={[styles.label, { color: colors.onSurface }]}>
                  Problem Category
                </Text>
                <View style={styles.categoryGrid}>
                  {PROBLEM_CATEGORIES.map((cat) => (
                    <AnimatedButton
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryButton,
                        {
                          backgroundColor: category === cat
                            ? colors.primary
                            : colors.surfaceContainer,
                          borderColor: category === cat
                            ? colors.primary
                            : colors.outlineVariant,
                        },
                      ]}
                      bounceEffect="subtle"
                      hapticFeedback="light"
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          {
                            color: category === cat
                              ? '#FFFFFF'
                              : colors.onSurface,
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </AnimatedButton>
                  ))}
                </View>
              </View>

              <MaterialInput
                label="Problem Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Please describe the problem in detail..."
                multiline
                numberOfLines={6}
                maxLength={500}
                leftIcon={<AlertCircle color={colors.primary} size={20} />}
                error={error}
                hint={`${description.length}/500 characters`}
                testID="description-input"
              />

              <View style={[styles.infoBox, { backgroundColor: colors.surfaceContainer }]}>
                <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
                  📧 We&apos;ll send updates to {user?.email}
                </Text>
              </View>

              <MaterialButton
                title={loading ? 'Submitting...' : 'Submit Report'}
                onPress={handleSubmit}
                disabled={loading}
                variant="filled"
                size="large"
                testID="submit-report-button"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  form: {
    width: '100%',
  },
  categorySection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  infoBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
