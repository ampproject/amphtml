import {ComponentType, IntrinsicElements} from '#preact/types';

export type AsComponent = ComponentType | keyof IntrinsicElements;
export type AsProps<TAs extends AsComponent> = TAs extends ComponentType<
  infer TProps
>
  ? {as?: TAs} & TProps
  : TAs extends keyof IntrinsicElements
  ? {as?: TAs} & IntrinsicElements[TAs]
  : never;
