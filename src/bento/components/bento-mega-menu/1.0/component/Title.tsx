import objStr from 'obj-str';

import * as Preact from '#preact';
import {
  ComponentChildren,
  ComponentType,
  IntrinsicElements,
} from '#preact/types';
import {propName} from '#preact/utils';

import {useMegaMenuItem} from './Item';
import {AsProps} from './types';

import {useStyles} from '../component.jss';

type TitleProps<TAs extends ComponentType | keyof IntrinsicElements> = {
  children?: ComponentChildren;
  class?: string;
} & AsProps<TAs>;

export function Title<TAs extends ComponentType | keyof IntrinsicElements>({
  as: Comp = 'span',
  children,
  [propName('class')]: className,
  ...props
}: TitleProps<TAs>) {
  const classes = useStyles();
  const {actions, isOpen} = useMegaMenuItem();

  return (
    <>
      <Comp
        role="button"
        {...props}
        class={objStr({
          [className!]: !!className,
          [classes.item]: true,
          ['open']: isOpen,
        })}
        onClick={(ev: MouseEvent) => {
          actions.toggle();
          (props as any).onClick?.(ev);
        }}
      >
        {children}
      </Comp>
    </>
  );
}
