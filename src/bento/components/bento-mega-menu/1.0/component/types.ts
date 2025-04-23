import {ComponentType, IntrinsicElements} from '#preact/types';

export type AsComponent = ComponentType | keyof IntrinsicElements;
export type AsProps<TAs extends AsComponent> =
  TAs extends keyof IntrinsicElements
    ? {as?: TAs} & IntrinsicElements[TAs]
    : TAs extends ComponentType<infer TProps>
      ? {as?: TAs} & TProps
      : never;

export type AriaAttributes = {
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: 'dialog';
  'aria-modal'?: boolean;
};
