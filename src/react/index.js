import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';

// This file allows us to remap react imports from external libraries to
// our internal preact exports. This file uses a default export in order to
// be compatible with libraries that use react default import syntax.

export {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  createElement,
};

export default {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useContext,
  useCallback,
  createContext,
  useImperativeHandle,
  useMemo,
  forwardRef,
  createElement,
};
