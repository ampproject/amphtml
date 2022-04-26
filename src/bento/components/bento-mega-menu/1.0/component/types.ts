import {ComponentType, IntrinsicElements} from '#preact/types';

export type AsProps<TAs extends ComponentType | keyof IntrinsicElements> =
  TAs extends ComponentType<infer TProps>
    ? {as: TAs} & TProps
    : TAs extends keyof IntrinsicElements
    ? {as: TAs} & IntrinsicElements[TAs]
    : never;
