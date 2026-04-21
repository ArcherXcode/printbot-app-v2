const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

interface ThemeInterface {
  light: {
    textPrimary: string;
    textSecondary: string;
    background: string;
    primary: string;
    tabIconDefault: string;
    tabIconSelected: string;
    tabPill: string;
    tabBadgeText: string;
    tabBadgeBackground: string;
    tabBarBackground: string;
  }
  dark: {
    textPrimary: string;
    textSecondary: string;
    background: string;
    primary: string;
    tabIconDefault: string;
    tabIconSelected: string;
    tabPill: string;
    tabBadgeText: string;
    tabBadgeBackground: string;
    tabBarBackground: string;
  };
}

export const colors: ThemeInterface = {
  light: {
    textPrimary: '#1f1f1f',
    textSecondary: '#454746',
    background: '#fff',
    primary: '#007AFF',
    tabIconSelected: '#012448',
    tabIconDefault: '#3f4140',
    tabPill: '#c2e7fe',
    tabBadgeText: '#fff',
    tabBadgeBackground: '#d93025',
    tabBarBackground: '#f0f4f8',
  },
  dark: {
    textPrimary: '#e3e3e3',
    textSecondary: '#c5c7c5',
    background: '#131314',
    primary: '#68c5fe',
    tabIconSelected: '#bfe3fe',
    tabIconDefault: '#c3c7c5',
    tabPill: '#004a76',
    tabBadgeText: '#1b1b1b',
    tabBadgeBackground: '#f28b82',
    tabBarBackground: '#1e1f20',
  },
};