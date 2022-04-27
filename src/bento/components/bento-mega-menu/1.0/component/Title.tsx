import objStr from 'obj-str';

import * as Preact from '#preact';
import type {ComponentChildren} from '#preact/types';
import {propName} from '#preact/utils';

import {useMegaMenuItem} from './Item';
import {AriaAttributes, AsComponent, AsProps} from './types';

import {useStyles} from '../component.jss';

type TitleProps<TAs extends AsComponent> = AsProps<TAs> & {
  children?: ComponentChildren;
  class?: string;
};

export function Title<TAs extends AsComponent = 'span'>({
  as: Comp = 'span',
  children,
  [propName('class')]: className,
  ...props
}: TitleProps<TAs>) {
  const classes = useStyles();
  const {actions, isOpen, itemId} = useMegaMenuItem();

  const ariaAttrs: AriaAttributes = {
    'aria-controls': itemId,
    'aria-expanded': isOpen,
    'aria-haspopup': 'dialog',
  };

  return (
    <>
      <Comp
        role="button"
        {...ariaAttrs}
        {...props}
        class={objStr({
          [className!]: !!className,
          [classes.item]: true,
          ['open']: isOpen,
        })}
        onClick={(ev: MouseEvent) => {
          (props as any).onClick?.(ev);
          if (!ev.defaultPrevented) {
            actions.toggle();
          }
        }}
      >
        {children}
      </Comp>
    </>
  );
}
