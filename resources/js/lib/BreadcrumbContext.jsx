import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const BreadcrumbContext = createContext({
  currentLabel: null,
  setCurrentLabel: () => {},
});

export function BreadcrumbProvider({ children }) {
  const [currentLabel, setCurrentLabel] = useState(null);
  const value = useMemo(
    () => ({ currentLabel, setCurrentLabel }),
    [currentLabel],
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext);
}

/** Let a page override the last breadcrumb segment (e.g. village name). */
export function useBreadcrumbLabel(label) {
  const { setCurrentLabel } = useBreadcrumbContext();

  useEffect(() => {
    const next = label ? String(label) : null;
    setCurrentLabel(next);
    return () => setCurrentLabel(null);
  }, [label, setCurrentLabel]);
}
