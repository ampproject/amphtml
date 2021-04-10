/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import {Lightbox} from './../../amp-lightbox/1.0/component';
import {LightboxGalleryContext} from './context';
import {useCallback, useRef} from '../../../src/preact';

/**
 * @param {!LightboxGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function LightboxGalleryProvider({children, render}) {
  const lightboxRef = useRef(null);
  const renderers = useRef([]);
  const lightboxElements = useRef([]);
  const register = (key, render) => {
    renderers.current[key] = render;
  };
  const deregister = (key) => {
    delete lightboxElements.current[key];
    delete renderers.current[key];
  };
  const context = {
    deregister,
    register,
    open: () => lightboxRef.current.open(),
  };

  const renderElements = useCallback(() => {
    renderers.current.forEach((render, index) => {
      if (!lightboxElements.current[index]) {
        lightboxElements.current[index] = render();
      }
    });
  }, []);
  return (
    <>
      <Lightbox
        onBeforeOpen={() => renderElements()}
        ref={lightboxRef}
        scrollable
      >
        {/* TODO: This needs an actual close button UI */}
        <div
          aria-label="Close the lightbox"
          role="button"
          tabIndex="0"
          onClick={() => lightboxRef.current.close()}
        >
          Close lightbox
        </div>
        <div>{lightboxElements.current}</div>
      </Lightbox>
      <LightboxGalleryContext.Provider value={context}>
        {render ? render() : children}
      </LightboxGalleryContext.Provider>
    </>
  );
}
