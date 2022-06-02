import objStr from 'obj-str';

import * as Preact from '#preact';
import {useLayoutEffect} from '#preact';
import {ComponentChildren} from '#preact/types';
import {propName} from '#preact/utils';

import {useMegaMenuItem} from './Item';
import {AriaAttributes, AsComponent, AsProps} from './types';

import {useStyles} from '../component.jss';

type ContentProps<TAs extends AsComponent> = AsProps<TAs> & {
  children?: ComponentChildren;
  class?: string;
  id?: string;
};

export function Content<TAs extends AsComponent = 'div'>({
  as: As = 'div',
  children,
  id: idProp,
  [propName('class')]: className,
  ...rest
}: ContentProps<TAs>) {
  const classes = useStyles();
  const {actions, isOpen, itemId} = useMegaMenuItem();

  // If this ID is set, pass it to the parent:
  useLayoutEffect(() => {
    if (idProp) {
      actions.overrideItemId(idProp);
    }
  }, [actions, idProp]);

  const ariaAttrs: AriaAttributes = {
    'aria-modal': isOpen,
  };

  return (
    <As
      role="dialog"
      id={itemId}
      {...ariaAttrs}
      {...rest}
      class={objStr({
        [className!]: !!className,
        [classes.content]: true,
        ['open']: isOpen,
      })}
    >
      {children}
    </As>
  );
}
