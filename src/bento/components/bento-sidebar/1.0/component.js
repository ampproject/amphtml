import objstr from 'obj-str';

import {Keys_Enum} from '#core/constants/key-codes';
import {isRTL} from '#core/dom';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper, useValueRef} from '#preact/component';

import {useStyles} from './component.jss';
import {useSidebarAnimation} from './sidebar-animations-hook';
import {Side} from './sidebar-config';

/**
 * @param {!BentoSidebarDef.Props} props
 * @param {{current: (!BentoSidebarDef.Api|null)}} ref
 * @return {PreactDef.Renderable}
 */
function BentoSidebarWithRef(
  {
    as: Comp = 'div',
    backdropClassName,
    backdropStyle,
    children,
    onAfterClose,
    onAfterOpen,
    onBeforeOpen,
    side: sideProp,
    ...rest
  },
  ref
) {
  // There are two phases to open and close.
  // To open, we mount and render the contents (invisible), then animate the display (visible).
  // To close, it's the reverse.
  // `mounted` mounts the component. `opened` plays the animation.
  const [mounted, setMounted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [side, setSide] = useState(sideProp);

  const classes = useStyles();
  const sidebarRef = useRef();
  const backdropRef = useRef();

  // We are using refs here to refer to common strings, objects, and functions used.
  // This is because they are needed within `useEffect` calls below (but are not depended for triggering)
  // We use `useValueRef` for props that might change (user-controlled)
  const onBeforeOpenRef = useValueRef(onBeforeOpen);

  const open = useCallback(() => {
    onBeforeOpenRef.current?.();
    setMounted(true);
    setOpened(true);
  }, [onBeforeOpenRef]);
  const close = useCallback(() => setOpened(false), []);
  const toggle = useCallback(
    () => (opened ? close() : open()),
    [opened, open, close]
  );

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoSidebarDef.Api} */ ({
        open,
        close,
        toggle,
      }),
    [open, close, toggle]
  );

  useLayoutEffect(() => {
    if (side) {
      return;
    }
    const sidebarElement = sidebarRef.current;
    if (!sidebarElement) {
      return;
    }
    setSide(isRTL(sidebarElement.ownerDocument) ? Side.RIGHT : Side.LEFT);
  }, [side, mounted]);

  useSidebarAnimation(
    mounted,
    opened,
    onAfterOpen,
    onAfterClose,
    side,
    sidebarRef,
    backdropRef,
    setMounted
  );

  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    const backdropElement = backdropRef.current;
    if (!sidebarElement || !backdropElement) {
      return;
    }
    const document = sidebarElement.ownerDocument;
    if (!document) {
      return;
    }
    const keydownCallback = (event) => {
      if (event.key === Keys_Enum.ESCAPE) {
        event.stopImmediatePropagation();
        event.preventDefault();
        close();
      }
    };
    document.addEventListener('keydown', keydownCallback);
    return () => {
      document.removeEventListener('keydown', keydownCallback);
    };
  }, [opened, close]);

  return (
    <div
      class={objstr({
        [classes.mounted]: mounted,
        [classes.unmounted]: !mounted,
      })}
      part="wrapper"
    >
      <ContainWrapper
        as={Comp}
        ref={sidebarRef}
        size={false}
        layout={true}
        paint={true}
        part="sidebar"
        wrapperClassName={objstr({
          [classes.sidebar]: true,
          [classes.defaultSidebarStyles]: true,
          [classes.left]: side === Side.LEFT,
          [classes.right]: side !== Side.LEFT,
        })}
        role="menu"
        tabindex="-1"
        hidden={!side}
        {...rest}
      >
        {children}
      </ContainWrapper>
      <div
        ref={backdropRef}
        onClick={() => close()}
        part="backdrop"
        style={backdropStyle}
        class={objstr({
          [classes.backdrop]: true,
          [classes.defaultBackdropStyles]: true,
          [backdropClassName]: backdropClassName,
        })}
        hidden={!side}
      >
        <div class={classes.backdropOverscrollBlocker}></div>
      </div>
    </div>
  );
}

const BentoSidebar = forwardRef(BentoSidebarWithRef);
BentoSidebar.displayName = 'BentoSidebar'; // Make findable for tests.
export {BentoSidebar};
