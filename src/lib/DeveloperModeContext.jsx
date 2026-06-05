import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'cp_dev_mode_active';

const DeveloperModeContext = createContext({
  isDeveloperModeActive: false,
  isMenuOpen: false,
  activateDeveloperMode: () => {},
  deactivateDeveloperMode: () => {},
  openMenu: () => {},
  closeMenu: () => {},
});

export function DeveloperModeProvider({ children }) {
  const [isDeveloperModeActive, setIsDeveloperModeActive] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isDeveloperModeActive ? 'true' : 'false');
    } catch { /* ignore */ }
  }, [isDeveloperModeActive]);

  const activateDeveloperMode = () => {
    setIsDeveloperModeActive(true);
    setIsMenuOpen(true);
  };

  const deactivateDeveloperMode = () => {
    setIsDeveloperModeActive(false);
    setIsMenuOpen(false);
  };

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <DeveloperModeContext.Provider
      value={{
        isDeveloperModeActive,
        isMenuOpen,
        activateDeveloperMode,
        deactivateDeveloperMode,
        openMenu,
        closeMenu,
      }}
    >
      {children}
    </DeveloperModeContext.Provider>
  );
}

export function useDeveloperMode() {
  return useContext(DeveloperModeContext);
}