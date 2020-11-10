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
  useEffect,
  useImperativeHandle,
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

// Note: Sometimes, the timing between render and lightboxRef update is delayed, so we have a quick function to wait for the ref element before acting on it.
/**
 * @param {Object} ref
 * @param {number} time
 * @return {number}
 */
function getRefElement(ref, time = 1) {
  return new Promise((resolve, reject) => {
    if (time <= 0) {
      return reject(`${ref} not found`);
    }
    if (ref) {
      return resolve(ref);
    }
    setTimeout(() => getRefElement(ref, time - 1).then(resolve), 100);
  });
}

/**
 * @param {!LightboxDef.Props} props
 * @param {{current: (!LightboxDef.LightboxApi|null)}} ref
 * @return {PreactDef.Renderable}
 */
function LightboxWithRef(
  {
    id,
    animateIn = 'fade-in',
    closeButtonAriaLabel,
    children,
    onOpen,
    initialOpen,
    ...rest
  },
  ref
) {
  // `show` is a trigger variable for animations.
  // When the user opens/closes the lightbox, `show` is changed, which then triggers the appropriate animation and changes `visible` to true/false
  // `visible` controls the actual visibility of the lightbox element on the page.
  // When `visible` is true, the element exists on the page, else, it doesn't.
  // Two states are necessary here in order to control the timing of the animation properly, else rendering conflicts with animation timing.
  const [show, setShow] = useState(initialOpen);
  const [visible, setVisible] = useState(false);
  const styleClasses = useStyles();
  const lightboxRef = useRef();

  // We are using refs here to refer to common strings, objects, and functions used.
  // This is because they are needed within `useEffect` calls below (but are not depended for triggering)
  // This bypasses the exhaustive-deps eslint error
  const onOpenFnRef = useRef();
  onOpenFnRef.current = onOpen;
  const animateInRef = useRef();
  animateInRef.current = animateIn;
  const lightboxContainWrapperRef = useRef();
  lightboxContainWrapperRef.current = `.${styleClasses.lightboxContainWrapper}`;

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        console.log('hit open');
        setShow(true);
      },
      close: () => {
        setShow(false);
      },
    }),
    []
  );

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      getRefElement(lightboxRef).then((element) => {
        element = element.current;
        if (element != undefined) {
          const animation = element.animate(
            ANIMATION_PRESETS[animateInRef.current],
            {
              duration: ANIMATION_DURATION,
              direction: 'reverse',
              fill: 'both',
              easing: 'ease-in',
            }
          );
          animation.onfinish = (opt_anim) => {
            setVisible(false);
            setStyle(
              opt_anim.currentTarget.effect.target,
              'opacity',
              ANIMATION_PRESETS[animateInRef.current][0].opacity
            );
            setStyle(
              opt_anim.currentTarget.effect.target,
              'visibility',
              ANIMATION_PRESETS[animateInRef.current][0].visibility
            );
          };
          return () => {
            animation.cancel();
            animation.onfinish();
          };
        }
      });
    }
  }, [show]);

  useEffect(() => {
    if (!show && !visible) {
      return;
    }
    if (visible) {
      console.log('lightboxRef on effect', lightboxRef);
      getRefElement(lightboxRef).then((element) => {
        element = element.current;
        const animation = element.animate(
          ANIMATION_PRESETS[animateInRef.current],
          {
            duration: ANIMATION_DURATION,
            fill: 'both',
            easing: 'ease-in',
          }
        );
        animation.onfinish = (opt_anim) => {
          setStyle(
            opt_anim.currentTarget.effect.target,
            'opacity',
            ANIMATION_PRESETS[animateInRef.current][1].opacity
          );
          setStyle(
            opt_anim.currentTarget.effect.target,
            'visibility',
            ANIMATION_PRESETS[animateInRef.current][1].visibility
          );
          opt_anim.currentTarget.effect.target.focus();
        };
        return () => {
          animation.cancel();
          animation.onfinish();
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    visible && (
      <ContainWrapper
        id={id}
        ref={(r) => {
          lightboxRef.current = r;
        }}
        style={{visibility: 'hidden'}}
        size={true}
        layout={true}
        paint={true}
        class={`${styleClasses.lightboxContainWrapper}`}
        role="dialog"
        tabindex="0"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setShow(false);
          }
        }}
        {...rest}
      >
        <button
          ariaLabel={closeButtonAriaLabel}
          tabIndex={-1}
          class={`${styleClasses.closeButton}`}
          onClick={() => {
            setShow(false);
          }}
        />
        {children}
      </ContainWrapper>
    )
  );
}

const Lightbox = forwardRef(LightboxWithRef);
Lightbox.displayName = 'Lightbox';
export {Lightbox};
