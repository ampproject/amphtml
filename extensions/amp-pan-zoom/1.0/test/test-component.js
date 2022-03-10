import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoPanZoom} from '../component-ts';
import {usePanZoomState} from '../hooks/usePanZoomState';

describes.sandboxed('BentoPanZoom preact component v1.0', {}, (unusedEnv) => {
  const Contents = () => <article style={{width: 200, height: 100}} />;
  const getParentStyle = (wrapper) =>
    wrapper.find(Contents).parent().prop('style');

  it('should render children and a zoom button', () => {
    const wrapper = mount(
      <BentoPanZoom>
        <Contents />
      </BentoPanZoom>
    );

    const component = wrapper.find(BentoPanZoom);
    expect(component).to.have.lengthOf(1);
    expect(component.find(Contents)).to.have.lengthOf(1);
    expect(component.find('button')).to.have.lengthOf(1);
  });

  it('clicking the zoom button should zoom the contents in a loop', () => {
    const wrapper = mount(
      <BentoPanZoom>
        <Contents />
      </BentoPanZoom>
    );

    // Without mocking out a lot of browser APIs, we can't assert very much:
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(2)');
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(3)');
    // It should "loop" around once the max is reached:
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(1)');
  });

  it('maxScale can be used', () => {
    const wrapper = mount(
      <BentoPanZoom maxScale={6}>
        <Contents />
      </BentoPanZoom>
    );
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(2)');
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(3)');
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(4)');
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(5)');
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(6)');
    // It should "loop" around once the max is reached:
    wrapper.find('button').simulate('click');
    expect(getParentStyle(wrapper).transform).to.include('scale(1)');
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
        isPannable: false,
        canZoom: true,
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
});

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
