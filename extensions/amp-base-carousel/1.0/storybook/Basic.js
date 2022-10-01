import {BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/component';

import * as Preact from '#preact';

import '#bento/components/bento-base-carousel/1.0/component.jss';

export default {
  title: 'BaseCarousel',
  component: BentoBaseCarousel,
};

// Different exported stories use some of these.
const argTypes = {
  slideCount: {
    control: {type: 'number', min: 0, max: 99, step: 1},
  },
  advanceCount: {
    control: {type: 'number', min: 1},
  },
  visibleCount: {
    control: {type: 'number', min: 1},
  },
  controls: {
    control: {type: 'inline-radio'},
    options: ['auto', 'always', 'never'],
  },
  orientation: {
    control: {type: 'inline-radio'},
    options: ['horizontal', 'vertical'],
  },
  snapAlign: {
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
      <BentoBaseCarousel ref={ref} {...props} />
      <div style={{marginTop: 8}}>
        <button data-testid="goto" onClick={() => ref.current.goToSlide(3)}>
          goToSlide(3)
        </button>
        <button data-testid="next" onClick={() => ref.current.next()}>
          next
        </button>
        <button data-testid="prev" onClick={() => ref.current.prev()}>
          prev
        </button>
      </div>
    </section>
  );
}

export const _default = ({
  height,
  slideCount,
  visibleCount,
  width,
  ...args
}) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <CarouselWithActions
      style={{width, height}}
      visibleCount={visibleCount}
      {...args}
    >
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              width,
              height,
              textAlign: 'center',
              fontSize: '48pt',
              lineHeight: height / visibleCount + 'px',
            }}
          >
            {i}
          </div>
        );
      })}
    </CarouselWithActions>
  );
};

_default.args = {
  width: 225,
  height: 440,
  controls: 'auto',
  defaultSlide: 0,
  slideCount: 5,
  loop: true,
  orientation: 'vertical',
  outsetArrows: false,
  snap: true,
  snapAlign: 'start',
  snapBy: 1,
  visibleCount: 2,
  advanceCount: 1,
};

_default.argTypes = {
  slideCount: argTypes.slideCount,
  controls: argTypes.controls,
  orientation: argTypes.orientation,
  snapAlign: argTypes.snapAlign,
  advanceCount: argTypes.advanceCount,
  visibleCount: argTypes.visibleCount,
};

export const MixedLength = ({
  height,
  orientation,
  preset,
  snap,
  snapAlign,
  width,
  ...args
}) => {
  const slideCount = 15;
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  const horizontal = orientation == 'horizontal';
  return (
    <BentoBaseCarousel
      orientation={orientation}
      snap={snap}
      snapAlign={snapAlign}
      style={{width, height}}
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
    </BentoBaseCarousel>
  );
};

MixedLength.args = {
  height: 300,
  width: 300,
  autoAdvance: true,
  autoAdvanceCount: 1,
  autoAdvanceInterval: 1000,
  autoAdvanceLoops: 3,
  controls: 'auto',
  loop: true,
  snap: true,
  snapAlign: 'start',
  snapBy: 1,
  mixedLength: true,
  preset: 1,
  orientation: 'vertical',
};

MixedLength.argTypes = {
  controls: argTypes.controls,
  orientation: argTypes.orientation,
  preset: argTypes.preset,
};
export const ProvideArrows = ({height, width, ...args}) => {
  const myButtonStyle = {
    background: 'lightblue',
    borderRadius: '50%',
    fontSize: 14,
    color: 'white',
    width: '30px',
    height: '30px',
    padding: '1px 6px',
  };
  const MyButton = (props) => {
    const {children} = props;
    return (
      <button style={myButtonStyle} {...props}>
        {children}
      </button>
    );
  };
  return (
    <BentoBaseCarousel
      style={{width, height}}
      arrowPrevAs={(props) => <MyButton {...props}>←</MyButton>}
      arrowNextAs={(props) => <MyButton {...props}>→</MyButton>}
      {...args}
    >
      {['lightcoral', 'peachpuff', 'lavender'].map((color) => (
        <div style={{backgroundColor: color, width, height}}></div>
      ))}
    </BentoBaseCarousel>
  );
};

ProvideArrows.args = {
  height: 300,
  width: 300,
  controls: 'auto',
  outsetArrows: false,
};

ProvideArrows.argTypes = {
  controls: argTypes.controls,
};

export const WithCaptions = (args) => {
  return (
    <BentoBaseCarousel
      visibleCount={3}
      loop
      style={{width: '500px', height: '400px'}}
      {...args}
    >
      <figure>
        <img
          style={{width: '500px', height: '300px'}}
          src="https://amp.dev/static/samples/img/landscape_lake_1280x857.jpg"
        />
        <figcaption>Each image has a different caption.</figcaption>
      </figure>
      <figure>
        <img
          style={{width: '600px', height: '300px'}}
          src="https://amp.dev/static/samples/img/landscape_village_1280x853.jpg"
        />
        <figcaption>This caption is different.</figcaption>
      </figure>
      <figure>
        <img
          style={{width: '500px', height: '300px'}}
          src="https://amp.dev/static/samples/img/landscape_desert_1280x853.jpg"
        />
        <figcaption>The third image has its caption.</figcaption>
      </figure>
    </BentoBaseCarousel>
  );
};

WithCaptions.args = {
  controls: 'auto',
};

WithCaptions.argTypes = {
  controls: argTypes.controls,
};

export const AutoAdvance = ({slideCount, ...args}) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <CarouselWithActions style={{width: '600px', height: '300px'}} {...args}>
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              width: '900px',
              height: '300px',
              textAlign: 'center',
              fontSize: '48pt',
              lineHeight: '300px',
            }}
          >
            {i}
          </div>
        );
      })}
    </CarouselWithActions>
  );
};

AutoAdvance.args = {
  advanceCount: 1,
  autoAdvance: true,
  autoAdvanceCount: 1,
  autoAdvanceInterval: 1000,
  autoAdvanceLoops: 3,
  slideCount: 5,
  loop: true,
  snap: true,
  snapAlign: 'start',
  snapBy: 1,
  visibleCount: 2,
};

AutoAdvance.argTypes = {
  advanceCount: argTypes.advanceCount,
  snapAlign: argTypes.snapAlign,
  slideCount: argTypes.slideCount,
  visibleCount: argTypes.visibleCount,
};
