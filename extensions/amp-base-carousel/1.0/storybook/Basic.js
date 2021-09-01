import * as Preact from '#preact';
import {BaseCarousel} from '../component';

const CONTROLS = ['auto', 'always', 'never'];
const SNAP_ALIGN = ['start', 'center'];
const ORIENTATIONS = ['horizontal', 'vertical'];

export default {
  title: 'BaseCarousel',
  component: BaseCarousel,
  decorators: [],

  argTypes: {
    width: {
      control: {
        type: "number"
      }
    },

    height: {
      control: {
        type: "number"
      }
    },

    slideCount: {
      control: {
        type: "number"
      }
    },

    snap: {
      control: {
        type: "boolean"
      }
    },

    snapAlign: {
      control: {
        type: "select"
      }
    },

    snapBy: {
      control: {
        type: "number"
      }
    },

    orientation: {
      control: {
        type: "select"
      }
    },

    loop: {
      control: {
        type: "boolean"
      }
    },

    advanceCount: {
      control: {
        type: "number"
      }
    },

    visibleCount: {
      control: {
        type: "number"
      }
    },

    outsetArrows: {
      control: {
        type: "boolean"
      }
    },

    controls: {
      control: {
        type: "select"
      }
    },

    defaultSlide: {
      control: {
        type: "number"
      }
    },

    autoAdvance: {
      control: {
        type: "boolean"
      }
    },

    autoAdvanceCount: {
      control: {
        type: "number"
      }
    },

    autoAdvanceInterval: {
      control: {
        type: "number"
      }
    },

    autoAdvanceLoops: {
      control: {
        type: "number"
      }
    },

    mixedLength: {
      control: {
        type: "boolean"
      }
    },

    preset: {
      control: {
        type: "select"
      }
    }
  },

  args: {
    width: 225,
    height: 440,
    slideCount: 5,
    snap: true,
    snapAlign: SNAP_ALIGN,
    snapBy: 1,
    orientation: ORIENTATIONS,
    loop: true,
    advanceCount: 1,
    visibleCount: 2,
    outsetArrows: false,
    controls: CONTROLS,
    defaultSlide: 0,
    autoAdvance: true,
    autoAdvanceCount: 1,
    autoAdvanceInterval: 1000,
    autoAdvanceLoops: 3,
    mixedLength: true,
    preset: [1, 2, 3]
  }
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
      <BaseCarousel ref={ref} {...props} />
      <div style={{marginTop: 8}}>
        <button onClick={() => ref.current.goToSlide(3)}>goToSlide(3)</button>
        <button onClick={() => ref.current.next()}>next</button>
        <button onClick={() => ref.current.prev()}>prev</button>
      </div>
    </section>
  );
}

export const _default = (
  {
    width,
    height,
    slideCount,
    snap,
    snapAlign,
    snapBy,
    orientation,
    loop,
    advanceCount,
    visibleCount,
    outsetArrows,
    controls,
    defaultSlide
  }
) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <CarouselWithActions
      advanceCount={advanceCount}
      controls={controls}
      defaultSlide={defaultSlide}
      loop={loop}
      orientation={orientation}
      outsetArrows={outsetArrows}
      snap={snap}
      snapAlign={snapAlign}
      snapBy={snapBy}
      style={{width, height}}
      visibleCount={visibleCount}
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

export const mixedLength = (
  {
    width,
    height,
    autoAdvance,
    autoAdvanceCount,
    autoAdvanceInterval,
    autoAdvanceLoops,
    loop,
    snap,
    snapAlign,
    snapBy,
    mixedLength,
    controls,
    preset,
    orientation
  }
) => {
  const slideCount = 15;
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  const randomPreset = [
    [143, 245, 289, 232, 280, 233, 182, 155, 114, 269, 242, 196, 249, 265, 241],
    [225, 158, 201, 205, 230, 233, 231, 255, 143, 264, 227, 157, 120, 203, 144],
    [252, 113, 115, 186, 248, 188, 162, 104, 100, 109, 175, 227, 143, 249, 280],
  ];
  const horizontal = orientation == 'horizontal';
  return (
    <BaseCarousel
      autoAdvance={autoAdvance}
      autoAdvanceCount={autoAdvanceCount}
      autoAdvanceInterval={autoAdvanceInterval}
      autoAdvanceLoops={autoAdvanceLoops}
      controls={controls}
      mixedLength={mixedLength}
      loop={loop}
      orientation={orientation}
      snap={snap}
      snapAlign={snapAlign}
      snapBy={snapBy}
      style={{width, height}}
    >
      {Array.from({length: slideCount}, (x, i) => {
        const v = colorIncrement * (i + 1);
        return (
          <div
            style={{
              backgroundColor: `rgb(${v}, 100, 100)`,
              border: 'solid white 1px',
              width: horizontal
                ? `${randomPreset[preset - 1 || 0][i]}px`
                : '100px',
              height: horizontal
                ? '100px'
                : `${randomPreset[preset - 1 || 0][i]}px`,
            }}
          ></div>
        );
      })}
    </BaseCarousel>
  );
};

export const provideArrows = (
  {
    outsetArrows,
    width,
    height,
    controls
  }
) => {
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
    <BaseCarousel
      controls={controls}
      style={{width, height}}
      outsetArrows={outsetArrows}
      arrowPrevAs={(props) => <MyButton {...props}>←</MyButton>}
      arrowNextAs={(props) => <MyButton {...props}>→</MyButton>}
    >
      {['lightcoral', 'peachpuff', 'lavender'].map((color) => (
        <div style={{backgroundColor: color, width, height}}></div>
      ))}
    </BaseCarousel>
  );
};

export const WithCaptions = (
  {
    controls
  }
) => {
  return (
    <BaseCarousel
      visibleCount={3}
      controls={controls}
      loop
      style={{width: '500px', height: '400px'}}
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
    </BaseCarousel>
  );
};

export const AutoAdvance = (
  {
    slideCount,
    snap,
    snapAlign,
    snapBy,
    loop,
    autoAdvance,
    autoAdvanceCount,
    autoAdvanceInterval,
    autoAdvanceLoops,
    advanceCount,
    visibleCount
  }
) => {
  const colorIncrement = Math.floor(255 / (slideCount + 1));
  return (
    <CarouselWithActions
      advanceCount={advanceCount}
      autoAdvanceCount={autoAdvanceCount}
      autoAdvanceInterval={autoAdvanceInterval}
      autoAdvanceLoops={autoAdvanceLoops}
      autoAdvance={autoAdvance}
      loop={loop}
      snap={snap}
      snapAlign={snapAlign}
      snapBy={snapBy}
      style={{width: '600px', height: '300px'}}
      visibleCount={visibleCount}
    >
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
