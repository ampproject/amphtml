import {BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/component';
import {
  BentoLightboxGalleryProvider,
  WithBentoLightboxGallery,
} from '#bento/components/bento-lightbox-gallery/1.0/component';

import * as Preact from '#preact';

import '#bento/components/bento-lightbox-gallery/1.0/component.jss';

import '#bento/components/bento-base-carousel/1.0/component.jss';

export default {
  title: 'LightboxGallery',
  component: BentoLightboxGalleryProvider,
  argTypes: {},
};

export const _default = () => {
  return (
    <>
      <BentoLightboxGalleryProvider>
        <style>{`
        img {
          width: 240px;
          height: 160px;
        }
        .amp-lightbox-gallery-caption {
          color: red;
        }
      `}</style>
        <WithBentoLightboxGallery caption="This is the caption for the first image. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.">
          <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80" />
        </WithBentoLightboxGallery>
        <p>abc</p>
        <WithBentoLightboxGallery
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
        <WithBentoLightboxGallery caption="This is the caption for the third image.">
          <img src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80" />
        </WithBentoLightboxGallery>
        <div>
          <div>
            <div>
              <WithBentoLightboxGallery
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
              </WithBentoLightboxGallery>
            </div>
          </div>
        </div>
      </BentoLightboxGalleryProvider>
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
      <BentoLightboxGalleryProvider>
        <BentoBaseCarousel lightbox style={{width: '240px', height: '160px'}}>
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
        </BentoBaseCarousel>
      </BentoLightboxGalleryProvider>
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
      <BentoLightboxGalleryProvider>
        <WithBentoLightboxGallery caption="This is the caption for the first image. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.">
          <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1498&q=80" />
        </WithBentoLightboxGallery>
        <WithBentoLightboxGallery
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
        <WithBentoLightboxGallery aria-label="This is the caption for the third image.">
          <img src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjQwMzA0fQ&auto=format&fit=crop&w=1498&q=80" />
        </WithBentoLightboxGallery>
        <BentoBaseCarousel lightbox style={{width: '240px', height: '160px'}}>
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
        </BentoBaseCarousel>
      </BentoLightboxGalleryProvider>
    </>
  );
};
