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
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './lightbox.jss';

const ANIMATION_DURATION = 200;
const ANIMATION_PRESETS = {
  'fade-in': [
    {opacity: 0, visibility: 'visible'},
    {opacity: 1, visibility: 'visible'},
  ],
  'fly-in-top': [
    {opacity: 0, transform: 'translate(0,-100%)', visibility: 'visible'},
    {opacity: 1, transform: 'translate(0, 0)', visibility: 'visible'},
  ],
  'fly-in-bottom': [
    {opacity: 0, transform: 'translate(0, 100%)', visibility: 'visible'},
    {opacity: 1, transform: 'translate(0, 0)', visibility: 'visible'},
  ],
};

const DEFAULT_CLOSE_LABEL = 'Close the modal';

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
 * @param {!LightboxDef.Props} props
 * @param {{current: (!LightboxDef.LightboxApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function LightboxWithRef(
  {
    animateIn = 'fade-in',
    closeButtonAriaLabel = DEFAULT_CLOSE_LABEL,
    children,
    onBeforeOpen,
    onAfterClose,
    enableAnimation,
    ...rest
  },
  ref
) {
  // There are two phases to open and close.
  // To open, we mount and render the contents (invisible), then animate the display (visible).
  // To close, it's the reverse.
  // `mounted` mounts the component. `visible` plays the animation.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const classes = useStyles();
  const lightboxRef = useRef();

  // We are using refs here to refer to common strings, objects, and functions used.
  // This is because they are needed within `useEffect` calls below (but are not depended for triggering)
  // We use `useValueRef` for props that might change (user-controlled)
  const animateInRef = useValueRef(animateIn);
  const onBeforeOpenRef = useValueRef(onBeforeOpen);
  const onAfterCloseRef = useValueRef(onAfterClose);
  const enableAnimationRef = useValueRef(enableAnimation);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        if (onBeforeOpenRef.current) {
          onBeforeOpenRef.current();
        }
        setMounted(true);
        setVisible(true);
      },
      close: () => {
        setVisible(false);
      },
    }),
    [onBeforeOpenRef]
  );

  useLayoutEffect(() => {
    const element = lightboxRef.current;
    if (!element) {
      return;
    }
    let animation;
    // Set pre-animation visibility state, to be flipped post-animation.
    setStyle(element, 'visibility', visible ? 'hidden' : 'visible');

    // "Make Visible" Animation
    if (visible) {
      const postVisibleAnim = () => {
        setStyle(element, 'opacity', 1);
        setStyle(element, 'visibility', 'visible');
        element./*REVIEW*/ focus();
      };
      if (!element.animate || !enableAnimationRef.current) {
        postVisibleAnim();
        return;
      }
      animation = element.animate(ANIMATION_PRESETS[animateInRef.current], {
        duration: ANIMATION_DURATION,
        fill: 'both',
        easing: 'ease-in',
      });
      animation.onfinish = postVisibleAnim;
    } else {
      // "Make Invisible" Animation
      const postInvisibleAnim = () => {
        setStyle(element, 'opacity', 0);
        setStyle(element, 'visibility', 'hidden');
        if (onAfterCloseRef.current) {
          onAfterCloseRef.current();
        }
        animation = null;
        setMounted(false);
      };
      if (!element.animate || !enableAnimationRef.current) {
        postInvisibleAnim();
        return;
      }
      animation = element.animate(ANIMATION_PRESETS[animateInRef.current], {
        duration: ANIMATION_DURATION,
        direction: 'reverse',
        fill: 'both',
        easing: 'ease-in',
      });
      animation.onfinish = postInvisibleAnim;
    }
    return () => {
      if (animation) {
        animation.cancel();
      }
    };
  }, [visible, animateInRef, enableAnimationRef, onAfterCloseRef]);

  return (
    mounted && (
      <ContainWrapper
        ref={(r) => {
          lightboxRef.current = r;
        }}
        size={true}
        layout={true}
        paint={true}
        part="lightbox"
        wrapperClassName={`${classes.defaultStyles} ${classes.wrapper}`}
        role="dialog"
        tabindex="0"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setVisible(false);
          }
        }}
        {...rest}
      >
        {children}
        <button
          ariaLabel={closeButtonAriaLabel}
          tabIndex={-1}
          className={classes.closeButton}
          onClick={() => {
            setVisible(false);
          }}
        />
      </ContainWrapper>
    )
  );
}

const Lightbox = forwardRef(LightboxWithRef);
Lightbox.displayName = 'Lightbox';
export {Lightbox};
