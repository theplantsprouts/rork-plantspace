import createContextHook from '@nkzw/create-context-hook';
import { useMemo } from 'react';
import { LightTheme, DarkTheme } from '@/constants/theme';
import { useSettings } from './use-settings';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const { settings } = useSettings();
  const isDark = settings.app.darkMode;

  const theme = useMemo(() => {
    return isDark ? DarkTheme : LightTheme;
  }, [isDark]);

  return useMemo(() => ({
    theme,
    isDark,
    colors: theme.colors,
  }), [theme, isDark]);
});
