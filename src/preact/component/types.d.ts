import * as Preact from 'preact';
import {ComponentChildren, FunctionComponent, Ref, VNode} from 'preact';

import {ReadyState_Enum} from '#core/constants/ready-state';

// TODO: figure out the proper type for all of the 'as' types.

export interface WrapperComponentProps {
  style: Preact.JSX.CSSProperties;
  class: string;
  as: FunctionComponent | any;
  wrapperClassName?: string | null;
  wrapperStyle?: Object | null;
  children?: ComponentChildren;
}

/**
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/contain
 */
export interface ContainerWrapperComponentProps {
  as?: FunctionComponent | any;
  contentAs?: string | FunctionComponent;
  contentProps?: any;
  style?: Preact.JSX.CSSProperties;
  size?: boolean;
  layout?: boolean;
  paint?: boolean;
  wrapperClassName?: string | null;
  wrapperStyle?: Object | null;
  contentRef?: null | Ref<any>;
  contentClassName?: string | null;
  contentStyle?: Object | null;
  children?: ComponentChildren | null;
  class?: string | null;
}

export type RendererFunction = (obj: JsonObject) => VNode | Promise<VNode>;

export interface IframeEmbedProps {
  allow?: string;
  allowFullScreen?: boolean;
  loading?: string;
  messageHandler: (ref: MessageEvent) => void;
  matchesMessagingOrigin: (a: any) => boolean;
  name?: string;
  onReadyState: (str: string) => void | undefined;
  ready?: boolean;
  sandbox?: string;
  src?: string;
  title?: string;
  excludeSandbox?: boolean;
  options?: any;
  type?: any;
  iframeStyle: Preact.JSX.CSSProperties;
  contentRef?: Ref<any>;
}

export interface IframeEmbedApi {
  readyState: ReadyState_Enum;
}
