import {NodeProto, TreeProto} from '@ampproject/bento-compiler';

/**
 * AMP Components must implement this "buildDom" function in order to be server-rendered.
 *
 * - It must perform all of the DOM manipulations necessary to render a component.
 *   Note: this is a subset of the responsibilities of buildCallback.
 * - It must not perform any side effects, such as adding event listeners or assigning instance variables.
 * - It must not perform any of the operations involved with layoutCallback (loading).
 *
 * The return value is set to *, so that we may optionally return any DOM nodes
 * created during a client-side render. These nodes are often needed for ivars.
 */
export type BuildDom = (el: Element) => void;

/**
 * Contains component versioning data via a map from tagName --> version.
 */
export type Versions = Array<{component: string; version: string}>;

export type CompilerRequest = {
  document?: TreeProto;
  nodes?: NodeProto[];
  component_versions: Versions;
};

export type CompilerResponse = {document: TreeProto} | {nodes: NodeProto[]};

export type BuilderMap = {[tagName: string]: BuildDom};
