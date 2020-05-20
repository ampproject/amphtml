
import {ContextNode} from '../../../src/context';
import {AmpContext} from '../../../src/preact/context';
import {Deferred} from '../../../src/utils/promise';

export function installRootServices(ampdoc) {
  console.log('RootServices: init');
  const contextRoot = ContextNode.get(ampdoc.getRootNode());

  // Visibility.
  setRootVisibility(contextRoot, ampdoc.getVisibilityState());
  ampdoc.onVisibilityChanged(() => setRootVisibility(contextRoot, ampdoc.getVisibilityState()));

  // Base URI.
  // <BaseURI.Provider value={ampdoc.getUrl()}>
  contextRoot.set('baseURI', ampdoc.getUrl());

  // Measure renderability.
  /*
    function RenderableMeasurerProvider({children}) {
      const measureSize = useContext(SizeMeasurer);
      const measureRenderable = (node) => measureSize(node);
      return <RenderableMeasurer.Provider value={measureRenderable}>{children}</>;
    }
   */
  contextRoot.setSubtree(
    RenderableMeasurer,
    {
      deps: [SizeMeasurer],

      value(contextNode) {
        const measureSize = contextNode.get(SizeMeasurer);
        return measureSize(contextNode)
          .then(({width, height}) => width > 0 && height > 0);
      },
    });
}

function setRootVisibility(contextRoot, visibilityState) {
  const isVisible = visibilityState == 'visible';
  console.log('RootServices: setRootVisibility:', visibilityState, isVisible);

  // <RootVisibility.Provider value={visibilityState}>
  contextRoot.set(RootVisibility, visibilityState);

  // <Renderable.Provider value={isVisible}>
  contextRoot.set(Renderable, isVisible);

  contextRoot.set(AmpContext, {
    renderable: isVisible,
    playable: isVisible,
  });
}

/** @type {!ContextType<VisibilityState>} */
export const RootVisibility = contextType('RootVisibility');

/**
 * QQQQQQ: does reduceParentPath() give us what we want?
 *
 * Lightbox:
 * - ContextNode(this.element).set(Renderable, false);
 * - onOpen: .set(Renderable, true);
 *
 * Random node:
 * - Any parent is known to be `Renderable=false` -> false.
 * - Measure. If `!displayed` -> false.
 *
 */

// QQQQQ: difference between an inputValue and a outputValue.
// - No calculator: outputValue == inputValue.
// - Calculator: outputValue = calculate(inputValue)
// - Kind of like input props => context value
/*
  function ContextProvider({props}) {
    const dep1 = useContext(Dep1);
    return <Context.Provider value={dep1(props)}>...</>
  }
 */

/*
  const Renderable = createContext(Renderable, true);

  function Parent(props) {
    return <Renderable.Provider value={compute(props)}>{children}</>
  }

  ...

  function Child(props) {
    const renderable = useRenderable(Renderable);
    if (!renderable) {
      return false;
    }
  }

  // Input (props) vs output (value):
  node.set(Renderable, false)
    node.get(Renderable) -> false

  node.set(Renderable, true)
    node.get(Renderable) -> compute(): path + measurer
 */
/** @type {!ContextType<boolean>} */
const Renderable = contextType(
  'Renderable',
  {
    deps: [RenderableMeasurer],

    value(contextNode) {

      // If any node in the parent hierarchy is known to be not renderable,
      // then this node is definitely not renderable. We save on a measurement
      // by existing immediately.
      const isParentRenderable =
        reducePath(
          contextNode,
          Renderable,
          (acc, value) => acc && value || null
        );
      if (!isParentRenderable) {
        return false;
      }

      // Measure to be certain it's actually displayed.
      const measureRenderable = contextNode.get(RenderableMeasurer);
      return measureRenderable(contextNode);
    },
  });

const RenderableMeasurer = contextType(
  'RenderableMeasurer',
  function() {
    return true;
  },
);

class SizeMeasurerImpl {
  constructor() {
    this.scheduled_ = typeof WeakMap == 'function' ? new WeakMap() : new Map();
    this.io_ = new IntersectionObserver((records) => {
      for (let i = records.length - 1; i >= 0; i--) {
        const {target, boundingClientRect: {width, height}} = records[i];
        const deferred = this.scheduled_.get(target);
        if (deferred) {
          deferred.resolve({width, height});
          this.scheduled_.delete(target);
          this.io_.unobserve(target);
        }
      }
    });
  }

  dispose() {
    this.io_.disconnect();
  }

  // QQQQ: {value, dispose} approach?
  value(contextNode) {
    const node = contextNode.getNode();
    let deferred = this.scheduled_.get(node);
    if (!deferred) {
      deferred = new Deferred();
      this.scheduled_.set(node, deferred);
      this.io_.observe(node);
    }
    return deferred.promise;
  }
}

function QQQQ_SizeMeasurerFactory(contextNode, onDispose) {
  const scheduled = typeof WeakMap == 'function' ? new WeakMap() : new Map();
  const io = new IntersectionObserver((records) => {
    for (let i = records.length - 1; i >= 0; i--) {
      const {target, boundingClientRect: {width, height}} = records[i];
      const deferred = scheduled.get(target);
      if (deferred) {
        deferred.resolve({width, height});
        scheduled.delete(target);
        io.unobserve(target);
      }
    }
  });

  const dispose = () => {
    io.disconnect();
  };

  const value = (node) => {
    let deferred = this.scheduled_.get(node);
    if (!deferred) {
      deferred = new Deferred();
      this.scheduled_.set(node, deferred);
      this.io_.observe(node);
    }
    return deferred.promise;
  };

  return {value, dispose};
}

const SizeMeasurer = contextType(
  'SizeMeasurer',
  {
    defaultRootFactory: SizeMeasurerImpl,
  });

// QQQQ
function reducePath() {}
