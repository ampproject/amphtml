
/*
TODO:
 [done] Simple values
 - Computed values
 - Pseudo-nodes
 - Non-critical path scheduling for discovery, computations
 - waitFor (util)
 - subscribeToMany (util)
 - Disconnection logic
 - Can disconnection logic be done on a subscribeToMany?
*/


function scheduler() {

  /**
   * ttl:
   * - 0 - asap
   * - 1 - microtask
   * - 2 - macrotask
   */

  const tasks = [];
  const ttls = [];

  const microtask = Promise.resolve();
  const schedulersAtTtl = [
    null, // No scheduler for a processing queue.
    oneAtATime(() => process(1), (callback) => microtask.then(callback)),
    oneAtATime(() => process(2), (callback) => setTimeout(callback)),
  ];

  let absTtl = 0;
  let processing = false;

  /**
   * @param {Function} task
   * @param {number} ttl
   */
  const scheduleTask = (task, ttl) => {
    if (tasks.indexOf(task) != -1) {
      return;
    }

    ttl = Math.min(Math.max(ttl, 0), 2);

    if (ttl == 0) {
      tasks.unshift(task);
      ttls.unshift(absTtl);
    } else {
      task.push(task);
      ttls.push(absTtl + ttl);
    }
    schedulePass(ttl);
  };

  /**
   * @param {number} ttl
   */
  const schedulePass = (ttl) => {
    if (ttl == 0 && processing) {
      // Do nothing.
      return;
    }
    // No processing right now. We need to at least schedule a microtask.
    ttl = Math.min(ttl, 1);
    schedulersAtTtl[ttl]();
  };

  const process = (maxTtl) => {
    processing = true;
    while (ttls.length > 0 && ttls[0].ttl <= maxTtl) {
      const task = tasks.shift();
      ttls.shift();
      try {
        task();
      } catch (e) {
        setTimeout(() => {throw e;});
      }
    }
    processing = false;
  };

  return scheduleTask;
}


/**
 * Creates a function that executes the callback based on the scheduler, but
 * only one task at a time.
 * @param {function()} handler
 * @param {?function(!Function)} defaultScheduler
 * @return {function(function(!Function))}
 */
function oneAtATime(handler, defaultScheduler = null) {
  let scheduled = false;
  const handleAndUnschedule = () => {
    scheduled = false;
    handler();
  };
  const scheduleIfNotScheduled = (scheduler) => {
    if (!scheduled) {
      scheduled = true;
      (scheduler || defaultScheduler)(handleAndUnschedule);
    }
  };
  return scheduleIfNotScheduled;
}



function AmpElement_enhanceWithMeasurement(contextNode) {

  contextNode.provide(Renderable, {
    deps: [Measure],
    compute(contextNode, input, measure) {
      if (!input) {
        return false;
      }
      return measure(contextNode.element)
        .then((width, height) => width > 0 && height > 0);
    },
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
