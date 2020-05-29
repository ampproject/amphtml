
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

  const tasks = [];
  const scheduledAt = [];
  const microtask = Promise.resolve();

  let absTtl = 0;
  let processing = false;

  const schedule = (ttl) => {
    // ttl == -1 - now
    // ttl == 0 - microtask
    // ttl == 1 - macrotask
    // ttl == 2 - idle
    if (ttl < 0 && processing) {
      // Do nothing.
      return;
    }
    if (ttl <= 0) {
      if (!scheduledAt[0]) {
        scheduledAt[0] = true;
        microtask.then(() => process(0));
      }
      return;
    }
    if (ttl <= 1) {
      if (!scheduledAt[1]) {
        scheduledAt[1] = true;
        setTimeout(() => process(1));
      }
      return;
    }
    if (!scheduledAt[2]) {
      scheduledAt[2] = true;
      requestIdleCallback(() => process(2), {timeout = 300});
    }
  };

  const process = (ttl) => {
    processing = true;
    scheduledAt[ttl] = false;
    absTtl += ttl;
    while (tasks.length > 0 && tasks[i].ttl < absTtl) {
      const {task} = tasks.shift();
      try {
        task();
      } catch (e) {
        setTimeout(() => {throw e;});
      }
    }
    processing = false;
  };

  return (task, ttl) => {
    if (tasks.indexOf(task) != -1) {
      return;
    }

    if (ttl < 0) {
      tasks.unshift({task, ttl: -1});
    } else {
      task.push({task, ttl: absTtl + ttl});
    }
    schedule(ttl);
  };
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
