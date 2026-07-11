import { createContext, useContext } from 'react';
import { useNavigationType } from 'react-router-dom';

const InstantNavigationContext = createContext(false);

export function InstantNavigationProvider({ children }) {
  const navigationType = useNavigationType();
  const instant = navigationType === 'POP';

  return (
    <InstantNavigationContext.Provider value={instant}>
      {children}
    </InstantNavigationContext.Provider>
  );
}

export function useInstantNavigation() {
  return useContext(InstantNavigationContext);
}

/** Framer Motion helper — skip enter animation when returning via back. */
export function useMotionEnter(initial) {
  const instant = useInstantNavigation();
  return instant ? false : initial;
}
