import { logAnalyticsEvent, analytics } from '@/lib/firebase';
import { Platform } from 'react-native';

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

// User engagement events
export const trackUserLogin = (method: string) => {
  logAnalyticsEvent('login', {
    method,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

export const trackUserSignup = (method: string) => {
  logAnalyticsEvent('sign_up', {
    method,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

export const trackUserLogout = () => {
  logAnalyticsEvent('logout', {
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

// Content events
export const trackPostCreated = (postId: string, hasImage: boolean) => {
  logAnalyticsEvent('post_created', {
    post_id: postId,
    has_image: hasImage,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

export const trackPostViewed = (postId: string, authorId: string) => {
  logAnalyticsEvent('post_viewed', {
    post_id: postId,
    author_id: authorId,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

export const trackPostLiked = (postId: string, authorId: string) => {
  logAnalyticsEvent('post_liked', {
    post_id: postId,
    author_id: authorId,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

export const trackPostShared = (postId: string, method: string) => {
  logAnalyticsEvent('post_shared', {
    post_id: postId,
    method,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

// Navigation events
export const trackScreenView = (screenName: string) => {
  logAnalyticsEvent('screen_view', {
    screen_name: screenName,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

export const trackTabSwitch = (fromTab: string, toTab: string) => {
  logAnalyticsEvent('tab_switch', {
    from_tab: fromTab,
    to_tab: toTab,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

// Feature usage events
export const trackFeatureUsed = (featureName: string, context?: Record<string, any>) => {
  logAnalyticsEvent('feature_used', {
    feature_name: featureName,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

export const trackImageUpload = (uploadMethod: string, fileSize?: number) => {
  logAnalyticsEvent('image_upload', {
    upload_method: uploadMethod,
    file_size: fileSize,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, context?: Record<string, any>) => {
  logAnalyticsEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Performance events
export const trackPerformance = (metric: string, value: number, context?: Record<string, any>) => {
  logAnalyticsEvent('performance_metric', {
    metric_name: metric,
    metric_value: value,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...context,
  });
};

// Search events
export const trackSearch = (query: string, resultsCount: number) => {
  logAnalyticsEvent('search', {
    search_term: query,
    results_count: resultsCount,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

// Profile events
export const trackProfileUpdated = (fieldsUpdated: string[]) => {
  logAnalyticsEvent('profile_updated', {
    fields_updated: fieldsUpdated,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

export const trackProfileViewed = (profileId: string, isOwnProfile: boolean) => {
  logAnalyticsEvent('profile_viewed', {
    profile_id: profileId,
    is_own_profile: isOwnProfile,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  });
};

// Custom event tracker
export const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
  logAnalyticsEvent(eventName, {
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...parameters,
  });
};

// Analytics verification
export const verifyAnalytics = (): { enabled: boolean; platform: string; message: string } => {
  const isWeb = Platform.OS === 'web';
  const isEnabled = isWeb ? !!analytics : true;
  
  if (isWeb && !analytics) {
    return {
      enabled: false,
      platform: 'web',
      message: 'Firebase Analytics is not available on web. Check Firebase configuration.',
    };
  }
  
  if (isWeb && analytics) {
    return {
      enabled: true,
      platform: 'web',
      message: 'Firebase Analytics is enabled and tracking events.',
    };
  }
  
  return {
    enabled: true,
    platform: Platform.OS,
    message: `Analytics tracking is enabled on ${Platform.OS}. Events are being logged to console.`,
  };
};

// Test analytics with a verification event
export const testAnalytics = () => {
  const verification = verifyAnalytics();
  console.log('Analytics Verification:', verification);
  
  trackCustomEvent('analytics_test', {
    test_timestamp: new Date().toISOString(),
    verification_status: verification.enabled,
  });
  
  return verification;
};