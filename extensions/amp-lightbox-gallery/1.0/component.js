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
import {Lightbox} from './../../amp-lightbox/1.0/lightbox';
import {LightboxGalleryContext} from './context';
import {sequentialIdGenerator} from '../../../src/utils/id-generator';
import {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from '../../../src/preact';

const generateLightboxItemKey = sequentialIdGenerator();

/**
 * @param {!LightboxGalleryDef.Props} props
 * @return {PreactDef.Renderable}
 */
export function LightboxGallery({children}) {
  const lightboxRef = useRef(null);
  const lightboxElements = useRef([]);
  const register = (key, render) => {
    lightboxElements.current[key] = render();
  };
  const deregister = (key) => {
    delete lightboxElements.current[key];
  };
  const context = {
    deregister,
    register,
    open: () => lightboxRef.current.open(),
  };
  return (
    <>
      <Lightbox ref={lightboxRef} scrollable>
        {/* TODO: This needs an actual close button UI */}
        <div
          role="button"
          tabindex="0"
          onClick={() => lightboxRef.current.close()}
        >
          Close lightbox
        </div>
        <div>{lightboxElements.current}</div>
      </Lightbox>
      <LightboxGalleryContext.Provider value={context}>
        {children}
      </LightboxGalleryContext.Provider>
    </>
  );
}

/**
 * @param {!LightboxGalleryDef.WithLightboxProps} props
 * @return {PreactDef.Renderable}
 */
export function WithLightbox({
  autoLightbox = true,
  as: Comp = 'div',
  children,
  render = () => children,
  role = 'button',
  tabindex = '0',
  ...rest
}) {
  const [genKey] = useState(generateLightboxItemKey);
  const {open, register, deregister} = useContext(LightboxGalleryContext);
  useLayoutEffect(() => {
    register(genKey, render);
    return () => deregister(genKey);
  }, [genKey, deregister, register, render]);
  return autoLightbox ? (
    <Comp
      {...rest}
      key={genKey}
      onClick={() => open()}
      role={role}
      tabindex={tabindex}
    >
      {children}
    </Comp>
  ) : (
    children
  );
}
