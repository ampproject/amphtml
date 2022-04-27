import objStr from 'obj-str';

import * as Preact from '#preact';
import {useLayoutEffect} from '#preact';
import {ComponentChildren} from '#preact/types';
import {propName} from '#preact/utils';

import {useMegaMenuItem} from './Item';
import {AsComponent, AsProps} from './types';

import {useStyles} from '../component.jss';

type ContentProps<TAs extends AsComponent> = AsProps<TAs> & {
  children?: ComponentChildren;
  class?: string;
  id?: string;
};

export function Content<TAs extends AsComponent = 'div'>({
  as: Comp = 'div',
  children,
  id: idProp,
  [propName('class')]: className,
  ...rest
}: ContentProps<TAs>) {
  const classes = useStyles();
  const {actions, id, isOpen} = useMegaMenuItem();

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
      id={id}
      {...ariaAttrs}
      {...rest}
      class={objStr({
        [className!]: !!className,
        [classes.content]: true,
        ['open']: isOpen,
      })}
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
