import {
  randomIdGenerator,
  sequentialIdGenerator,
} from '#core/data-structures/id-generator';

import {createContext, useContext, useMemo, useState} from '#preact';

const MegaMenuContext = createContext<ReturnType<typeof useMegaMenu> | null>(
  null
);
export {MegaMenuContext};

const generateMenuId = randomIdGenerator(10_000);
const generateItemId = sequentialIdGenerator();

export function useMegaMenu() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuId] = useState(generateMenuId);
  const actions = useMemo(
    () => ({
      setOpenId,
      closeMenu() {
        setOpenId(null);
      },
      generateItemId() {
        return `bento_mega_menu-${menuId}-item-${generateItemId()}`;
      },
    }),
    [menuId /* (immutable) */]
  );
  return {
    openId,
    isAnyOpen: openId !== null,
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
