import createContextHook from '@nkzw/create-context-hook';
import { useMemo, useEffect, useState } from 'react';
import { LightTheme, DarkTheme } from '@/constants/theme';
import { useSettings } from './use-settings';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const { settings, isLoading: settingsLoading } = useSettings();
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!settingsLoading) {
      if (settings?.app?.darkMode !== undefined) {
        setIsDark(settings.app.darkMode);
      }
      setIsReady(true);
    }
  }, [settings?.app?.darkMode, settingsLoading]);

  const theme = useMemo(() => {
    return isDark ? DarkTheme : LightTheme;
  }, [isDark]);

  const colors = useMemo(() => theme.colors, [theme]);
  const spacing = useMemo(() => theme.spacing, [theme]);
  const borderRadius = useMemo(() => theme.borderRadius, [theme]);
  const elevation = useMemo(() => theme.elevation, [theme]);
  const shadows = useMemo(() => theme.shadows, [theme]);

  return useMemo(() => ({
    theme,
    isDark,
    colors,
    spacing,
    borderRadius,
    elevation,
    shadows,
    isLoading: !isReady,
  }), [theme, isDark, colors, spacing, borderRadius, elevation, shadows, isReady]);
});
