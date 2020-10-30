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
import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';
import {useStyles} from './lightbox.jss';

const ANIMATION_DURATION = 300;
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

/**
 * @param {string} selector
 * @param {number} time
 * @return {number}
 */
function getElement(selector, time = 5) {
  return new Promise(async (resolve, reject) => {
    if (time <= 0) {
      return reject(`${selector} not found`);
    }
    const elements = document.querySelectorAll(selector);
    if (elements.length) {
      return resolve(elements);
    }
    return setTimeout(async () => await getElement(selector, time - 1), 1000);
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
    // eslint-disable-next-line no-unused-vars
    scrollable, // (TODO: discussion)
    children,
    onOpen,
    initialOpen,
    ...rest
  },
  ref
) {
  const [show, setShow] = useState(initialOpen);
  const [visible, setVisible] = useState(false);
  const styleClasses = useStyles();
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
      getElement(lightboxContainWrapperRef.current)
        .then((element) => {
          element = element[0];
          element
            .animate(ANIMATION_PRESETS[animateInRef.current], {
              duration: ANIMATION_DURATION,
              direction: 'reverse',
              fill: 'both',
            })
            .finished.then((opt_el) => {
              setVisible(false);
            })
            .catch((err) => {
              throw Error('Lightbox closing animation failed', err);
            });
        })
        .catch((err) => {
          throw Error(err);
        });
    }
  }, [show]);

  useEffect(() => {
    if (!show && !visible) {
      return;
    }
    if (visible) {
      getElement(lightboxContainWrapperRef.current)
        .then((element) => {
          element = element[0];
          element.animate(ANIMATION_PRESETS[animateInRef.current], {
            duration: ANIMATION_DURATION,
            fill: 'both',
          });
        })
        .catch((error) => {
          throw Error('Element not found:', error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useLayoutEffect(() => {
    const escFunction = (event) => {
      if (event.keyCode === 27) {
        setShow(false);
      }
    };
    document.addEventListener('keydown', escFunction);

    return () => {
      document.removeEventListener('keydown', escFunction);
    };
  });

  return (
    visible && (
      <ContainWrapper
        {...rest}
        id={id}
        size={true}
        layout={true}
        paint={true}
        class={`${styleClasses.lightboxContainWrapper}`}
        role="dialog"
      >
        <button
          textContent={closeButtonAriaLabel}
          tabIndex={-1}
          class={`${styleClasses.ariaButton}`}
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
