import type {ComponentChildren} from 'preact';
import {JSXInternal} from 'preact/src/jsx';

export type {
  ComponentChildren,
  ComponentChild,
  ComponentProps,
  ComponentType,
  FunctionalComponent,
  Ref,
  RenderableProps,
} from 'preact';

export type HTMLAttributes = JSXInternal.HTMLAttributes;
export type IntrinsicElements = JSXInternal.IntrinsicElements;
export type PropsWithChildren<TProps = {}> = TProps & {
  children?: ComponentChildren;
};
