import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-base-carousel-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-bind', version: '0.1'},
      {name: 'amp-base-carousel', version: '1.0'},
    ],
    experiments: ['bento'],
  },
};

// Different exported stories use some of these.
const argTypes = {
  slideCount: {
    control: {type: 'number', min: 0, max: 99, step: 1},
  },
  controls: {
    control: {type: 'inline-radio'},
    options: ['auto', 'always', 'never'],
  },
  orientation: {
    control: {type: 'inline-radio'},
    options: ['horizontal', 'vertical'],
  },
  'snap-align': {
    control: {type: 'inline-radio'},
    options: ['start', 'center'],
  },
  preset: {
    name: 'random preset',
    control: {type: 'inline-radio'},
    options: [1, 2, 3],
    mapping: {
      1: [
        143, 245, 289, 232, 280, 233, 182, 155, 114, 269, 242, 196, 249, 265,
        241,
      ],
      2: [
        225, 158, 201, 205, 230, 233, 231, 255, 143, 264, 227, 157, 120, 203,
        144,
      ],
      3: [
        252, 113, 115, 186, 248, 188, 162, 104, 100, 109, 175, 227, 143, 249,
        280,
      ],
    },
  },
};

export const Default = ({slideCount, snap, ...args}) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));

  return (
    <main>
      <amp-base-carousel
        id="carousel"
        width="450"
        height="450"
        data-amp-bind-slide="activeSlide"
        snap={String(snap)}
        {...args}
      >
        {Array.from({length: args['slide-count']}, (x, i) => {
          const v = colorIncrement * (i + 1);
          return (
            <amp-layout width="225" height="225" layout="responsive">
              <div
                style={{
                  backgroundColor: `rgb(${v}, 100, 100)`,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48pt',
                }}
              >
                {i}
              </div>
            </amp-layout>
          );
        })}
      </amp-base-carousel>

      <div class="buttons" style={{marginTop: 8}}>
        <button on="tap:carousel.goToSlide(index=3)">goToSlide(index=3)</button>
        <button on="tap:carousel.next">Next</button>
        <button on="tap:carousel.prev">Prev</button>
        <button on="tap:AMP.setState({activeSlide: 3})">
          mutate slide to index 3
        </button>
      </div>
    </main>
  );
};

Default.args = {
  'advance-count': 1,
  'auto-advance': true,
  'auto-advance-count': 1,
  'auto-advance-interval': 1000,
  'auto-advance-loops': 3,
  controls: 'auto',
  slide: 0,
  loop: true,
  orientation: 'vertical',
  'outset-arrows': '(min-width: 400px) true, false',
  slideCount: 5,
  snap: true,
  'snap-align': 'start',
  'snap-by': 1,
  'visible-count': '(min-width: 400px) 2, 1',
};

Default.argTypes = {
  slideCount: argTypes.slideCount,
  controls: argTypes.controls,
  orientation: argTypes.orientation,
  'snap-align': argTypes['snap-align'],
};

export const MixedLength = ({
  orientation,
  preset,
  slideCount,
  snap,
  snapAlign,
  ...args
}) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  const horizontal = orientation == 'horizontal';

  return (
    <amp-base-carousel
      orientation={orientation}
      snap={String(snap)}
      snap-align={snapAlign}
      {...args}
    >
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              border: 'solid white 1px',
              width: horizontal ? `${preset[i]}px` : '100px',
              height: horizontal ? '100px' : `${preset[i]}px`,
            }}
          ></div>
        );
      })}
    </amp-base-carousel>
  );
};

MixedLength.args = {
  controls: 'auto',
  height: 300,
  width: 300,
  slideCount: 5,
  loop: true,
  snap: true,
  'snap-align': 'start',
  'snap-by': 1,
  'mixed-length': true,
  preset: 1,
  orientation: 'vertical',
};

MixedLength.argTypes = {
  controls: argTypes.controls,
  orientation: argTypes.orientation,
  preset: argTypes.preset,
  'snap-align': argTypes['snap-align'],
};

export const CustomArrows = ({height, slideCount, width}) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <amp-base-carousel id="my-carousel" width={width} height={height}>
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
    </amp-base-carousel>
  );
};

CustomArrows.args = {
  height: 300,
  width: 300,
  slideCount: 5,
};
