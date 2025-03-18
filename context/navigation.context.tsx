import React, { createContext, useContext, useState, ReactNode } from 'react';
import { router } from 'expo-router';

interface NavigationContextType {
  isNavigationEnabled: boolean;
  disableNavigation: () => void;
  enableNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigationEnabled: true,
  disableNavigation: () => {},
  enableNavigation: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isNavigationEnabled, setIsNavigationEnabled] = useState(true);
  const [originalRouter, setOriginalRouter] = useState<any>(null);
  
  const disableNavigation = () => {
    if (isNavigationEnabled) {
      setOriginalRouter({
        push: router.push,
        replace: router.replace,
        back: router.back,
      });
      
      router.push = () => { console.log('Navigation disabled'); };
      router.replace = () => { console.log('Navigation disabled'); };
      router.back = () => { console.log('Navigation disabled'); };
      
      setIsNavigationEnabled(false);
    }
  };
  
  const enableNavigation = () => {
    if (!isNavigationEnabled && originalRouter) {
      router.push = originalRouter.push;
      router.replace = originalRouter.replace;
      router.back = originalRouter.back;
      
      setIsNavigationEnabled(true);
    }
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        isNavigationEnabled, 
        disableNavigation, 
        enableNavigation 
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};