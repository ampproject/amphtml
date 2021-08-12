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

import {withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {BaseCarousel} from '../../../amp-base-carousel/1.0/component';
import {LightboxGalleryProvider, WithLightbox} from '../component';

export default {
  title: 'LightboxGallery',
  component: LightboxGalleryProvider,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <>
      <LightboxGalleryProvider>
        <style>{`
        img {
          width: 240px;
          height: 160px;
        }
        .amp-lightbox-gallery-caption {
          color: red;
        }
      `}</style>
        <WithLightbox caption="This is the caption for the first image. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.">
          <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80" />
        </WithLightbox>
        <p>abc</p>
        <WithLightbox
          as="img"
          alt="larger img"
          id="foo"
          src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          render={() => (
            <img
              alt="smaller img"
              src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
            />
          )}
        />
        <p>abc</p>
        <WithLightbox caption="This is the caption for the third image.">
          <img src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80" />
        </WithLightbox>
        <div>
          <div>
            <div>
              <WithLightbox
                as="section"
                render={() => (
                  <img
                    alt="only one image"
                    src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
                  />
                )}
              >
                <img src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80" />
                <img src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80" />
              </WithLightbox>
            </div>
          </div>
        </div>
      </LightboxGalleryProvider>
    </>
  );
};

export const carousel = () => {
  return (
    <>
      <style>{`
    img {
      width: 240px;
      height: 160px;
    }
  `}</style>
      <LightboxGalleryProvider>
        <BaseCarousel lightbox style={{width: '240px', height: '160px'}}>
          <img
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=120&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
          <img
            src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
        </BaseCarousel>
      </LightboxGalleryProvider>
    </>
  );
};

export const grouping = () => {
  return (
    <>
      <style>{`
    img {
      width: 240px;
      height: 160px;
    }
  `}</style>
      <p>
        Note: The standalone img/amp-img elements are lightboxed in a separate
        lightbox-gallery group than the carousel elements.
      </p>
      <LightboxGalleryProvider>
        <WithLightbox caption="This is the caption for the first image. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.">
          <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80" />
        </WithLightbox>
        <WithLightbox
          as="img"
          alt="larger img"
          id="foo"
          src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
          render={() => (
            <img
              alt="smaller img"
              src="https://images.unsplash.com/photo-1583511666407-5f06533f2113?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
            />
          )}
        />
        <WithLightbox aria-label="This is the caption for the third image.">
          <img src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80" />
        </WithLightbox>
        <BaseCarousel lightbox style={{width: '240px', height: '160px'}}>
          <img
            alt="Image 1 long. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry."
            src="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1583512603806-077998240c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
          <img
            alt="Image 2"
            src="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1598133893773-de3574464ef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
          <img
            aria-label="Image 3"
            src="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1498&q=80"
            thumbnailSrc="https://images.unsplash.com/photo-1603123853880-a92fafb7809f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
          />
        </BaseCarousel>
      </LightboxGalleryProvider>
    </>
  );
};
