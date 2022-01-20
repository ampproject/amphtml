/**
 * Papers over the little differences in API surface between React and Preact.
 * In particular:
 *  - Fragment behaves differently.
 *  - React provides hydrate/render from a separate package, ReactDOM.
 *
 * @fileoverview
 */

import type {ComponentChildren} from 'preact';

// Importing directly from preact/dom is a hack to allow us to mimic the structure of react.
export {hydrate, render} from 'preact/dom';

export {createElement, cloneElement, createRef, createContext} from 'preact';
export {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useContext,
  useMemo,
  useCallback,
  useImperativeHandle,
} from 'preact/hooks';

export function Fragment(props: any): ComponentChildren {
  return props.children;
}
