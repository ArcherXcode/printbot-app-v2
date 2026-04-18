interface ThemeInterface {
  light: {
    text: string;
    background: string;
    primary: string;
    primaryBackground: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabBarBackground: string; // ✅ Add this
  }
  dark: {
    text: string;
    background: string;
    primary: string;
    primaryBackground: string;
    tint: string;
    icon: string;
    tabIconDefault: string;
    tabBarBackground: string;
  };
}

export const colors: ThemeInterface = {
  light: {
    text: '#000',
    background: '#fff',
    primary: '#007AFF',
    primaryBackground: '#E0F3FF',
    tint: '#000',
    icon: '#fff',
    tabIconDefault: '#aeaeae',
    tabBarBackground: '#fff', // ✅ Add this
  },
  dark: {
    text: '#fff',
    background: '#282828',
    primary: '#0A84FF',
    primaryBackground: '#68c5fe',
    tint: '#fff',
    icon: '#fff',
    tabIconDefault: '#878787',
    tabBarBackground: '#000000ff', // ✅ Add this
  },
};