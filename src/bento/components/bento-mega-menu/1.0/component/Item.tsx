import {useMegaMenuContext} from '#bento/components/bento-mega-menu/1.0/component/useMegaMenu';
import {createProviderFromHook} from '#bento/components/bento-mega-menu/1.0/createProviderFromHook';

import {sequentialIdGenerator} from '#core/data-structures/id-generator';

import {useState} from '#preact';

const generateItemId = sequentialIdGenerator();
const [Item, useMegaMenuItem] = createProviderFromHook(
  function useMegaMenuItem({id: propId = ''}) {
    const {actions, openId} = useMegaMenuContext();
    const [genId, setItemId] = useState(generateItemId);
    const id = propId || genId;

    return {
      id,
      isOpen: openId === id,
      actions: {
        overrideItemId: setItemId,
        toggle() {
          if (openId === id) {
            actions.closeMenu();
          } else {
            actions.setOpenId(id);
          }
        },
      },
    };
  }
);
export {Item, useMegaMenuItem};
