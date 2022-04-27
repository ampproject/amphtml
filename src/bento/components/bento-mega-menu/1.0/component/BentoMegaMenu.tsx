import objStr from 'obj-str';

import * as Preact from '#preact';
import {useRef} from '#preact';
import {Children} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import type {ComponentChildren} from '#preact/types';

import {Content} from './Content';
import {Item} from './Item';
import {Title} from './Title';
import {useClickOutside} from './useClickOutside';
import {MegaMenuContext, useMegaMenu} from './useMegaMenu';

import {useStyles} from '../component.jss';

export type BentoMegaMenuProps = {
  children?: ComponentChildren;
};

/**
 * @param {!BentoMegaMenu.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoMegaMenu({children, ...rest}: BentoMegaMenuProps) {
  const megaMenu = useMegaMenu();

  const isAnyOpen = megaMenu.openId !== null;

  const navRef = useRef<HTMLDivElement>(null);
  useClickOutside(navRef, () => {
    megaMenu.actions.closeMenu();
  });

  const classes = useStyles();
  return (
    <ContainWrapper {...rest}>
      <MegaMenuContext.Provider value={megaMenu}>
        <nav class={classes.mainNav} ref={navRef}>
          <ul>
            {Children.map(children, (child, index) => {
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

BentoMegaMenu.Title = Title;
BentoMegaMenu.Content = Content;
BentoMegaMenu.Item = Item;
