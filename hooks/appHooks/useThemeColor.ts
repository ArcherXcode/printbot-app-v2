import { colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/appHooks/useColorScheme';

export function useThemeColor(
  props: {light?: string; dark?: string},
  colorName: keyof typeof colors.light & keyof typeof colors.dark
) {
  const theme = (useColorScheme() as 'light' | 'dark') ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return colors[theme][colorName];
  }
}