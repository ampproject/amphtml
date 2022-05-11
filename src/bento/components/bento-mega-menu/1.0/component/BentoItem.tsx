import * as Preact from '#preact';
import {useEffect, useLayoutEffect, useRef} from '#preact';
import {memo} from '#preact/compat/external';
import {EventHandler, FC, RefObject} from '#preact/types';

import {Content} from './Content';
import {ItemProvider, useMegaMenuItem} from './Item';
import {Title} from './Title';

export const BentoItem: FC = ({children}) => {
  return (
    <ItemProvider>
      <SlottedDomWrapper>{children}</SlottedDomWrapper>
    </ItemProvider>
  );
};

const SlottedDomWrapper: FC = ({children: slot}) => {
  const ref = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const contentsRef = useRef<HTMLElement>(null);
  // Capture all the Light DOM elements:
  useLayoutEffect(() => {
    const slot = ref.current!.querySelector('slot');
    const section = slot!.assignedElements()[0];
    const {firstElementChild: header, lastElementChild: contents} = section;
    itemRef.current = section as HTMLElement;
    contentsRef.current = contents as HTMLElement;
    headerRef.current = header as HTMLElement;
  }, []);

  const {isOpen} = useMegaMenuItem();

  return (
    <div ref={ref}>
      {slot}
      <ItemShim elementRef={itemRef} expanded={isOpen} />
      <Title as={HeaderShim} elementRef={headerRef} />
      <Content as={ContentsShim} elementRef={contentsRef} />
    </div>
  );
};

type ShimProps = {elementRef: RefObject<HTMLElement>};
const Shim: FC<ShimProps> = memo(({elementRef, ...props}) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    setAttributes(element, props);
    return () => unsetAttributes(element, props);
  });

  return null;
});
const ItemShim = Shim;
const HeaderShim = Shim;
const ContentsShim = Shim;

type HtmlProps = Record<string, string | boolean | Function>;

function setAttributes(element: HTMLElement, props: HtmlProps) {
  updateAttributes(element, props, false);
}
function unsetAttributes(element: HTMLElement, props: HtmlProps) {
  updateAttributes(element, props, true);
}
function updateAttributes(
  element: HTMLElement,
  props: HtmlProps,
  unset: boolean
) {
  Object.keys(props).forEach((prop) => {
    const value = props[prop];

    if (typeof value === 'boolean' || value === null || value === undefined) {
      if (unset || !value) {
        element.removeAttribute(prop);
      } else {
        element.setAttribute(prop, '');
      }
    } else if (value === 'class' || value === 'className') {
      const classes = value.split(' ');
      if (!unset) {
        element.classList.add(...classes);
      } else {
        element.classList.remove(...classes);
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
        throw new Error(`unexpected event name "${prop}"`);
      }
      if (!unset) {
        element.addEventListener(eventName, value as EventHandler<any>);
      } else {
        element.removeEventListener(eventName, value as EventHandler<any>);
      }
    } else {
      throw new Error(
        `Unexpected prop; cannot set "${prop}" to a "${typeof value}"`
      );
    }
  });
}
