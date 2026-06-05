import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'cp_dev_mode_active';
const POSITION_KEY = 'cp_dev_menu_position';

const DeveloperModeContext = createContext({
  isDeveloperModeActive: false,
  isMenuOpen: false,
  menuPosition: { x: 0, y: 0 },
  setMenuPosition: () => {},
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
  const [menuPosition, setMenuPositionState] = useState(() => {
    try {
      const saved = localStorage.getItem(POSITION_KEY);
      return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });

  const setMenuPosition = (pos) => {
    setMenuPositionState(pos);
    try {
      localStorage.setItem(POSITION_KEY, JSON.stringify(pos));
    } catch { /* ignore */ }
  };

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
        menuPosition,
        setMenuPosition,
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