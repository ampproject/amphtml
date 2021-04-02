/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '../../../src/preact';
import {ContainWrapper, useValueRef} from '../../../src/preact/component';
import {Keys} from '../../../src/utils/key-codes';
import {Side} from './sidebar-config';
import {createPortal, forwardRef} from '../../../src/preact/compat';
import {isRTL} from '../../../src/dom';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {useSidebarAnimation} from './sidebar-animations-hook';
import {useStyles} from './component.jss';
import objstr from 'obj-str';

/**
 * @param {!SidebarDef.SidebarProps} props
 * @param {{current: (!SidebarDef.SidebarApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function SidebarWithRef(
  {
    as: Comp = 'div',
    side: sideProp,
    onBeforeOpen,
    onAfterOpen,
    onAfterClose,
    backdropStyle,
    backdropClassName,
    children,
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
  const toggle = useCallback(() => (opened ? close() : open()), [
    opened,
    open,
    close,
  ]);

  useImperativeHandle(
    ref,
    () =>
      /** @type {!SidebarDef.SidebarApi} */ ({
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
      if (event.key === Keys.ESCAPE) {
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
    <div className={objstr({[classes.unmounted]: !mounted})} part="wrapper">
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
        className={objstr({
          [classes.backdrop]: true,
          [classes.defaultBackdropStyles]: true,
          [backdropClassName]: backdropClassName,
        })}
        hidden={!side}
      >
        <div className={classes.backdropOverscrollBlocker}></div>
      </div>
    </div>
  );
}

const Sidebar = forwardRef(SidebarWithRef);
Sidebar.displayName = 'Sidebar'; // Make findable for tests.
export {Sidebar};

/**
 * @param {!SidebarDef.SidebarToolbarProps} props
 * @return {PreactDef.Renderable}
 */
export function SidebarToolbar({
  toolbar: mediaQueryProp,
  toolbarTarget,
  children,
  ...rest
}) {
  const ref = useRef();
  const [matches, setMatches] = useState(false);
  const [targetEl, setTargetEl] = useState(null);

  useEffect(() => {
    const window = ref.current?.ownerDocument?.defaultView;
    if (!window) {
      return;
    }

    const mediaQueryList = window.matchMedia(mediaQueryProp);
    const updateMatches = () => setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', updateMatches);
    setMatches(mediaQueryList.matches);
    return () => mediaQueryList.removeEventListener('change', updateMatches);
  }, [mediaQueryProp]);

  useEffect(() => {
    const document = ref.current?.ownerDocument;
    if (!document) {
      return;
    }

    const selector = `#${CSS.escape(toolbarTarget)}`;
    const newTargetEl = document.querySelector(selector);
    setTargetEl(newTargetEl);
  }, [toolbarTarget]);

  return (
    <>
      <nav
        ref={ref}
        toolbar={mediaQueryProp}
        toolbar-target={toolbarTarget}
        {...rest}
      >
        {children}
      </nav>
      {matches && targetEl && createPortal(children, targetEl)}
    </>
  );
}
