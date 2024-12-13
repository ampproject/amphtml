import {mount} from 'enzyme';

import * as Preact from '#preact';
import {createRef} from '#preact';

import {installResizeObserverStub} from '#testing/resize-observer-stub';

import {BentoPanZoom} from '../component-ts';
import {usePanZoomState} from '../hooks/usePanZoomState';

describes.sandboxed('BentoPanZoom preact component v1.0', {}, (env) => {
  const {containerBox, contentBox, views} = getTestDimensions();

  const DummyContents = () => (
    <article style={{width: contentBox.width, height: contentBox.height}} />
  );

  const findContentContainer = (wrapper) =>
    wrapper.find('[data-test-id="content-container"]');
  const findContent = (wrapper) => wrapper.find('[data-test-id="content"]');
  const getContentTransform = (wrapper) =>
    findContent(wrapper).prop('style').transform;
  const findContainer = (wrapper) => wrapper.find('[data-test-id="container"]');

  let resizeObserverStub;
  beforeEach(() => {
    resizeObserverStub = installResizeObserverStub(env.sandbox, window);
  });
  const triggerResize = (wrapper) => {
    const container = findContainer(wrapper).getDOMNode();
    const contentContainer = findContentContainer(wrapper).getDOMNode();
    env.sandbox.stub(container, 'getBoundingClientRect').returns(containerBox);
    env.sandbox
      .stub(contentContainer, 'getBoundingClientRect')
      .returns(contentBox);

    resizeObserverStub.notifySync({target: container});
  };

  it('should render children and a zoom button', () => {
    const wrapper = mount(
      <BentoPanZoom>
        <DummyContents />
      </BentoPanZoom>
    );

    const component = wrapper.find(BentoPanZoom);
    expect(component).to.have.lengthOf(1);
    expect(component.find(DummyContents)).to.have.lengthOf(1);
    expect(component.find('button')).to.have.lengthOf(1);
  });

  it('clicking the zoom button should zoom the contents in a loop', () => {
    const wrapper = mount(
      <BentoPanZoom>
        <DummyContents />
      </BentoPanZoom>
    );

    // Without mocking out a lot of browser APIs, we can't assert very much:
    wrapper.find('button').simulate('click');
    expect(getContentTransform(wrapper)).to.include('scale(2)');
    wrapper.find('button').simulate('click');
    expect(getContentTransform(wrapper)).to.include('scale(3)');
    // It should "loop" around once the max is reached:
    wrapper.find('button').simulate('click');
    expect(getContentTransform(wrapper)).to.include('scale(1)');
  });

  describe('ref api', () => {
    it('the "transform" method can be used to zoom/scale', () => {
      const ref = createRef();
      const wrapper = mount(
        <BentoPanZoom ref={ref}>
          <DummyContents />
        </BentoPanZoom>
      );

      expect(Object.keys(ref.current)).to.deep.equal(['transform']);
      expect(ref.current.transform).to.be.a('function');

      const newZoom = {
        x: 0,
        y: 0,
        scale: 3,
      };
      ref.current.transform(newZoom.scale, newZoom.x, newZoom.y);
      wrapper.update();

      expect(getContentTransform(wrapper)).to.equal(
        `translate(0px, 0px)scale(3)`
      );
    });
  });

  describe('maxScale', () => {
    it('cannot be zoomed past maxScale', () => {
      const wrapper = mount(
        <BentoPanZoom maxScale={6}>
          <DummyContents />
        </BentoPanZoom>
      );
      wrapper.find('button').simulate('click');
      expect(getContentTransform(wrapper)).to.include('scale(2)');
      wrapper.find('button').simulate('click');
      expect(getContentTransform(wrapper)).to.include('scale(3)');
      wrapper.find('button').simulate('click');
      expect(getContentTransform(wrapper)).to.include('scale(4)');
      wrapper.find('button').simulate('click');
      expect(getContentTransform(wrapper)).to.include('scale(5)');
      wrapper.find('button').simulate('click');
      expect(getContentTransform(wrapper)).to.include('scale(6)');
      // It should "loop" around once the max is reached:
      wrapper.find('button').simulate('click');
      expect(getContentTransform(wrapper)).to.include('scale(1)');
    });
  });

  describe('usePanZoomState', () => {
    // Returns named values, instead of the array, for easier testing:
    const usePanZoomStateTest = () => {
      const [state, actions] = usePanZoomState({});
      return {state, actions};
    };

    const bounds = ({containerSize, contentSize}) => ({
      containerSize,
      contentSize,
      // Initial layout is centered in the container:
      contentOffset: {
        x: (containerSize.width - contentSize.width) / 2,
        y: (containerSize.height - contentSize.height) / 2,
      },
    });
    const boundsDefault = bounds({
      containerSize: {width: 1000, height: 800},
      contentSize: {width: 1000, height: 800},
    });
    const boundsSmallContent = bounds({
      containerSize: {width: 1000, height: 800},
      contentSize: {width: 500, height: 500},
    });
    const boundsLargeContent = bounds({
      containerSize: {width: 1000, height: 800},
      contentSize: {width: 2000, height: 2000},
    });

    it('should return an initial state and an actions bucket', () => {
      const {result} = renderHook(usePanZoomStateTest);
      expect(result.current.state).to.deep.equal({
        posX: 0,
        posY: 0,
        minScale: 1,
        maxScale: 3,
        scale: 1,
        contentOffset: {x: 0, y: 0},
        containerSize: {width: 0, height: 0},
        contentSize: {width: 0, height: 0},
        isDragging: false,
        allowExtent: false,
      });
      expect(JSON.stringify(Object.keys(result.current.actions))).to.deep.equal(
        JSON.stringify([
          'updateBounds',
          'draggingStart',
          'draggingRelease',
          'updateScale',
          'transform',
        ])
      );
    });

    describe('dragging', () => {
      it('calling an action should update the state', () => {
        const {act, result} = renderHook(usePanZoomStateTest);
        expect(result.current.state.isDragging).to.equal(false);

        act(() => result.current.actions.draggingStart());

        expect(result.current.state.isDragging).to.equal(true);

        act(() => result.current.actions.draggingRelease());

        expect(result.current.state.isDragging).to.equal(false);
      });
    });

    describe('transform', () => {
      it('should update the state', () => {
        const {act, result} = renderHook(usePanZoomStateTest);
        act(() => result.current.actions.updateBounds(boundsDefault));

        act(() =>
          result.current.actions.transform({
            posX: -100,
            posY: -100,
            scale: 2,
          })
        );

        expectPartialEqual(result.current.state, {
          posX: -100,
          posY: -100,
          scale: 2,
        });
      });

      function testBounds({bounds, scale = 1}) {
        const {act, result} = renderHook(usePanZoomStateTest);
        act(() => result.current.actions.updateBounds(bounds));

        act(() =>
          result.current.actions.transform({
            posX: 9999999,
            posY: 9999999,
            scale,
          })
        );
        // Grab the top=left bounds:
        const {posX: maxX, posY: maxY} = result.current.state;

        act(() =>
          result.current.actions.transform({
            posX: -9999999,
            posY: -9999999,
            scale,
          })
        );
        // Grab the bottom-right bounds:
        const {posX: minX, posY: minY} = result.current.state;

        return {minX, maxX, minY, maxY};
      }

      it('should "cover" for large contents', () => {
        const actualBounds = testBounds({
          bounds: boundsLargeContent,
        });

        expect(actualBounds).to.deep.equal({
          minX: -500,
          maxX: 500,
          minY: -600,
          maxY: 600,
        });
      });
      it('should "cover" for zoomed-in contents', () => {
        const actualBounds = testBounds({
          bounds: boundsSmallContent,
          scale: 4,
        });

        expect(actualBounds).to.deep.equal({
          minX: -1250,
          maxX: -750,
          minY: -1150,
          maxY: -450,
        });
      });
      it('should "contain" for small contents', () => {
        const actualBounds = testBounds({
          bounds: boundsSmallContent,
        });

        expect(actualBounds).to.deep.equal({
          minX: -250,
          maxX: 250,
          minY: -150,
          maxY: 150,
        });
      });
      it('should "contain" for zoomed-out contents', () => {
        const actualBounds = testBounds({
          bounds: boundsLargeContent,
          scale: 0.25,
        });

        expect(actualBounds).to.deep.equal({
          minX: -500,
          maxX: 500,
          minY: -600,
          maxY: 600,
        });
      });
    });

    describe('updateScale', () => {
      it('should zoom from top-left corner', () => {
        const {act, result} = renderHook(usePanZoomStateTest);
        act(() => result.current.actions.updateBounds(boundsDefault));

        act(() =>
          result.current.actions.updateScale({
            anchorX: 0,
            anchorY: 0,
            scale: 2,
          })
        );
        expectPartialEqual(result.current.state, {
          posX: 0,
          posY: 0,
          scale: 2,
        });
      });
      it('should zoom from the center', () => {
        const {act, result} = renderHook(usePanZoomStateTest);
        act(() => result.current.actions.updateBounds(boundsDefault));

        act(() =>
          result.current.actions.updateScale({
            scale: 2,
          })
        );
        expectPartialEqual(result.current.state, {
          posX: -500,
          posY: -400,
          scale: 2,
        });
      });
      it('should zoom from the bottom-right corner', () => {
        const {act, result} = renderHook(usePanZoomStateTest);
        act(() => result.current.actions.updateBounds(boundsDefault));

        act(() =>
          result.current.actions.updateScale({
            anchorX: 1000,
            anchorY: 800,
            scale: 2,
          })
        );
        expectPartialEqual(result.current.state, {
          posX: -1000,
          posY: -800,
          scale: 2,
        });
      });
      it('should zoom from an arbitrary spot', () => {
        const {act, result} = renderHook(usePanZoomStateTest);
        act(() => result.current.actions.updateBounds(boundsDefault));

        act(() =>
          result.current.actions.updateScale({
            anchorX: 200,
            anchorY: 200,
            scale: 2,
          })
        );
        expectPartialEqual(result.current.state, {
          posX: -200,
          posY: -200,
          scale: 2,
        });
      });
      it('should zoom from multiple arbitrary spots', () => {
        const {act, result} = renderHook(usePanZoomStateTest);
        act(() => result.current.actions.updateBounds(boundsDefault));

        act(() =>
          result.current.actions.updateScale({
            anchorX: 200,
            anchorY: 200,
            scale: 2,
          })
        );
        expectPartialEqual(result.current.state, {
          posX: -200,
          posY: -200,
          scale: 2,
        });

        // Zoom again from a new spot:
        act(() =>
          result.current.actions.updateScale({
            anchorX: 500,
            anchorY: 500,
            scale: 3,
          })
        );
        expectPartialEqual(result.current.state, {
          posX: -550,
          posY: -550,
          scale: 3,
        });
      });
    });
  });

  describe('gestures', () => {
    let wrapper;
    let gesture;
    beforeEach(() => {
      wrapper = mount(
        <BentoPanZoom>
          <DummyContents />
        </BentoPanZoom>
      );

      triggerResize(wrapper);

      const container = findContainer(wrapper);
      gesture = new GestureSimulator(container, env.sandbox);
    });

    it('should start with scale(1)', () => {
      expect(getContentTransform(wrapper)).to.include('scale(1)');
    });
    describe('doubleTap', () => {
      it('single taps should do nothing', () => {
        gesture.pointerDown();
        gesture.pointerUp();
        expect(getContentTransform(wrapper)).to.include('scale(1)');
      });
      it('double tap should zoom in', () => {
        gesture.pointerDown();
        gesture.pointerUp();

        gesture.pointerDown();
        gesture.pointerUp();

        expect(getContentTransform(wrapper)).to.include('scale(2)');
      });
      it('double taps are registered within 10px', () => {
        gesture.pointerDown();
        gesture.pointerMove({deltaX: 9, deltaY: 9});
        gesture.pointerUp();

        gesture.pointerDown();
        gesture.pointerMove({deltaX: -9, deltaY: -9});
        gesture.pointerUp();
        expect(getContentTransform(wrapper)).to.include('scale(2)');
      });
      it('double taps are not registered outside 10px', () => {
        gesture.pointerDown();
        gesture.pointerMove({deltaX: 99, deltaY: 99});
        gesture.pointerUp();

        gesture.pointerDown();
        gesture.pointerMove({deltaX: -99, deltaY: -99});
        gesture.pointerUp();
        expect(getContentTransform(wrapper)).to.include('scale(1)');
      });
      it('each double-tap will zoom in again', () => {
        gesture.doubleTap();
        expect(getContentTransform(wrapper)).to.include('scale(2)');

        gesture.doubleTap();
        expect(getContentTransform(wrapper)).to.include('scale(3)');

        gesture.doubleTap();
        expect(getContentTransform(wrapper)).to.include('scale(1)');
      });
      it('zooms in on topLeft', () => {
        gesture.doubleTap(views.topLeft);
        gesture.doubleTap(views.topLeft);
        expect(getContentTransform(wrapper)).to.equal(
          'translate(-750px, -600px)scale(3)'
        );
      });
      it('zooms in on middle', () => {
        gesture.doubleTap(views.middle);
        gesture.doubleTap(views.middle);
        expect(getContentTransform(wrapper)).to.equal(
          'translate(-1000px, -800px)scale(3)'
        );
      });
      it('zooms in on bottomRight', () => {
        gesture.doubleTap(views.bottomRight);
        gesture.doubleTap(views.bottomRight);
        expect(getContentTransform(wrapper)).to.equal(
          'translate(-1250px, -1000px)scale(3)'
        );
      });
    });

    it('cannot be dragged when not scaled', () => {
      gesture.pointerDown();
      gesture.pointerMove({deltaX: 11, deltaY: 11});
      gesture.pointerUp();

      gesture.pointerDown();
      gesture.pointerMove({deltaX: -11, deltaY: -11});
      gesture.pointerUp();
      expect(getContentTransform(wrapper)).to.equal(
        'translate(0px, 0px)scale(1)'
      );
    });
    describe('dragging', () => {
      beforeEach(() => {
        // Zoom in twice, so we can drag:
        gesture.doubleTap(views.middle);
        gesture.doubleTap(views.middle);
      });

      it('must be zoomed in first', () => {
        expect(getContentTransform(wrapper)).to.include(
          'translate(-1000px, -800px)'
        );
      });

      it('should be able to drag', () => {
        gesture.drag([
          {deltaX: -50, deltaY: -50},
          {deltaX: -50, deltaY: -50},
        ]);

        expect(getContentTransform(wrapper)).to.include(
          'translate(-1090px, -890px)'
        );
      });
    });
  });
});

function getTestDimensions() {
  // We will simulate the layout of the DOM.
  // The container is a 1000x800 box.
  // The contents is a 500x400 box, centered.

  const offset = {x: 100, y: 100};
  const containerBox = {
    width: 1000,
    height: 800,
    ...offset,
  };
  const contentBox = {
    width: 500,
    height: 400,
    x: offset.x + (containerBox.width - 500) / 2,
    y: offset.y + (containerBox.height - 400) / 2,
  };

  const views = {
    topLeft: {
      clientX: containerBox.x,
      clientY: containerBox.y,
    },
    topLeftContent: {
      clientX: contentBox.x,
      clientY: contentBox.y,
    },
    middle: {
      clientX: contentBox.x + contentBox.width / 2,
      clientY: contentBox.y + contentBox.height / 2,
    },
    bottomRightContent: {
      clientX: contentBox.x + contentBox.width,
      clientY: contentBox.y + contentBox.height,
    },
    bottomRight: {
      clientX: containerBox.x + containerBox.width,
      clientY: containerBox.y + containerBox.height,
    },
  };

  return {containerBox, contentBox, views};
}

/**
 * Asserts that the object matches the expected properties
 *
 * @param {T} actual
 * @param {Partial<T>>} expectedPartial
 * @template T
 */
function expectPartialEqual(actual, expectedPartial) {
  const actualPartial = Object.keys(expectedPartial).reduce((result, key) => {
    result[key] = actual[key];
    return result;
  }, {});
  expect(actualPartial).to.deep.equal(expectedPartial);
}

/**
 * Similar to @testing-library/react-hooks, except works with Enzyme.
 *
 * Renders a hook.
 * Anything that should trigger a render should be wrapped in `act(() => ...)`
 * The latest return value of the hook will be stored in `result.current`
 */
function renderHook(hook, {initialProps = {}} = {}) {
  const result = {current: null};
  const Component = (props) => {
    result.current = hook(props);
    return null;
  };

  const component = mount(<Component {...initialProps} />);
  const rerender = (newProps = {}) => {
    component.setProps(newProps);
  };
  const act = (callback) => {
    callback();
    rerender();
  };

  return {
    result,
    rerender,
    act,
  };
}

class GestureSimulator {
  constructor(wrapper, sandbox) {
    this.wrapper = wrapper;
    this.clientX = 0;
    this.clientY = 0;
    this.pointerId = 1;
    this.createStubs_(sandbox);
  }
  createStubs_(sandbox) {
    sandbox.stub(Element.prototype, 'setPointerCapture');
    sandbox.stub(Element.prototype, 'releasePointerCapture');
    sandbox.stub(Element.prototype, 'hasPointerCapture');
  }
  createEvent_() {
    return {...this};
  }
  update(options) {
    if (!options) {
      return;
    }
    if (options.clientX) {
      this.clientX = options.clientX;
    }
    if (options.clientY) {
      this.clientY = options.clientY;
    }
    if (options.deltaX) {
      this.clientX += options.deltaX;
    }
    if (options.deltaY) {
      this.clientY += options.deltaY;
    }
  }
  pointerDown(options) {
    this.update(options);

    this.wrapper.simulate('pointerdown', this.createEvent_());
    this.wrapper.update();
  }
  pointerMove(options) {
    this.update(options);

    this.wrapper.simulate('pointermove', this.createEvent_());
    this.wrapper.update();
  }
  pointerUp(options) {
    this.update(options);

    this.wrapper.simulate('pointerup', this.createEvent_());
    this.wrapper.update();
  }
  doubleTap(options) {
    this.update(options);

    this.pointerDown();
    this.pointerUp();
    this.pointerDown();
    this.pointerUp();
  }
  drag(points) {
    this.pointerDown();
    points.forEach((point) => {
      this.pointerMove(point);
    });
    this.pointerUp();
  }
}
