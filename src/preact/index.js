/**
 * Papers over the little differences in API surface between React and Preact.
 * In particular:
 *  - Fragment behaves differently.
 *  - React provides hydrate/render from a separate package, ReactDOM.
 *
 * @fileoverview
 */

// Importing directly from preact/dom is a hack to allow us to mimic the structure of react.

/* eslint-disable */
// @ts-ignore
import * as preactDOM from 'preact/dom';

/** @type {typeof import('preact').hydrate} */
export const hydrate = preactDOM.hydrate;

/** @type {typeof import('preact').render} */
export const render = preactDOM.render;

/* eslint-enable */

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

/**
 * @param {*} props
 * @return {import('preact').ComponentChildren}
 */
export function Fragment(props) {
  return props.children;
}
