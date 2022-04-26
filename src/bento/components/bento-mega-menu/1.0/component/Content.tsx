import objStr from 'obj-str';

import * as Preact from '#preact';
import {useLayoutEffect} from '#preact';
import {
  ComponentChildren,
  ComponentType,
  IntrinsicElements,
} from '#preact/types';

import {useMegaMenuItem} from './Item';
import {AsProps} from './types';

import {useStyles} from '../component.jss';

type ContentProps<TAs extends ComponentType | keyof IntrinsicElements> = {
  children?: ComponentChildren;
  class?: string;
  id?: string;
} & AsProps<TAs>;

export function Content<TAs extends ComponentType | keyof IntrinsicElements>({
  as: Comp = 'div',
  children,
  id: idProp,
}: ContentProps<TAs>) {
  const classes = useStyles();
  const {actions, isOpen} = useMegaMenuItem();

  // If this ID is set, pass it to the parent:
  useLayoutEffect(() => {
    if (idProp) {
      actions.overrideItemId(idProp);
    }
  }, [actions, idProp]);

  const ariaAttrs: Partial<AriaAttributes> = isOpen
    ? {
        'aria-expanded': true,
        'aria-modal': true,
      }
    : {};

  return (
    <Comp
      role="dialog"
      class={objStr({
        [classes.content]: true,
        ['open']: isOpen,
      })}
      {...ariaAttrs}
    >
      {children}
    </Comp>
  );
}

type AriaAttributes = {
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-haspopup': 'dialog';
  'aria-modal': boolean;
};
