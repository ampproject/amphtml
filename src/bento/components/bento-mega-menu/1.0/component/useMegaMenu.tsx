import {createContext, useContext, useMemo, useState} from '#preact';

const MegaMenuContext = createContext<ReturnType<typeof useMegaMenu> | null>(
  null
);
export {MegaMenuContext};

export function useMegaMenu() {
  const [openId, setOpenId] = useState<string | null>(null);
  const actions = useMemo(
    () => ({
      closeMenu() {
        setOpenId(null);
      },
      setOpenId,
    }),
    []
  );
  return {
    openId,
    actions,
  };
}

export function useMegaMenuContext() {
  const megaMenu = useContext(MegaMenuContext);
  if (!megaMenu) {
    throw new Error(`Missing Provider`);
  }
  return megaMenu;
}
