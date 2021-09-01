import * as Preact from '#preact';
import {StreamGallery} from '../component';

const CONTROLS = ['auto', 'always', 'never'];

export default {
  title: 'StreamGallery',
  component: StreamGallery,
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

    extraSpace: {
      control: {
        type: "boolean"
      }
    },

    controls: {
      control: {
        type: "select"
      }
    },

    loop: {
      control: {
        type: "boolean"
      }
    },

    snap: {
      control: {
        type: "boolean"
      }
    },

    slideAlign: {
      control: {
        type: "select"
      }
    },

    minItemWidth: {
      control: {
        type: "number"
      }
    },

    maxItemWidth: {
      control: {
        type: "number"
      }
    },

    minVisibleCount: {
      control: {
        type: "number"
      }
    },

    maxVisibleCount: {
      control: {
        type: "number"
      }
    },

    peek: {
      control: {
        type: "number"
      }
    },

    outsetArrows: {
      control: {
        type: "boolean"
      }
    }
  },

  args: {
    width: 735,
    height: 225,
    slideCount: 5,
    extraSpace: true,
    controls: CONTROLS,
    loop: true,
    snap: true,
    slideAlign: ['start', 'center'],
    minItemWidth: 130,
    maxItemWidth: 180,
    minVisibleCount: 3,
    maxVisibleCount: 5,
    peek: 0,
    outsetArrows: true
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
      <StreamGallery ref={ref} {...props} />
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
    extraSpace,
    controls,
    loop,
    snap,
    slideAlign,
    minItemWidth,
    maxItemWidth,
    minVisibleCount,
    maxVisibleCount,
    peek,
    outsetArrows
  }
) => {
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
