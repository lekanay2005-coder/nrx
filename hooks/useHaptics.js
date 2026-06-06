import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const trigger = useCallback((type = 'LIGHT') => {
    try {
      switch (type.toUpperCase()) {
        case 'LIGHT':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'MEDIUM':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'HEAVY':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'SUCCESS':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'WARNING':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'ERROR':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          Haptics.selectionAsync();
          break;
      }
    } catch (e) {
      console.warn('Haptics not supported on preview environment:', e.message);
    }
  }, []);

  return trigger;
}
