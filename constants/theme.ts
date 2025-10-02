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

    surface: '#ffffff',
    surfaceVariant: '#E3F2E6',
    surfaceContainer: '#F6F8F6',
    surfaceContainerHigh: '#E9ECE9',
    onSurface: '#1a1c1a',
    onSurfaceVariant: '#424942',

    outline: '#727972',
    outlineVariant: '#c2c9c2',

    background: '#f6f8f6',
    backgroundStart: '#f6f8f6',
    backgroundEnd: '#F1F8E9',

    cardBackground: '#FFFFFF',
    cardBorder: 'rgba(23, 207, 23, 0.18)',
    cardShadow: 'rgba(0, 0, 0, 0.08)',

    glassBorder: 'rgba(23, 207, 23, 0.28)',
    glassBackground: 'rgba(255, 255, 255, 0.12)',

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
};

export const DarkTheme = {
  colors: {
    primary: '#7BD389',
    primaryLight: '#a3f7a3',
    primaryDark: '#4CAF50',
    primaryContainer: '#1a3d1f',
    onPrimaryContainer: '#a3f7a3',

    secondary: '#81C784',
    secondaryLight: '#A5D6A7',
    secondaryDark: '#66BB6A',

    tertiary: '#7BD389',
    tertiaryDark: '#4CAF50',

    accent: '#FF8A65',
    accentLight: '#FFB199',
    accentDark: '#FF7043',

    surface: '#1a1c1a',
    surfaceVariant: '#2d3a2d',
    surfaceContainer: '#1f2b1f',
    surfaceContainerHigh: '#2a362a',
    onSurface: '#e2e3e2',
    onSurfaceVariant: '#c2c9c2',

    outline: '#8c938c',
    outlineVariant: '#424942',

    background: '#0f120f',
    backgroundStart: '#0f120f',
    backgroundEnd: '#1a2e1a',

    cardBackground: '#1f2b1f',
    cardBorder: 'rgba(123, 211, 137, 0.25)',
    cardShadow: 'rgba(0, 0, 0, 0.4)',

    glassBorder: 'rgba(123, 211, 137, 0.35)',
    glassBackground: 'rgba(26, 61, 31, 0.3)',

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
};

export const PlantTheme = LightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const elevation = {
  level0: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  level1: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  level2: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  level3: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  level4: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 6 },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

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
