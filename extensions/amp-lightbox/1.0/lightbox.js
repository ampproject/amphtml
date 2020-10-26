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
import {useLayoutEffect, useRef} from '../../../src/preact';

const ANIMATION_PRESETS = {
  'fade-in': [{opacity: 0}, {opacity: 1}],
  'fly-in-top': [
    {opacity: 0, transform: 'translate(0,-100%)'},
    {opacity: 1, transform: 'translate: (0, 0)'},
  ],
  'fly-in-bottom': [
    {opacity: 0, transform: 'translate(0, 100%)'},
    {opacity: 1, transform: 'translate: (0, 0)'},
  ],
};

/**
 * @param {!LightboxProps} props
 * @return {PreactDef.Renderable}
 */
function LightboxWithRef({
  id,
  layout = 'nodisplay',
  animateIn = 'fade-in',
  closeButtonAriaLabel,
  // eslint-disable-next-line no-unused-vars
  scrollable, // (TODO: discussion)
  children,
  onOpen,
  open,
  ...rest
}) {
  const lightboxRef = useRef();

  useLayoutEffect(() => {
    if (open) {
      const element = lightboxRef.current;
      element.hidden = false;
      setStyle(element, 'opacity', 1);
      setStyle(element, 'visibility', 'visible');
      element.animate(ANIMATION_PRESETS[animateIn], {duration: 200});
      if (onOpen) {
        onOpen();
      }
    }
  });
  return (
    <ContainWrapper
      ref={lightboxRef}
      id={id}
      layout={layout}
      size={true}
      layout={true}
      paint={true}
      {...rest}
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        width: window.innerWidth,
        height: window.innerHeight,
        opacity: 0,
        visibility: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'right',
      }}
      hidden
    >
      <button
        textContent={closeButtonAriaLabel}
        tabIndex={-1}
        style={{
          position: 'fixed',
          /* keep it on viewport */
          top: 0,
          left: 0,
          /* give it non-zero size, VoiceOver on Safari requires at least 2 pixels
     before allowing buttons to be activated. */
          width: '2px',
          height: '2px',
          /* visually hide it with overflow and opacity */
          opacity: 0,
          overflow: 'hidden',
          /* remove any margin or padding */
          border: 'none',
          margin: 0,
          padding: 0,
          /* ensure no other style sets display to none */
          display: 'block',
          visibility: 'visible',
        }}
        onClick={() => {
          open = false;
        }}
      />
      {children}
    </ContainWrapper>
  );
}

const Lightbox = forwardRef(LightboxWithRef);
Lightbox.displayName = 'Lightbox';
export {Lightbox};
