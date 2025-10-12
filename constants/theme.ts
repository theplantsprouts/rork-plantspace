export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  xxl: 44,
  full: 9999,
  organic: 24,
};

export const elevation = {
  level0: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  level1: { shadowColor: '#17cf17', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  level2: { shadowColor: '#17cf17', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  level3: { shadowColor: '#17cf17', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 6 },
  level4: { shadowColor: '#17cf17', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 8 },
  level5: { shadowColor: '#17cf17', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 24, elevation: 12 },
};

export const shadows = {
  sm: {
    shadowColor: '#17cf17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#17cf17',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#17cf17',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  xl: {
    shadowColor: '#17cf17',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 14,
  },
};

export const LightTheme = {
  colors: {
    primary: '#17cf17',
    primaryLight: '#a3f7a3',
    primaryDark: '#005300',
    primaryContainer: '#a3f7a3',
    onPrimaryContainer: '#002100',

    secondary: '#4CAF50',
    secondaryLight: '#A5D6A7',
    secondaryDark: '#2E7D32',

    tertiary: '#7BD389',
    tertiaryDark: '#2F6B3B',

    accent: '#FF7043',
    accentLight: '#FFB199',
    accentDark: '#D84315',

    surface: 'rgba(255, 255, 255, 0.82)',
    surfaceVariant: 'rgba(227, 242, 230, 0.75)',
    surfaceContainer: 'rgba(246, 248, 246, 0.92)',
    surfaceContainerHigh: 'rgba(233, 236, 233, 0.95)',
    surfaceContainerHighest: 'rgba(220, 230, 220, 0.98)',
    onSurface: '#1a1c1a',
    onSurfaceVariant: '#424942',

    outline: 'rgba(114, 121, 114, 0.3)',
    outlineVariant: 'rgba(194, 201, 194, 0.25)',

    background: '#f6f8f6',
    backgroundStart: '#f6f8f6',
    backgroundEnd: '#F1F8E9',

    cardBackground: 'rgba(255, 255, 255, 0.70)',
    cardBorder: 'rgba(23, 207, 23, 0.15)',
    cardShadow: 'rgba(0, 0, 0, 0.05)',

    glassBorder: 'rgba(23, 207, 23, 0.25)',
    glassBackground: 'rgba(255, 255, 255, 0.55)',
    glassBackgroundStrong: 'rgba(255, 255, 255, 0.75)',

    textPrimary: '#2E7D32',
    textSecondary: '#5C6F57',
    textLight: '#81C784',
    textDark: '#1B5E20',

    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    white: '#FFFFFF',
    black: '#000000',
    gray: '#9E9E9E',
    lightGray: '#F5F5F5',
    darkGray: '#424242',
  },
  spacing,
  borderRadius,
  elevation,
  shadows,
};

export const DarkTheme = {
  colors: {
    primary: '#7BD389',
    primaryLight: '#a3f7a3',
    primaryDark: '#4CAF50',
    primaryContainer: 'rgba(26, 61, 31, 0.60)',
    onPrimaryContainer: '#a3f7a3',

    secondary: '#81C784',
    secondaryLight: '#A5D6A7',
    secondaryDark: '#66BB6A',

    tertiary: '#7BD389',
    tertiaryDark: '#4CAF50',

    accent: '#FF8A65',
    accentLight: '#FFB199',
    accentDark: '#FF7043',

    surface: 'rgba(26, 28, 26, 0.78)',
    surfaceVariant: 'rgba(45, 58, 45, 0.70)',
    surfaceContainer: 'rgba(31, 43, 31, 0.85)',
    surfaceContainerHigh: 'rgba(42, 54, 42, 0.92)',
    surfaceContainerHighest: 'rgba(52, 64, 52, 0.96)',
    onSurface: '#e2e3e2',
    onSurfaceVariant: '#c2c9c2',

    outline: 'rgba(140, 147, 140, 0.35)',
    outlineVariant: 'rgba(66, 73, 66, 0.30)',

    background: '#0f120f',
    backgroundStart: '#0f120f',
    backgroundEnd: '#1a2e1a',

    cardBackground: 'rgba(31, 43, 31, 0.65)',
    cardBorder: 'rgba(123, 211, 137, 0.18)',
    cardShadow: 'rgba(0, 0, 0, 0.3)',

    glassBorder: 'rgba(123, 211, 137, 0.30)',
    glassBackground: 'rgba(26, 61, 31, 0.50)',
    glassBackgroundStrong: 'rgba(26, 61, 31, 0.70)',

    textPrimary: '#7BD389',
    textSecondary: '#A5D6A7',
    textLight: '#C8E6C9',
    textDark: '#4CAF50',

    success: '#66BB6A',
    warning: '#FFB74D',
    error: '#EF5350',
    info: '#42A5F5',

    white: '#FFFFFF',
    black: '#000000',
    gray: '#9E9E9E',
    lightGray: '#2a362a',
    darkGray: '#424242',
  },
  spacing,
  borderRadius,
  elevation,
  shadows,
};

export const PlantTheme = LightTheme;

export const PlantTypography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '900' as const },
  headline: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
};

export const PlantTerminology = {
  home: 'Garden',
  discover: 'Explore',
  create: 'Plant Seed',
  notifications: 'Leaves',
  profile: 'My Grove',
  posts: 'Seeds',
  likes: 'Sunshine',
  comments: 'Roots',
  followers: 'Garden Friends',
  following: 'Tending',
  share: 'Spread Seeds',
  save: 'Harvest',
};

export type PlantGrowthStage = 'seed' | 'sprout' | 'sapling' | 'bloom' | 'tree';

export const PlantGrowthStages: Record<PlantGrowthStage, {
  name: string;
  emoji: string;
  minEngagement: number;
  description: string;
}> = {
  seed: {
    name: 'Seed',
    emoji: '🌱',
    minEngagement: 0,
    description: 'Just getting started in the garden',
  },
  sprout: {
    name: 'Sprout',
    emoji: '🌿',
    minEngagement: 10,
    description: 'Growing and learning',
  },
  sapling: {
    name: 'Sapling',
    emoji: '🌳',
    minEngagement: 50,
    description: 'Developing strong roots',
  },
  bloom: {
    name: 'Bloom',
    emoji: '🌸',
    minEngagement: 100,
    description: 'Flourishing in the community',
  },
  tree: {
    name: 'Mighty Tree',
    emoji: '🌲',
    minEngagement: 200,
    description: 'A pillar of the garden community',
  },
};
