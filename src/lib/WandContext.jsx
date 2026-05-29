import { createContext, useContext, useState, useEffect } from 'react';

const WandContext = createContext({ wandActive: false, setWandActive: () => {} });

export function WandProvider({ children }) {
  const [wandActive, setWandActive] = useState(false);

  // Apply a wand cursor to the whole document while active
  useEffect(() => {
    if (wandActive) {
      document.body.classList.add('wand-cursor');
    } else {
      document.body.classList.remove('wand-cursor');
    }
    return () => document.body.classList.remove('wand-cursor');
  }, [wandActive]);

  return (
    <WandContext.Provider value={{ wandActive, setWandActive }}>
      {children}
    </WandContext.Provider>
  );
}

export function useWand() {
  return useContext(WandContext);
}