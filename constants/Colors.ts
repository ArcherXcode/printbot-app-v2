type ThemeColors = {
  textPrimary: string;
  textSecondary: string;
  background: string;
  surface: string;
  elevated: string;
  border: string;
  primary: string;
  primarySoft: string;
  secondary: string;
  secondarySoft: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  grid: string;
  overlay: string;
  inverseText: string;
  headerBackground: string;
  headerText: string;
  tabIconDefault: string;
  tabIconSelected: string;
  tabPill: string;
  tabBadgeText: string;
  tabBadgeBackground: string;
  tabBarBackground: string;
  authBackground: string;
  authCard: string;
  authCardBorder: string;
  authInput: string;
  authInputBorder: string;
  authPlaceholder: string;
  authIcon: string;
  authMuted: string;
  authGradientStart: string;
  authGradientEnd: string;
};

interface ThemeInterface {
  light: ThemeColors;
  dark: ThemeColors;
}

export const colors: ThemeInterface = {
  light: {
    textPrimary: '#1f1f1f',
    textSecondary: '#454746',
    background: '#fff',
    surface: '#ffffff',
    elevated: '#f7f9fc',
    border: '#d6dde6',
    primary: '#008cff',
    primarySoft: 'rgba(0, 140, 255, 0.08)',
    secondary: '#16845b',
    secondarySoft: 'rgba(22, 132, 91, 0.1)',
    success: '#1c7f3a',
    successSoft: 'rgba(28, 127, 58, 0.1)',
    danger: '#d93025',
    dangerSoft: 'rgba(217, 48, 37, 0.08)',
    warning: '#a86500',
    grid: '#e5eaf0',
    overlay: 'rgba(0,0,0,0.42)',
    inverseText: '#ffffff',
    headerBackground: '#f0f4f8',
    headerText: '#1f1f1f',
    tabIconSelected: '#012448',
    tabIconDefault: '#3f4140',
    tabPill: '#c2e7fe',
    tabBadgeText: '#fff',
    tabBadgeBackground: '#d93025',
    tabBarBackground: '#f0f4f8',
    authBackground: '#f0f4ff',
    authCard: '#ffffff',
    authCardBorder: '#dde3f5',
    authInput: '#eef1fb',
    authInputBorder: '#cdd4ee',
    authPlaceholder: '#9099ba',
    authIcon: '#8890aa',
    authMuted: '#5a6080',
    authGradientStart: '#5986e7',
    authGradientEnd: '#4a6fd4',
  },
  dark: {
    textPrimary: '#e3e3e3',
    textSecondary: '#c5c7c5',
    background: '#131314',
    surface: '#161719',
    elevated: '#1e1f20',
    border: '#2b2d31',
    primary: '#0061b2',
    primarySoft: 'rgba(0, 97, 178, 0.14)',
    secondary: '#9ad6bc',
    secondarySoft: 'rgba(154, 214, 188, 0.12)',
    success: '#8fd6a4',
    successSoft: 'rgba(143, 214, 164, 0.12)',
    danger: '#f28b82',
    dangerSoft: 'rgba(242, 139, 130, 0.1)',
    warning: '#f7c873',
    grid: '#34363b',
    overlay: 'rgba(0,0,0,0.42)',
    inverseText: '#ffffff',
    headerBackground: '#1e1f20',
    headerText: '#ffffff',
    tabIconSelected: '#bfe3fe',
    tabIconDefault: '#c3c7c5',
    tabPill: '#004a76',
    tabBadgeText: '#1b1b1b',
    tabBadgeBackground: '#f28b82',
    tabBarBackground: '#1e1f20',
    authBackground: '#0a0e27',
    authCard: '#12183a',
    authCardBorder: '#1e2a50',
    authInput: '#1a2240',
    authInputBorder: '#2a3460',
    authPlaceholder: '#4a5278',
    authIcon: '#6b7194',
    authMuted: '#a0a8c8',
    authGradientStart: '#5986e7',
    authGradientEnd: '#4a6fd4',
  },
};
