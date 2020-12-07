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
import {forwardRef} from '../../../src/preact/compat';
import {setStyle} from '../../../src/style';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './sidebar.jss';

const ANIMATION_DURATION = 350;
const ANIMATION_PRESETS = {
  fadeIn: [{opacity: 0}, {opacity: 1}],
  slideInLeft: [{transform: 'translateX(-100%)'}, {transform: 'translateX(0)'}],
  slideInRight: [{transform: 'translateX(100%)'}, {transform: 'translateX(0)'}],
};

const ANIMATION_EASE_IN = 'cubic-bezier(0,0,.21,1)';

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
 * @param {!AccordionDef.Props} props //TODO: will update
 * @param ref
 * @return {PreactDef.Renderable}
 */
function SidebarWithRef(
  {
    as: Comp = 'div',
    side = 'left',
    onBeforeOpen,
    onAfterClose,
    children,
    ...rest
  },
  ref
) {
  // There are two phases to open and close.
  // To open, we mount and render the contents (invisible), then animate the display (visible).
  // To close, it's the reverse.
  // `mounted` mounts the component. `opened` plays the animation.
  const initialOpen = false;
  const [mounted, setMounted] = useState(initialOpen);
  const [opened, setOpened] = useState(initialOpen);
  const classes = useStyles();
  const sidebarRef = useRef();
  const maskRef = useRef();

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
    () => ({
      open,
      close,
      toggle,
    }),
    [open, close, toggle]
  );

  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    const maskElement = maskRef.current;
    if (sidebarElement == undefined || maskElement == undefined) {
      return;
    }

    let sidebarAnimation;
    let maskAnimation;
    // "Make Visible" Animation
    if (opened) {
      const postVisibleAnim = () => {
        setStyle(sidebarElement, 'transform', 'translateX(0)');
        setStyle(maskElement, 'opacity', 1);
        sidebarElement./*REVIEW*/ focus();
      };
      if (!sidebarElement.animate || !maskElement.animate) {
        postVisibleAnim();
        return;
      }
      sidebarAnimation = sidebarElement.animate(
        ANIMATION_PRESETS[side === 'left' ? 'slideInLeft' : 'slideInRight'],
        {
          duration: ANIMATION_DURATION,
          fill: 'both',
          easing: ANIMATION_EASE_IN,
        }
      );
      sidebarAnimation.onfinish = postVisibleAnim;
      maskAnimation = maskElement.animate(ANIMATION_PRESETS.fadeIn, {
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
        maskAnimation = null;
        setMounted(false);
      };
      if (!sidebarElement.animate || !maskElement.animate) {
        postInvisibleAnim();
        return;
      }
      sidebarAnimation = sidebarElement.animate(
        ANIMATION_PRESETS[side === 'left' ? 'slideInLeft' : 'slideInRight'],
        {
          duration: ANIMATION_DURATION,
          direction: 'reverse',
          fill: 'both',
          easing: ANIMATION_EASE_IN,
        }
      );
      sidebarAnimation.onfinish = postInvisibleAnim;
      maskAnimation = maskElement.animate(ANIMATION_PRESETS.fadeIn, {
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
      if (maskAnimation) {
        maskAnimation.cancel();
      }
    };
  }, [opened, onAfterCloseRef, side]);

  return (
    mounted && (
      <>
        <ContainWrapper
          as={Comp}
          ref={(r) => {
            sidebarRef.current = r;
          }}
          size={false}
          layout={true}
          paint={true}
          className={`${classes.baseClass} ${
            side === 'left' ? classes.left : classes.right
          }`}
          role="menu"
          tabindex="-1"
          {...rest}
        >
          {children}
        </ContainWrapper>
        <div
          ref={(r) => {
            maskRef.current = r;
          }}
          onClick={() => close()}
          className={`${classes.maskClass}`}
        ></div>
      </>
    )
  );
}

const Sidebar = forwardRef(SidebarWithRef);
Sidebar.displayName = 'Sidebar'; // Make findable for tests.
export {Sidebar};
