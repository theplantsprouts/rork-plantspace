import createContextHook from '@nkzw/create-context-hook';
import { useMemo, useEffect, useState } from 'react';
import { LightTheme, DarkTheme } from '@/constants/theme';
import { useSettings } from './use-settings';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const { settings, isLoading } = useSettings();
  const [isDark, setIsDark] = useState(settings?.app?.darkMode ?? false);

  useEffect(() => {
    if (!isLoading && settings?.app?.darkMode !== undefined) {
      setIsDark(settings.app.darkMode);
    }
  }, [settings?.app?.darkMode, isLoading]);

  const theme = useMemo(() => {
    return isDark ? DarkTheme : LightTheme;
  }, [isDark]);

  return useMemo(() => ({
    theme,
    isDark,
    colors: theme?.colors ?? LightTheme.colors,
  }), [theme, isDark]);
});
