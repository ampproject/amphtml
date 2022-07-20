import {BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/component';
import {
  BentoInlineGallery,
  BentoInlineGalleryPagination,
  BentoInlineGalleryThumbnails,
} from '#bento/components/bento-inline-gallery/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'InlineGallery',
  component: BentoInlineGallery,
  argTypes: {
    aspectRatio: {
      name: 'thumbnail aspect ratio (w/h)',
      defaultValue: 3 / 2,
      control: {type: 'number'},
    },
    topInset: {
      name: 'top indicator inset?',
      defaultValue: false,
      control: {type: 'boolean'},
    },
    bottomInset: {
      name: 'bottom indicator inset?',
      defaultValue: false,
      control: {type: 'boolean'},
    },
    autoAdvance: {
      name: 'auto advance',
      defaultValue: false,
      control: {type: 'boolean'},
    },
    loop: {
      name: 'thumbnail loop',
      defaultValue: false,
      control: {type: 'boolean'},
    },
    paginationHeight: {
      name: 'top indicator height',
      control: {type: 'number'},
      defaultValue: 20,
    },
    autoAdvanceCount: {
      name: 'auto advance count',
      control: {type: 'number'},
      defaultValue: 1,
    },
    autoAdvanceInterval: {
      name: 'auto advance interval',
      control: {type: 'number'},
      defaultValue: 1000,
    },
    autoAdvanceLoops: {
      name: 'auto advance loops',
      control: {type: 'number'},
      defaultValue: 3,
    },
    thumbnailHeight: {
      name: 'thumbnail height',
      control: {type: 'number'},
      defaultValue: 50,
    },
    width: {type: 'number'},
    height: {type: 'number'},
    orientation: {
      name: 'orientation',
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
      defaultValue: 'vertical',
    },
  },
};

export const Default = ({
  aspectRatio,
  autoAdvance,
  autoAdvanceCount,
  autoAdvanceInterval,
  autoAdvanceLoops,
  bottomInset,
  height,
  loop,
  orientation,
  paginationHeight,
  thumbnailHeight,
  topInset,
  width,
  ...args
}) => {
  width = width ?? 360;
  height = height ?? 240;
  return (
    <>
      <BentoInlineGallery style={{width}} {...args}>
        <BentoInlineGalleryPagination
          style={{height: paginationHeight}}
          inset={topInset}
        />
        <BentoInlineGalleryThumbnails
          aspectRatio={aspectRatio}
          loop={loop}
          style={{height: thumbnailHeight}}
        />
        <br />
        <BentoInlineGalleryThumbnails />
        <br />
        <BentoBaseCarousel
          style={{height}}
          autoAdvanceCount={autoAdvanceCount}
          autoAdvanceInterval={autoAdvanceInterval}
          autoAdvanceLoops={autoAdvanceLoops}
          autoAdvance={autoAdvance}
          orientation={orientation}
        >
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
        <BentoInlineGalleryPagination inset={bottomInset} />
      </BentoInlineGallery>
      Content below carousel
    </>
  );
};

export const WithLooping = ({
  aspectRatio,
  height,
  inset,
  loop,
  paginationHeight,
  thumbnailHeight,
  width,
  ...args
}) => {
  width = width ?? 440;
  height = height ?? 225;

  const slides = [
    'lightpink',
    'lightcoral',
    'peachpuff',
    'powderblue',
    'lavender',
    'thistle',
  ].map((color, index) => (
    <div
      style={{
        backgroundColor: color,
        width,
        height,
        textAlign: 'center',
        fontSize: '48pt',
        lineHeight: height + 'px',
      }}
    >
      {index + 1}
    </div>
  ));

  return (
    <BentoInlineGallery style={{width, position: 'relative'}} {...args}>
      <BentoBaseCarousel loop style={{height, position: 'relative'}}>
        {slides}
      </BentoBaseCarousel>
      <BentoInlineGalleryPagination
        inset={inset}
        style={{height: paginationHeight}}
      />
      <BentoInlineGalleryThumbnails
        aspectRatio={aspectRatio}
        loop={loop}
        style={{height: thumbnailHeight}}
      >
        <div>a</div>
        <div>b</div>
        <div>c</div>
        <div>d</div>
      </BentoInlineGalleryThumbnails>
    </BentoInlineGallery>
  );
};
