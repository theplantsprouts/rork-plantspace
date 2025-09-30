import { Platform } from 'react-native';
import { trackPerformance } from './analytics';

export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static startMeasure(label: string) {
    this.measurements.set(label, Date.now());
  }

  static endMeasure(label: string) {
    const startTime = this.measurements.get(label);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.measurements.delete(label);
      
      if (__DEV__) {
        console.log(`⏱️ ${label}: ${duration}ms`);
      }
      
      trackPerformance(label, duration);
      return duration;
    }
    return 0;
  }

  static measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(label);
    return fn().finally(() => this.endMeasure(label));
  }
}

export const optimizeForPlatform = {
  shouldUseNativeDriver: Platform.OS !== 'web',
  
  getImageCachePolicy: () => {
    if (Platform.OS === 'ios') return 'memory-disk';
    if (Platform.OS === 'android') return 'memory';
    return 'none';
  },
  
  getMaxConcurrentRequests: () => {
    if (Platform.OS === 'web') return 6;
    if (Platform.OS === 'ios') return 4;
    return 3;
  },
  
  shouldEnableHardwareAcceleration: Platform.OS === 'android',
  
  getOptimalBatchSize: () => {
    if (Platform.OS === 'web') return 20;
    if (Platform.OS === 'ios') return 15;
    return 10;
  },
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const memoizeOne = <T extends (...args: any[]) => any>(fn: T): T => {
  let lastArgs: any[] | undefined;
  let lastResult: any;
  
  return ((...args: any[]) => {
    if (
      !lastArgs ||
      args.length !== lastArgs.length ||
      args.some((arg, i) => arg !== lastArgs![i])
    ) {
      lastResult = fn(...args);
      lastArgs = args;
    }
    return lastResult;
  }) as T;
};
