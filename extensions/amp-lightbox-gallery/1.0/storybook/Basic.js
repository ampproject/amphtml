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

import * as Preact from '../../../../src/preact';
// import {LightboxGallery} from '../lightbox-gallery';
import {Lightbox} from './../../../amp-lightbox/1.0/lightbox';
import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'LightboxGallery',
  // component: LightboxGallery,
  decorators: [withKnobs, withA11y],
};

const LightboxGalleryContext = Preact.createContext({});

/**
 * @param {!Object} props
 * @return {*}
 */
function WithLightbox({children}) {
  const {open, pushChild} = Preact.useContext(LightboxGalleryContext);
  Preact.useLayoutEffect(() => {
    pushChild(children);
  }, []);
  return <div onClick={() => open()}>{children}</div>;
}

/**
 * @param {!Object} props
 * @return {*}
 */
function LightboxGallery({children}) {
  const lightboxRef = Preact.useRef(null);
  const lightboxElements = Preact.useRef([]);
  const pushChild = (el) => lightboxElements.current.push(el);
  const context = {pushChild, open: () => lightboxRef.current.open()};
  return (
    <>
      <Lightbox ref={lightboxRef}>
        <div onClick={() => lightboxRef.current.close()}>close lightbox</div>
        <div>{lightboxElements.current}</div>
      </Lightbox>
      <LightboxGalleryContext.Provider value={context}>
        {Preact.toChildArray(children).map((child) =>
          child.props?.lightbox ? <WithLightbox>{child}</WithLightbox> : child
        )}
      </LightboxGalleryContext.Provider>
    </>
  );
}

export const _default = () => {
  return (
    <LightboxGallery>
      <style>{`
        img {
          width: 240px;
          height: 160px;
        }
      `}</style>
      Top level children can use `lightbox` prop.
      <img
        lightbox
        src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
      />
      <p>abc</p>
      <img
        lightbox
        src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
      />
      <p>abc</p>
      <img
        lightbox
        src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
      />
      <div>
        <div>
          <div>
            This one uses `WithLightbox` because it is deeply nested.
            <WithLightbox>
              <img src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80" />
            </WithLightbox>
          </div>
        </div>
      </div>
    </LightboxGallery>
  );
};
