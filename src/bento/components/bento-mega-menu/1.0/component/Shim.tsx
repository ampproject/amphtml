import {useEffect} from '#preact';
import {memo} from '#preact/compat/external';
import type {EventHandler, HTMLAttributes, RefObject} from '#preact/types';

export type ShimProps<TElement extends HTMLElement> = {
  elementRef: RefObject<TElement>;
} & HTMLAttributes<TElement>;
/**
 * This Shim takes a DOM element,
 * and manually applies the props to it,
 * using setAttribute and addEventListener.
 */
const Shim = memo(
  <TElement extends HTMLElement>({
    elementRef,
    ...props
  }: ShimProps<TElement>) => {
    useEffect(() => {
      const element = elementRef.current;
      if (!element) {
        return;
      }

      setAttributes(element, props);
      return () => unsetAttributes(element, props);
    });

    return null;
  }
);

export {Shim};

/**
 * It doesn't make sense for shadowDom to set lightDom classes, so let's skip that
 */
const ignoreClasses = true;

function setAttributes(element: HTMLElement, props: HTMLAttributes) {
  updateAttributes(element, props, false);
}
function unsetAttributes(element: HTMLElement, props: HTMLAttributes) {
  updateAttributes(element, props, true);
}
function updateAttributes(
  element: HTMLElement,
  props: HTMLAttributes,
  unset: boolean
) {
  Object.keys(props).forEach((prop: keyof typeof props) => {
    const value = props[prop];

    if (typeof value === 'boolean' || value === null || value === undefined) {
      if (unset || !value) {
        element.removeAttribute(prop);
      } else {
        element.setAttribute(prop, '');
      }
    } else if (prop === 'class' || prop === 'className') {
      if (!ignoreClasses) {
        const classes = value.split(' ');
        if (!unset) {
          element.classList.add(...classes);
        } else {
          element.classList.remove(...classes);
        }
      }
    } else if (typeof value === 'string') {
      if (!unset) {
        element.setAttribute(prop, value);
      } else {
        element.removeAttribute(prop);
      }
    } else if (typeof value === 'function') {
      const eventName = prop === 'onClick' ? 'click' : null;
      if (!eventName) {
        throw new Error(
          `Only 'click' events are supported; Unsupported event name "${prop}"`
        );
      }
      const handler = value as EventHandler<any>;
      if (!unset) {
        element.addEventListener(eventName, handler);
      } else {
        element.removeEventListener(eventName, handler);
      }
    } else {
      throw new Error(
        `Unexpected prop; cannot set "${prop}" to a "${typeof value}"`
      );
    }
  });
}
