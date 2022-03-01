import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

const CONTROLS = ['auto', 'always', 'never'];

export default {
  title: 'amp-stream-gallery-1_0',
  decorators: [withAmp],

  parameters: {
    extensions: [
      {name: 'amp-stream-gallery', version: '1.0'},
      {name: 'amp-base-carousel', version: '1.0'},
    ],
    experiments: ['bento'],
  },

  argTypes: {
    slideCount: {
      name: 'slide count',
      control: {type: 'number', min: 3, max: 99},
      defaultValue: 15,
    },
    extraSpace: {
      name: 'extra space around?',
      control: {type: 'boolean'},
      defaultValue: true,
    },
    controls: {
      name: 'controls',
      control: {type: 'select'},
      defaultValue: CONTROLS,
    },
    loop: {
      name: 'loop',
      control: {type: 'boolean'},
      defaultValue: true,
    },
    snap: {
      name: 'snap',
      control: {type: 'boolean'},
      defaultValue: true,
    },
    slideAlign: {
      name: 'slide align',
      control: {type: 'select'},
      defaultValue: ['start', 'center'],
    },
    minItemWidth: {
      name: 'min item width',
      control: {type: 'number', min: 1},
      defaultValue: 130,
    },
    maxItemWidth: {
      name: 'max item width',
      control: {type: 'number', min: 1},
      defaultValue: 180,
    },
    minVisibleCount: {
      name: 'min visible count',
      control: {type: 'number', min: 1},
      defaultValue: 2.5,
    },
    maxVisibleCount: {
      name: 'max visible count',
      control: {type: 'number', min: 1},
      defaultValue: 5,
    },
    peek: {
      name: 'peek',
      control: {type: 'number', min: 1},
      defaultValue: 0,
    },
    outsetArrows: {
      name: 'outset arrows',
      control: {type: 'boolean'},
      defaultValue: true,
    },
    width: {type: 'number'},
    height: {type: 'number'},
  },
};

export const Default = ({
  controls,
  extraSpace,
  loop,
  maxItemWidth,
  maxVisibleCount,
  minItemWidth,
  minVisibleCount,
  outsetArrows,
  peek,
  slideAlign,
  slideCount,
  snap,
  ...args
}) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <>
      <amp-stream-gallery
        id="carousel"
        width="735"
        height="225"
        layout="responsive"
        controls={controls}
        extra-space={extraSpace}
        loop={loop}
        min-item-width={minItemWidth}
        max-item-width={maxItemWidth}
        min-visible-count={minVisibleCount}
        max-visible-count={maxVisibleCount}
        outset-arrows={outsetArrows}
        peek={peek}
        slide-align={slideAlign}
        snap={snap}
        {...args}
      >
        {Array.from({length: slideCount}, (x, i) => {
          const v = colorIncrement * (i + 1);
          return (
            <amp-layout width="245" height="225" layout="flex-item">
              <svg viewBox="0 0 440 225">
                <rect
                  style={{fill: `rgb(${v}, 100, 100)`}}
                  width="440"
                  height="225"
                />
                Sorry, your browser does not support inline SVG.
              </svg>
            </amp-layout>
          );
        })}
      </amp-stream-gallery>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:carousel.goToSlide(index=3)">goToSlide(index=3)</button>
        <button on="tap:carousel.next">Next</button>
        <button on="tap:carousel.prev">Prev</button>
      </div>
    </>
  );
};

export const CustomArrows = ({height, slideCount, width, ...args}) => {
  width = width ?? 400;
  height = height ?? 200;

  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <amp-stream-gallery
      max-visible-count={3}
      width={width}
      height={height}
      {...args}
    >
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              border: 'solid white 1px',
              width: '100%',
              height: '100%',
            }}
          ></div>
        );
      })}
      <button slot="next-arrow">Next</button>
      <button slot="prev-arrow">Prev</button>
    </amp-stream-gallery>
  );
};

Default.storyName = 'default';
