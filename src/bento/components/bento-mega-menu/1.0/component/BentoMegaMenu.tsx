import objStr from 'obj-str';

import * as Preact from '#preact';
import {useImperativeHandle, useRef} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {useClickOutside} from '#preact/hooks/useClickOutside';
import type {ComponentChildren, ComponentType, Ref} from '#preact/types';

import {Content} from './Content';
import {Item} from './Item';
import {Title} from './Title';
import {MegaMenuContext, useMegaMenu} from './useMegaMenu';

import {useStyles} from '../component.jss';

export type BentoMegaMenuProps = {
  children?: ComponentChildren;
  /**
   * Used for Bento web-component mode
   */
  ItemWrapper?: ComponentType;
};

export type BentoMegaMenuApi = ReturnType<typeof useMegaMenu>;

/**
 * @return {PreactDef.Renderable}
 */
function BentoMegaMenuWithRef(
  {ItemWrapper, children, ...rest}: BentoMegaMenuProps,
  ref: Ref<BentoMegaMenuApi>
) {
  const megaMenu = useMegaMenu();

  const isAnyOpen = megaMenu.openId !== null;

  const navRef = useRef<HTMLDivElement>(null);
  useClickOutside(navRef, (ev: MouseEvent) => {
    if (megaMenu.isAnyOpen) {
      megaMenu.actions.closeMenu();

      ev.preventDefault();
      ev.stopPropagation();
    }
  });

  useImperativeHandle(ref, () => megaMenu, [megaMenu]);
  const classes = useStyles();
  return (
    <ContainWrapper {...rest}>
      <MegaMenuContext.Provider value={megaMenu}>
        <nav class={classes.mainNav} ref={navRef}>
          <ul>
            {Children.map(children, (child, index) => {
              if (ItemWrapper) {
                child = <ItemWrapper>{child}</ItemWrapper>;
              }
              return <li key={index}>{child}</li>;
            })}
          </ul>
        </nav>
        <div
          class={objStr({
            [classes.mask]: true,
            'open': isAnyOpen,
          })}
          aria-hidden
        />
      </MegaMenuContext.Provider>
    </ContainWrapper>
  );
}

const BentoMegaMenuFwd = forwardRef(BentoMegaMenuWithRef);
const BentoMegaMenu = Object.assign(BentoMegaMenuFwd, {
  Title,
  Content,
  Item,
});
export {BentoMegaMenu};
