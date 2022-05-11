import type {ComponentChildren, FunctionalComponent} from 'preact';
import {JSXInternal} from 'preact/src/jsx';

export type {
  ComponentChildren,
  ComponentChild,
  ComponentProps,
  ComponentType,
  FunctionalComponent,
  Ref,
  RefObject,
  RenderableProps,
} from 'preact';

export type FC<P = {}> = FunctionalComponent<P>;

export type EventHandler<E extends JSXInternal.TargetedEvent> =
  JSXInternal.EventHandler<E>;
export type HTMLAttributes = JSXInternal.HTMLAttributes;
export type IntrinsicElements = JSXInternal.IntrinsicElements;
export type PropsWithChildren<TProps = {}> = TProps & {
  children?: ComponentChildren;
};
