import { Colors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useTheme() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme];
}