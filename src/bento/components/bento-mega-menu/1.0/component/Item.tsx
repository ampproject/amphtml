import {useLayoutEffect, useMemo, useState} from '#preact';
import useEvent from '#preact/hooks/useEvent';

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
