import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InteractionManager } from 'react-native';

/**
 * Hook to optimize screen performance during navigation
 * Pauses heavy animations and operations when screen is not focused
 */
export const useNavigationOptimization = () => {
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [isNavigationComplete, setIsNavigationComplete] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      setIsNavigationComplete(false);
      
      // Wait for navigation animation to complete before enabling heavy operations
      const interaction = InteractionManager.runAfterInteractions(() => {
        setIsNavigationComplete(true);
      });

      return () => {
        setIsScreenFocused(false);
        setIsNavigationComplete(false);
        interaction.cancel();
      };
    }, [])
  );

  return {
    isScreenFocused,
    isNavigationComplete,
    shouldRenderAnimations: isScreenFocused && isNavigationComplete,
  };
};