import objStr from 'obj-str';

import {useStyles} from '#bento/components/bento-mega-menu/1.0/component.jss';

import * as Preact from '#preact';
import {Children} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {ComponentType} from '#preact/types';
import type {ComponentChildren} from '#preact/types';

import {Content} from './Content';
import {Item} from './Item';
import {Title} from './Title';
import {MegaMenuContext, useMegaMenu} from './useMegaMenu';

export type BentoMegaMenuProps = {
  children?: ComponentChildren;
};

/**
 * @param {!BentoMegaMenu.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoMegaMenu({children, ...rest}: BentoMegaMenuProps) {
  const megaMenu = useMegaMenu();
  const {openId} = megaMenu;

  const isAnyOpen = openId !== null;

  const classes = useStyles();
  return (
    <ContainWrapper {...rest}>
      <MegaMenuContext.Provider value={megaMenu}>
        <nav class={classes.mainNav}>
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
