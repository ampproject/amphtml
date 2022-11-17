import objStr from 'obj-str';

import * as Preact from '#preact';
import useEvent from '#preact/hooks/useEvent';
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
  as: As = 'span',
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

  const handleClick = useEvent((ev: MouseEvent) => {
    (props as any).onClick?.(ev);
    if (!ev.defaultPrevented) {
      actions.toggle();
    }
  });

  return (
    <>
      <As
        role="button"
        {...ariaAttrs}
        {...props}
        class={objStr({
          [className!]: !!className,
          [classes.title]: true,
          ['open']: isOpen,
        })}
        onClick={handleClick}
      >
        {children}
      </As>
    </>
  );
}
