import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { X } from 'lucide-react-native';
import { PlantTheme } from '@/constants/theme';

type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'misinformation'
  | 'copyright'
  | 'other';

interface ReportOption {
  id: ReportReason;
  title: string;
}

export default function ReportProblemScreen() {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');

  const reportOptions: ReportOption[] = [
    { id: 'spam', title: 'It\'s spam' },
    { id: 'inappropriate', title: 'Inappropriate content' },
    { id: 'harassment', title: 'Harassment or bullying' },
    { id: 'misinformation', title: 'False or misleading information' },
    { id: 'copyright', title: 'Copyright violation' },
    { id: 'other', title: 'Something else' },
  ];

  const handleSubmit = () => {
    if (!details.trim()) {
      Alert.alert('Additional Details Required', 'Please provide more information about the issue.');
      return;
    }

    Alert.alert(
      'Report Submitted',
      'Thank you for your report. Our team will review it shortly.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderReportOption = (option: ReportOption) => {
    const isSelected = selectedReason === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.reportOption,
          isSelected && styles.reportOptionSelected,
        ]}
        onPress={() => setSelectedReason(option.id)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.reportOptionText,
            isSelected && styles.reportOptionTextSelected,
          ]}
        >
          {option.title}
        </Text>
        <View
          style={[
            styles.radioButton,
            isSelected && styles.radioButtonSelected,
          ]}
        >
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color="#374151" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.mainTitle}>Why are you reporting this?</Text>
        <Text style={styles.description}>
          Your report is anonymous. If someone is in immediate danger, call local
          emergency services - do not wait.
        </Text>

        <View style={styles.optionsContainer}>
          {reportOptions.map((option) => renderReportOption(option))}
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsLabel}>Additional details</Text>
          <TextInput
            style={styles.detailsInput}
            placeholder="Help us understand what is happening."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(246, 248, 246, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
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
    paddingTop: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  reportOptionSelected: {
    borderColor: PlantTheme.colors.primary,
    backgroundColor: 'rgba(23, 207, 23, 0.05)',
  },
  reportOptionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
    flex: 1,
  },
  reportOptionTextSelected: {
    color: '#111827',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: PlantTheme.colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PlantTheme.colors.primary,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#111827',
    marginBottom: 8,
  },
  detailsInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: PlantTheme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
