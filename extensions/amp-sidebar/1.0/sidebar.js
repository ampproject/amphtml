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
import {ContainWrapper} from '../../../src/preact/component';
import {assertDoesNotContainDisplay, setStyles} from '../../../src/style';
import {forwardRef} from '../../../src/preact/compat';
import {isRTL} from '../../../src/dom';
import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './sidebar.jss';

/** @private @enum {string} */
const Side = {
  LEFT: 'left',
  RIGHT: 'right',
};

const ANIMATION_DURATION = 350;
const ANIMATION_EASE_IN = 'cubic-bezier(0,0,.21,1)';

const ANIMATION_KEYFRAMES_FADE_IN = [{'opacity': '0'}, {'opacity': '1'}];
const ANIMATION_KEYFRAMES_SLIDE_IN_LEFT = [
  {'transform': 'translateX(-100%)'},
  {'transform': 'translateX(0)'},
];
const ANIMATION_KEYFRAMES_SLIDE_IN_RIGHT = [
  {'transform': 'translateX(100%)'},
  {'transform': 'translateX(0)'},
];

const ANIMATION_STYLES_SIDEBAR_LEFT_INIT = {'transform': 'translateX(-100%)'};
const ANIMATION_STYLES_SIDEBAR_RIGHT_INIT = {'transform': 'translateX(100%)'};
const ANIMATION_STYLES_BACKDROP_INIT = {'opacity': '0'};
const ANIMATION_STYLES_SIDEBAR_FINAL = {'transform': ''};
const ANIMATION_STYLES_BACKDROP_FINAL = {'opacity': ''};

/**
 * @param {T} current
 * @return {{current: T}}
 * @template T
 */
function useValueRef(current) {
  const valueRef = useRef(null);
  valueRef.current = current;
  return valueRef;
}
/**
 * @param {!Element} element
 * @param {!Object<string, *>} styles
 */
function safelySetStyles(element, styles) {
  setStyles(element, assertDoesNotContainDisplay(styles));
}

/**
 * @param {!SidebarDef.Props} props
 * @param {{current: (!SidebarDef.SidebarApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function SidebarWithRef(
  {
    as: Comp = 'div',
    side: sideProp,
    onBeforeOpen,
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
  const onAfterCloseRef = useValueRef(onAfterClose);

  const open = useCallback(() => {
    if (onBeforeOpenRef.current) {
      onBeforeOpenRef.current();
    }
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

  useLayoutEffect(() => {
    const sidebarElement = sidebarRef.current;
    const backdropElement = backdropRef.current;
    if (!sidebarElement || !backdropElement) {
      return;
    }

    if (!side) {
      return;
    }

    let sidebarAnimation;
    let backdropAnimation;
    // "Make Visible" Animation
    if (opened) {
      const postVisibleAnim = () => {
        safelySetStyles(sidebarElement, ANIMATION_STYLES_SIDEBAR_FINAL);
        safelySetStyles(backdropElement, ANIMATION_STYLES_BACKDROP_FINAL);
      };
      if (!sidebarElement.animate || !backdropElement.animate) {
        postVisibleAnim();
        return;
      }

      safelySetStyles(
        sidebarElement,
        side === Side.LEFT
          ? ANIMATION_STYLES_SIDEBAR_LEFT_INIT
          : ANIMATION_STYLES_SIDEBAR_RIGHT_INIT
      );
      safelySetStyles(backdropElement, ANIMATION_STYLES_BACKDROP_INIT);
      sidebarAnimation = sidebarElement.animate(
        side === Side.LEFT
          ? ANIMATION_KEYFRAMES_SLIDE_IN_LEFT
          : ANIMATION_KEYFRAMES_SLIDE_IN_RIGHT,
        {
          duration: ANIMATION_DURATION,
          fill: 'both',
          easing: ANIMATION_EASE_IN,
        }
      );
      sidebarAnimation.onfinish = postVisibleAnim;
      backdropAnimation = backdropElement.animate(ANIMATION_KEYFRAMES_FADE_IN, {
        duration: ANIMATION_DURATION,
        fill: 'both',
        easing: ANIMATION_EASE_IN,
      });
    } else {
      // "Make Invisible" Animation
      const postInvisibleAnim = () => {
        if (onAfterCloseRef.current) {
          onAfterCloseRef.current();
        }
        sidebarAnimation = null;
        backdropAnimation = null;
        setMounted(false);
      };
      if (!sidebarElement.animate || !backdropElement.animate) {
        postInvisibleAnim();
        return;
      }
      sidebarAnimation = sidebarElement.animate(
        side === Side.LEFT
          ? ANIMATION_KEYFRAMES_SLIDE_IN_LEFT
          : ANIMATION_KEYFRAMES_SLIDE_IN_RIGHT,
        {
          duration: ANIMATION_DURATION,
          direction: 'reverse',
          fill: 'both',
          easing: ANIMATION_EASE_IN,
        }
      );
      sidebarAnimation.onfinish = postInvisibleAnim;
      backdropAnimation = backdropElement.animate(ANIMATION_KEYFRAMES_FADE_IN, {
        duration: ANIMATION_DURATION,
        direction: 'reverse',
        fill: 'both',
        easing: ANIMATION_EASE_IN,
      });
    }
    return () => {
      if (sidebarAnimation) {
        sidebarAnimation.cancel();
      }
      if (backdropAnimation) {
        backdropAnimation.cancel();
      }
    };
  }, [opened, onAfterCloseRef, side]);

  return (
    mounted && (
      <>
        <ContainWrapper
          as={Comp}
          ref={sidebarRef}
          size={false}
          layout={true}
          paint={true}
          part="sidebar"
          wrapperClassName={`${classes.sidebarClass} ${
            classes.defaultSidebarStyles
          } ${side === Side.LEFT ? classes.left : classes.right}`}
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
          className={`${backdropClassName ?? ''} ${classes.backdropClass} ${
            classes.defaultBackdropStyles
          }`}
          hidden={!side}
        ></div>
      </>
    )
  );
}

const Sidebar = forwardRef(SidebarWithRef);
Sidebar.displayName = 'Sidebar'; // Make findable for tests.
export {Sidebar};
