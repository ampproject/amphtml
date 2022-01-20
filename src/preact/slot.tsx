import type {FunctionComponent, RefObject, VNode} from 'preact';

import {devAssert} from '#core/assert';
import {Loading_Enum} from '#core/constants/loading-instructions';
import {rediscoverChildren, removeProp, setProp} from '#core/context';
import {
  loadAll,
  pauseAll,
  unmountAll,
} from '#core/dom/resource-container-helper';
import {isElement} from '#core/types';
import {objectsEqualShallow} from '#core/types/object';

import * as Preact from '#preact';
import {useEffect, useLayoutEffect, useRef} from '#preact';

import {useAmpContext} from './context';
import {CanPlay, CanRender, LoadingProp} from './contextprops';

const EMPTY = {};

const cache: WeakMap<
  Element,
  {oldProps: Object | undefined; component: FunctionComponent}
> = new WeakMap();

export function createSlot(
  element: Element,
  name: string,
  defaultProps?: Object,
  as: boolean = false
): VNode | FunctionComponent {
  element.setAttribute('slot', name);
  if (!as) {
    return <Slot {...(defaultProps || EMPTY)} name={name} />;
  }

  const cached = cache.get(element);
  if (cached && objectsEqualShallow(cached.oldProps, defaultProps)) {
    return cached.component;
  }

  function SlotWithProps(props?: Object): VNode {
    return <Slot {...(defaultProps || EMPTY)} name={name} {...props} />;
  }
  cache.set(element, {oldProps: defaultProps, component: SlotWithProps});

  return SlotWithProps;
}

/**
 * Slot component.
 */
export function Slot(props: JsonObject): VNode {
  const ref: RefObject<HTMLSlotElement> = useRef(null);

  useSlotContext(ref, props);

  useEffect(() => {
    // Post-rendering cleanup, if any.
    if (props['postRender']) {
      props['postRender']();
    }
  });

  return <slot {...props} ref={ref} />;
}

export function useSlotContext(
  ref: RefObject<HTMLSlotElement>,
  opt_props?: JsonObject
) {
  const loading = opt_props?.loading;
  const context = useAmpContext();

  // Context changes.
  useLayoutEffect(() => {
    const slot = ref.current;
    devAssert(isElement(slot), 'Element expected');

    setProp(slot, CanRender, Slot, context.renderable);
    setProp(slot, CanPlay, Slot, context.playable);
    setProp(slot, LoadingProp, Slot, context.loading);

    if (!context.playable) {
      execute(slot, pauseAll, true);
    }

    return () => {
      removeProp(slot, CanRender, Slot);
      removeProp(slot, CanPlay, Slot);
      removeProp(slot, LoadingProp, Slot);
      rediscoverChildren(slot);
    };
  }, [ref, context]);

  // Mount and unmount. Keep it at the bottom because it's much better to
  // execute `pause` before `unmount` in this case.
  // This has to be a layout-effect to capture the old `Slot.assignedElements`
  // before the browser undistributes them.
  useLayoutEffect(() => {
    const slot = ref.current;
    devAssert(isElement(slot), 'Element expected');

    // Mount children, unless lazy loading requested. If so the element should
    // use `BaseElement.setAsContainer`.
    if (loading != Loading_Enum.LAZY) {
      // TODO(#31915): switch to `mount`.
      execute(slot, loadAll, true);
    }

    return () => {
      execute(slot, unmountAll, false);
    };
  }, [ref, loading]);
}

function execute(
  slot: HTMLSlotElement,
  action: (e: Element | Element[]) => void,
  schedule: boolean
) {
  const assignedElements = slot.assignedElements
    ? slot.assignedElements()
    : slot;
  if (Array.isArray(assignedElements) && assignedElements.length == 0) {
    return;
  }

  if (!schedule) {
    action(assignedElements);
    return;
  }

  const win = slot.ownerDocument.defaultView;
  if (!win) {
    return;
  }

  const scheduler = win.requestIdleCallback || win.setTimeout;
  scheduler(() => action(assignedElements));
}
