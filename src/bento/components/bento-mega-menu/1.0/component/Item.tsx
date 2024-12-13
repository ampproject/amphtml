import * as Preact from '#preact';
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from '#preact';
import useEvent from '#preact/hooks/useEvent';
import {FC} from '#preact/types';

import {useMegaMenuContext} from './useMegaMenu';

const MegaMenuItemContext = createContext<ReturnType<
  typeof useMegaMenuItemState
> | null>(null);

export const Item: FC<{id?: string}> = ({children, id = ''}) => {
  const megaMenuItem = useMegaMenuItemState(id);
  return (
    <MegaMenuItemContext.Provider value={megaMenuItem}>
      {children}
    </MegaMenuItemContext.Provider>
  );
};

function useMegaMenuItemState(propId?: string) {
  const megaMenu = useMegaMenuContext();

  const [itemId, overrideItemId] = useState(megaMenu.actions.generateItemId);

  // Sync the itemId:
  useLayoutEffect(() => {
    overrideItemId(propId || megaMenu.actions.generateItemId());
  }, [propId, megaMenu.actions]);

  const toggle = useEvent(() => {
    if (megaMenu.openId === itemId) {
      megaMenu.actions.closeMenu();
    } else {
      megaMenu.actions.setOpenId(itemId);
    }
  });

  const actions = useMemo(
    () => ({
      overrideItemId,
      toggle,
    }),
    [toggle]
  );

  return {
    itemId,
    isOpen: megaMenu.openId === itemId,
    actions,
  };
}

export function useMegaMenuItem() {
  const megaMenuItem = useContext(MegaMenuItemContext);
  if (!megaMenuItem) {
    throw new Error("Missing 'ItemProvider'");
  }
  return megaMenuItem;
}
