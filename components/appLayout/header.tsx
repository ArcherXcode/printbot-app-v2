import { Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTextStyles } from '@/constants/styles/textStyles';

export default function Header({ title = 'Title' }: { title?: string }) {
  const textStyles = useTextStyles();
  return (
    <BlurView
      intensity={80}
      tint="systemMaterial"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: Platform.select({ ios: 100, android: 85 }),
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.2)',
      }}
    >
      <Text style={textStyles.header}>
        {title}
      </Text>
    </BlurView>
  );
};