import * as Preact from '#preact';

import {BentoStreamGallery} from '../component';

import '../component.jss';

const CONTROLS = ['auto', 'always', 'never'];

export default {
  title: 'StreamGallery',
  component: BentoStreamGallery,
  argTypes: {
    width: {
      name: 'width',
      control: {type: 'number'},
      defaultValue: 735,
    },
    height: {
      name: 'height',
      control: {type: 'number'},
      defaultValue: 225,
    },
    slideCount: {
      name: 'slide count',
      control: {type: 'number', min: 0, max: 99},
      defaultValue: 5,
    },
    extraSpace: {
      name: 'extra space around',
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
      options: ['start', 'center'],
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
      defaultValue: 3,
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
  },
};

/**
 * @param {!Object} props
 * @return {*}
 */
function CarouselWithActions(props) {
  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const ref = Preact.useRef();
  return (
    <section>
      <BentoStreamGallery ref={ref} {...props} />
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current.goToSlide(3)}>goToSlide(3)</button>
        <button onClick={() => ref.current.next()}>next</button>
        <button onClick={() => ref.current.prev()}>prev</button>
      </div>
    </section>
  );
}

export const Default = ({
  controls,
  extraSpace,
  height,
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
  width,
  ...args
}) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <>
      <CarouselWithActions
        extraSpace={extraSpace ? 'around' : ''}
        controls={controls}
        loop={loop}
        slideAlign={slideAlign}
        snap={snap}
        outsetArrows={outsetArrows}
        minItemWidth={minItemWidth}
        maxItemWidth={maxItemWidth}
        minVisibleCount={minVisibleCount}
        maxVisibleCount={maxVisibleCount}
        peek={peek}
        style={{width, height}}
        {...args}
      >
        {Array.from({length: slideCount}, (_, i) => {
          const v = colorIncrement * (i + 1);
          return (
            <div
              style={{
                backgroundColor: `rgb(${v}, 100, 100)`,
                width,
                height,
              }}
            ></div>
          );
        })}
      </CarouselWithActions>
    </>
  );
};
