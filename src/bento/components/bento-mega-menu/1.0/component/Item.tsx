import {useLayoutEffect, useMemo, useRef, useState} from '#preact';

import {useMegaMenuContext} from './useMegaMenu';

import {createProviderFromHook} from '../createProviderFromHook';

const [Item, useMegaMenuItem] = createProviderFromHook(
  function useMegaMenuItem({id: propId = ''}) {
    const megaMenu = useMegaMenuContext();

    const [itemId, overrideItemId] = useState(megaMenu.actions.generateItemId);

    // Sync the itemId:
    useLayoutEffect(() => {
      overrideItemId(propId || megaMenu.actions.generateItemId());
    }, [propId, megaMenu.actions]);

    const megaMenuRefObj = {megaMenu, itemId};
    const megaMenuRef = useRef(megaMenuRefObj);
    megaMenuRef.current = megaMenuRefObj;

    const actions = useMemo(
      () => ({
        overrideItemId,
        toggle() {
          const {itemId, megaMenu} = megaMenuRef.current;
          if (megaMenu.openId === itemId) {
            megaMenu.actions.closeMenu();
          } else {
            megaMenu.actions.setOpenId(itemId);
          }
        },
      }),
      []
    );

    return {
      itemId,
      isOpen: megaMenu.openId === itemId,
      actions,
    };
  }
);
export {Item, useMegaMenuItem};
