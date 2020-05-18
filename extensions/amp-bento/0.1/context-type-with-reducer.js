
/** @type {!ContextType<boolean>} */
const Renderable = contextType(
  'Renderable',
  {
    defRootValue: true,
    subscribe: [], // Nothing in this case. Otherwise could become a consumer.
    resolveViaPath(contextNode) {
      return reducePathAnd(contextNode, Renderable, (acc, v) => acc && v);
    },
    resolveViaParent(contextNode) {
      const selfValue = contextNode.selfValue(Renderable);
      if (selfValue === false || !context.parent) {
        return selfValue;
      }
      const subtreeValue = contextNode.parent.subtreeValue(Renderable);
      return selfValue && subtreeValue;
    },
    resolveSelfOnly(contextNode) {
      return contextNode.selfValue(Renderable);
    },
  });

function reducePathAnd(contextNode, contextType, reducer) {
  let acc = undefined;
  for (let n = contextNode; n; n = n.parent) {
    // TODO: self and subtree values.
    const selfValue = n.selfValue(contextNode);
    if (selfValue === undefined) {
      continue;
    }
    if (acc === undefined) {
      acc = selfValue;
    } else {
      acc = reducer(acc, selfValue, n);
    }
    if (!acc) {
      // Short-circuit for `and`.
      break;
    }
  }
  return acc ?? null;
}

function nodeApis(contextNode) {

  // Provider structure: {contextType, selfValue, lastComputedValue}

  // Renderable.resolve(selfValue) will compute all values.
  // ~= Renderable.resolve.bind(null, inputValue).
  contextNode.provide(Renderable, false);
  contextNode.provideSubtree(Renderable, false);

  // Does this make sense at all?
  contextNode.provide(Renderable, providerFunction);

  // Simple case.
  contextNode.subscribe(Renderable, consumerFunction);

  // Multi-case.
  contextNode.subscribe([Renderable, Other], (renderable, other) => {
    // The consumerFunction can also be a functional provider.
    contextNode.provide(NewValue, renderable + other);
  });
}

class AmpElement extends HTMLElement {

  connectedCallback() {
    this.contextNode_ = ContextNode.get(this);
    this.contextNode_.provide(LoadState, LoadState.NONE);
    this.contextNode_.discover();  // == ping(Path)
    this.contextNode_.ping(Connected);

    // TODO: scheduleUnload?
    // Does !isDisplayed -> disconnected -> unloaded automatically?
    const Connected = {
      deps: [Measure],

      compute(contextNode, inputValue) {
        if (!inputValue) {
          return false;
        }

        const parentConnected = contextNode.above(Connected);
        if (!parentConnected) {
          return false;
        }

        const measure = contextNode.get(Measure);
        if (measure) {
          return measure(contextNode.node)
            .then(({width, height}) => width > 0 && height > 0);
        }
        return true;
      },
    };

    const Renderable = {
      deps: [Connected],

      compute(contextNode, inputValue) {
        if (!inputValue) {
          return false;
        }

        const parentRenderable = contextNode.above(Renderable);
        if (!parentRenderable) {
          return false;
        }

        return contextNode.get(Connected);
      },
    };

    const Playable = {
      deps: [Playable],

      compute(contextNode, inputValue) {
        if (!inputValue) {
          return false;
        }
        return contextNode.get(Renderable);
      },
    };

    this.contextNode_.subscribe([Renderable, Scheduler, LoadState] =>
      (renderable, loadState, scheduler) => {
        if (renderable && loadState == LoadState.NONE && scheduler) {
          return scheduler.scheduleLoad(this);
        }
      });

    class Scheduler {

      scheduleLoad(element) {}

      scheduleUnload(element) {}

      doLoad_(element) {
        return element.load().finally(() => {
          unschedule(element);
        });
      }
    }
  }

  disconnectedCallback() {
    this.contextNode_.discover(); // == ping(Path)
  }

  load() {
    return this.whenImpl_()
      .then(impl => {
        impl.load();
        return ContextNode.get(this)
          .waitFor(
            LoadState,
            loadState => (loadState === LoadState.LOADED || loadState === LoadState.FAILED)
          );
      })
      .then((loadState) => {
        if (loadState === LoadState.FAILED) {
          throw new Error('loading failed');
        }
      });
  }
}

function waitFor(contextNode, contextType, check) {
  return new Promise((resolve) => {
    const unsub = contextNode.subscribe(contextType, (value) => {
      if (check && check(value) || !check && value !== undefined) {
        resolve(value);
        unsub();
      }
    });
  });
}

class PreactBaseElement {

  load() {
    ContextNode.provide(LoadState, LoadState.LOADING);
  }

  unload() {
    // Maybe LoadState.REQUESTED too.
    ContextNode.provide(LoadState, LoadState.NONE);
  }

  props_() {
    const loadState = ContextNode.get(LoadState);
    const load = (loadState !== LoadState.NONE);
    const onLoad = () => {
      ContextNode.provide(LoadState, LoadState.LOADED);
    };
    const onLoadError = () => {
      ContextNode.provide(LoadState, LoadState.FAILED);
    };
    return {load, onLoad, onLoadError};
  }

}

function AmpImg({src, ...rest}) {
  const [load, onLoad, onLoadError] = useLoader(rest);
  return <img src={load ? src : ''} onLoad={onLoad} onError={onLoadError} />
}

function useLoader({load: loadProp, onLoad, onLoadError}) {
  const loadingContext = useContext(LoadigContext);
  const renderable = useContext(Renderable);
  const load =
    loadProp && loadingContext !== 'disabled' ||
    renderable && loadingContext === 'auto';
  return [load, onLoad, onLoadError];
}

class LoadingIndicatorService {

  constructor(ampdoc) {
    this.ampdoc = ampdoc;
    console.log('LoadingIndicatorService: ', ampdoc);

    this.io_ = new IntersectionObserver(this.handleIntersections_.bind(this));

    this.co_ = new ContextNodeObserver(this.handleContextChanges_.bind(this), {
      contextTypes: [LoadState],
      // Only new nodes are observed.
      add: true,
      remove: false,
      update: false,
    });
    this.co_.observe(ContextNode.get(ampdoc.getRootNode()), true);
  }

  disconnect() {
    this.io_.disconnect();
    this.co_.disconnect();
  }

  /**
   * @param {!Array<!ContextNodeObserverEntryDef>} records
   * @private
   */
  handleContextChanges_(records) {
    console.log('LoadingIndicatorService: contextChanges:', records);

    records.forEach(({contextNode}) => {
      contextNode.subscribe(
        [Renderable, LoadState],
        (renderable, loadState) => {
          const loading =
            loadState === LoadState.NONE ||
            loadState === LoadState.LOADING;
          if (renderable && loading) {
            const element = contextNode.node;
            // TODO: semantics of provide vs set.
            contextNode.provide(LoadingIndicator);
            this.io_.observe(element);
            return () => {
              contextNode.remove(LoadingIndicator, li);
              this.io_.unobserve(element);
            };
          }
        }
      );
    });
  }

  /**
   * @param {!Array<!IntersectionObserverEntry>} records
   * @private
   */
  handleIntersections_(records) {
    console.log('LoadingIndicatorService: intersections:', records);
    records.forEach(({target, isIntersecting}) => {
      const contextNode = ContextNode.get(target);
      const li = contextNode.get(LoadingIndicator);
      if (li) {
        li.toggle(isIntersecting);
      }
    });
  }
}

class LoadingIndicator {

  constructor(contextNode) {
    console.log('LoadingIndicator: constructor:', contextNode);
    this.contextNode_ = contextNode;
  }

  toggle(on) {
    console.log('LoadingIndicator: toggle:', this.contextNode_, on);
    this.contextNode_.getNode().style.border = on ? '4px solid blue' : '';
  }

  dispose() {
    console.log('LoadingIndicator: destroy');
    this.toggle(false);
  }
}
