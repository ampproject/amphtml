/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {ContextNode} from '../../../src/context/node';
import {contextProp} from '../../../src/context/prop';
import {
  removeComponent,
  setComponent,
  subscribe,
  unsubscribe,
} from '../../../src/context/component-install';
import {
  useDisposableMemo,
  useMemo,
  useRef,
  useSyncEffect,
} from '../../../src/context/component-hooks';
import {withMetaData} from '../../../src/context/component-meta';

const NonRecursive = contextProp('NonRecursive');

const Concat = contextProp('Concat', {
  needsParent: true,
  compute: (contextNode, inputs, parentValue) =>
    `${parentValue}${inputs.join('|')}`,
  defaultValue: '',
});

describes.realWin('ContextNode - components', {}, (env) => {
  let sandbox;
  let win, doc;
  let tree;
  let clock;
  let discoverWrapper;

  beforeEach(() => {
    sandbox = env.sandbox;
    win = env.win;
    doc = win.document;
    clock = sandbox.useFakeTimers();

    tree = createSubtree('T', 4, 4);

    discoverWrapper = wrapper(ContextNode.prototype, 'discover_');

    // Customize output of the ContextNode for easy debug.
    ContextNode.prototype.inspect = function () {
      const contextNode = this;
      return `ContextNode(${contextNode.node.id || contextNode.node.nodeName})`;
    };
  });

  afterEach(() => {
    delete ContextNode.prototype.inspect;
  });

  function createSubtree(id, children, depth) {
    const el = doc.createElement('div');
    el.id = id;
    el.textContent = id;
    if (depth > 1) {
      for (let i = 0; i < children; i++) {
        const child = createSubtree(`${id}-${i + 1}`, children, depth - 1);
        el.appendChild(child);
      }
    }
    return el;
  }

  function el(id) {
    if (id == 'T') {
      return tree;
    }
    const found = tree.querySelector(`#${id}`);
    if (!found) {
      throw new Error(`element not found ${id}`);
    }
    return found;
  }

  /**
   * @param {Object} obj
   * @param {string} name
   */
  function wrapper(obj, name) {
    const original = obj[name];
    const stub = env.sandbox.stub(ContextNode.prototype, name);
    const wrapperName = `__wrapper_${name}`;
    stub.callsFake(function (...args) {
      const obj = this;
      const resolvers = obj[wrapperName] ?? (obj[wrapperName] = []);
      const result = original.apply(this, args);
      const current = resolvers.slice(0);
      resolvers.length = 0;
      current.forEach((resolver) => resolver(result));
      return result;
    });
    return {
      spy: stub,
      waitFor: (obj) => {
        const resolvers = obj[wrapperName] ?? (obj[wrapperName] = []);
        return new Promise((resolve) => {
          resolvers.push(resolve);
        });
      },
    };
  }

  function waitForDiscover(...nodesOrContextNodes) {
    const contextNodes = nodesOrContextNodes.map((arg) =>
      arg.nodeType ? ContextNode.get(arg) : arg
    );
    const promises = contextNodes.map((contextNode) =>
      discoverWrapper.waitFor(contextNode)
    );
    clock.tick(1);
    return Promise.all(promises);
  }

  function rediscover(...nodesOrContextNodes) {
    const contextNodes = nodesOrContextNodes.map((arg) =>
      arg.nodeType ? ContextNode.get(arg) : arg
    );
    contextNodes.forEach((cn) => cn.discover());
    return waitForDiscover.apply(null, contextNodes);
  }

  describe('connected', () => {
    let sibling1;
    let sibling2;
    let cousin1;
    let parent;
    let grandparent;

    beforeEach(async () => {
      doc.body.appendChild(tree);
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      parent = ContextNode.get(el('T-1-1'));
      grandparent = ContextNode.get(el('T-1'));
      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);
    });

    describe('component', () => {
      let Component1, component1Spy;
      let ComponentWithDeps, componentWithDepsSpy;
      let ComponentWithCleanup, componentWithCleanupSpy, cleanupSpy;

      beforeEach(() => {
        component1Spy = sandbox.spy();
        Component1 = withMetaData([], component1Spy);

        componentWithDepsSpy = sandbox.spy();
        ComponentWithDeps = withMetaData(
          [NonRecursive, Concat],
          componentWithDepsSpy
        );

        componentWithCleanupSpy = sandbox.spy();
        cleanupSpy = sandbox.spy();
        ComponentWithCleanup = (...args) => {
          componentWithCleanupSpy.apply(null, args);
          return cleanupSpy;
        };
      });

      it('should only call component once w/o input', () => {
        setComponent(parent.node, Component1);
        expect(component1Spy).to.not.be.called;

        clock.runAll();
        expect(component1Spy).to.be.calledOnce.calledWith(
          parent.node,
          undefined
        );

        setComponent(parent.node, Component1);
        clock.runAll();
        expect(component1Spy).to.be.calledOnce; // no changes.
      });

      it('should only call component once per input', () => {
        setComponent(parent.node, Component1, 1);
        clock.runAll();
        expect(component1Spy).to.be.calledOnce.calledWith(parent.node, 1);

        // Rerun the component due to the input change.
        setComponent(parent.node, Component1, 2);
        clock.runAll();
        expect(component1Spy).to.be.calledTwice.calledWith(parent.node, 2);

        // Input didn't change - do not rerun.
        setComponent(parent.node, Component1, 2);
        clock.runAll();
        expect(component1Spy).to.be.calledTwice;
      });

      it('should reconnect component when the node is reconnected', async () => {
        setComponent(parent.node, Component1, 1);
        clock.runAll();
        expect(component1Spy).to.be.calledOnce.calledWith(parent.node, 1);

        parent.node.remove();
        await rediscover(parent);
        clock.runAll();

        setComponent(parent.node, Component1, 2);
        clock.runAll();
        expect(component1Spy).to.be.calledOnce;

        grandparent.node.appendChild(parent.node);
        await rediscover(parent);
        clock.runAll();
        expect(component1Spy).to.be.calledTwice.calledWith(parent.node, 2);
      });

      it('should wait until all deps satisfied', () => {
        setComponent(parent.node, ComponentWithDeps, 1);

        clock.runAll();
        expect(componentWithDepsSpy).to.not.be.called;

        grandparent.values.set(Concat, 'OWNER1', 'A');
        clock.runAll();
        expect(componentWithDepsSpy).to.not.be.called;

        parent.values.set(Concat, 'OWNER1', 'B');
        clock.runAll();
        expect(componentWithDepsSpy).to.not.be.called;

        parent.values.set(NonRecursive, 'OWNER1', 'NR');
        clock.runAll();
        expect(componentWithDepsSpy).to.be.calledOnce.calledWith(
          parent.node,
          1,
          'NR',
          'AB'
        );

        parent.values.remove(NonRecursive, 'OWNER1');
        clock.runAll();
        expect(componentWithDepsSpy).to.be.calledOnce;
      });

      it('should cleanup on input change and removal', () => {
        setComponent(parent.node, ComponentWithCleanup, 1);

        clock.runAll();
        expect(cleanupSpy).to.not.be.called;
        expect(componentWithCleanupSpy).to.be.calledOnce.calledWith(
          parent.node,
          1
        );

        setComponent(parent.node, ComponentWithCleanup, 2);

        clock.runAll();
        expect(cleanupSpy).to.be.calledOnce;
        expect(componentWithCleanupSpy).to.be.calledTwice.calledWith(
          parent.node,
          2
        );
      });

      it('should cleanup on removal', () => {
        setComponent(parent.node, ComponentWithCleanup, 1);

        clock.runAll();
        expect(cleanupSpy).to.not.be.called;
        expect(componentWithCleanupSpy).to.be.calledOnce.calledWith(
          parent.node,
          1
        );

        removeComponent(parent.node, ComponentWithCleanup);
        clock.runAll();
        expect(cleanupSpy).to.be.calledOnce;
        expect(componentWithCleanupSpy).to.be.calledOnce; // no change.
      });

      it('should cleanup on disconnect', async () => {
        setComponent(parent.node, ComponentWithCleanup, 1);

        clock.runAll();
        expect(cleanupSpy).to.not.be.called;
        expect(componentWithCleanupSpy).to.be.calledOnce.calledWith(
          parent.node,
          1
        );

        parent.node.remove();
        await rediscover(parent);

        clock.runAll();
        expect(cleanupSpy).to.be.calledOnce;
        expect(componentWithCleanupSpy).to.be.calledOnce; // no change.
      });
    });

    describe('subscriber', () => {
      let spy;
      let cleanupSpy;
      let subscriber;

      beforeEach(() => {
        spy = sandbox.spy();
        cleanupSpy = sandbox.spy();
        subscriber = (...args) => {
          spy.apply(null, args);
          return cleanupSpy;
        };
      });

      it('should subscribe with a single dep', () => {
        subscribe(parent.node, NonRecursive, subscriber);
        clock.runAll();
        expect(spy).to.not.be.called;
        expect(cleanupSpy).to.not.be.called;

        parent.values.set(NonRecursive, 'OWNER1', 'NR');
        clock.runAll();
        expect(spy).to.be.calledOnce.calledWith('NR');
        expect(cleanupSpy).to.not.be.called;

        // Repeat: no changes.
        parent.values.set(NonRecursive, 'OWNER1', 'NR');
        clock.runAll();
        expect(spy).to.be.calledOnce.calledWith('NR');
        expect(cleanupSpy).to.not.be.called;

        // Change value.
        parent.values.set(NonRecursive, 'OWNER1', 'NR2');
        clock.runAll();
        expect(spy).to.be.calledTwice.calledWith('NR2');
        expect(cleanupSpy).to.be.calledOnce;

        // Remove value.
        parent.values.remove(NonRecursive, 'OWNER1');
        clock.runAll();
        expect(spy).to.be.calledTwice; // no change.
        expect(cleanupSpy).to.be.calledTwice;
      });

      it('should subscribe with multiple deps', () => {
        subscribe(parent.node, [NonRecursive, Concat], subscriber);
        clock.runAll();
        expect(spy).to.not.be.called;
        expect(cleanupSpy).to.not.be.called;

        grandparent.values.set(Concat, 'OWNER1', 'A');
        clock.runAll();
        expect(spy).to.not.be.called;
        expect(cleanupSpy).to.not.be.called;

        parent.values.set(NonRecursive, 'OWNER1', 'NR');
        clock.runAll();
        expect(spy).to.be.calledOnce.calledWith('NR', 'A');
        expect(cleanupSpy).to.not.be.called;

        // Change value.
        parent.values.set(Concat, 'OWNER1', 'B');
        clock.runAll();
        expect(spy).to.be.calledTwice.calledWith('NR', 'AB');
        expect(cleanupSpy).to.be.calledOnce;

        // Remove value.
        parent.values.remove(NonRecursive, 'OWNER1');
        clock.runAll();
        expect(spy).to.be.calledTwice; // no change.
        expect(cleanupSpy).to.be.calledTwice;
      });

      it('should unsubscribe', () => {
        subscribe(parent.node, [NonRecursive], subscriber);
        parent.values.set(NonRecursive, 'OWNER1', 'NR');
        clock.runAll();
        expect(spy).to.be.calledOnce;
        expect(cleanupSpy).to.not.be.called;

        unsubscribe(parent.node, subscriber);
        clock.runAll();
        expect(spy).to.be.calledOnce; // no change.
        expect(cleanupSpy).to.be.calledOnce;

        // Change value.
        parent.values.set(NonRecursive, 'OWNER1', 'NR2');
        clock.runAll();
        expect(spy).to.be.calledOnce; // no change.
        expect(cleanupSpy).to.be.calledOnce; // no change.
      });

      it('should reconnect the subscriber when the node is reconnected', async () => {
        subscribe(parent.node, [NonRecursive], subscriber);
        parent.values.set(NonRecursive, 'OWNER1', 'NR');
        clock.runAll();
        expect(spy).to.be.calledOnce;
        expect(cleanupSpy).to.not.be.called;

        parent.node.remove();
        await rediscover(parent);
        clock.runAll();
        expect(spy).to.be.calledOnce; // no change.
        expect(cleanupSpy).to.be.calledOnce;

        grandparent.node.appendChild(parent.node);
        await rediscover(parent);
        clock.runAll();
        expect(spy).to.be.calledTwice;
        expect(cleanupSpy).to.be.calledOnce; // no change.
      });
    });

    describe('hooks', () => {
      it('should initialize and persist useRef', () => {
        const values = [];
        const Comp = () => {
          const ref = useRef(10);
          ref.current++;
          values.unshift(ref.current);
        };

        // 1st call.
        setComponent(parent.node, Comp, 1);
        clock.runAll();
        expect(values).to.have.length(1);
        expect(values[0]).to.equal(11);

        // 2nd call.
        setComponent(parent.node, Comp, 2);
        clock.runAll();
        expect(values).to.have.length(2);
        expect(values[0]).to.equal(12);
      });

      it('should initialize and persist useMemo', () => {
        const values = [];
        const memoSpy = env.sandbox.spy();
        const Comp = (node, input) => {
          const dep = Math.floor(input / 10);
          const value = useMemo(() => {
            memoSpy();
            return dep;
          }, [dep]);
          values.unshift(value);
        };

        // 1st call.
        setComponent(parent.node, Comp, 1);
        clock.runAll();
        expect(values).to.have.length(1);
        expect(values[0]).to.equal(0);
        expect(memoSpy).to.be.calledOnce;

        // 2nd call: no recompute.
        setComponent(parent.node, Comp, 2);
        clock.runAll();
        expect(values).to.have.length(2);
        expect(values[0]).to.equal(0);
        expect(memoSpy).to.be.calledOnce; // no change.

        // 3rd call: recompute.
        setComponent(parent.node, Comp, 12);
        clock.runAll();
        expect(values).to.have.length(3);
        expect(values[0]).to.equal(1);
        expect(memoSpy).to.be.calledTwice;
      });

      it('should initialize and reuse useDisposableMemo', () => {
        const values = [];
        const initSpy = env.sandbox.spy();
        const disposeSpy = env.sandbox.spy();
        const Comp = (node, input) => {
          const value = useDisposableMemo(() => {
            initSpy(input);
            return {
              value: Math.floor(input / 10),
              dispose: disposeSpy,
            };
          }, [Math.floor(input / 10)]);
          values.unshift(value);
        };

        // 1st call: init.
        setComponent(parent.node, Comp, 1);
        clock.runAll();
        expect(values).to.have.length(1);
        expect(values[0]).to.equal(0);
        expect(initSpy).to.be.calledOnce.calledWith(1);
        expect(disposeSpy).to.not.be.called;

        // 2nd call: reuse.
        setComponent(parent.node, Comp, 2);
        clock.runAll();
        expect(values).to.have.length(2);
        expect(values[0]).to.equal(0);
        expect(initSpy).to.be.calledOnce; // no change.
        expect(disposeSpy).to.not.be.called; // no change.

        // 3rd call: re-init.
        setComponent(parent.node, Comp, 12);
        clock.runAll();
        expect(values).to.have.length(3);
        expect(values[0]).to.equal(1);
        expect(initSpy).to.be.calledTwice.calledWith(12);
        expect(disposeSpy).to.be.calledOnce;

        // Remove.
        removeComponent(parent.node, Comp);
        clock.runAll();
        expect(disposeSpy).to.be.calledTwice;
        expect(values).to.have.length(3); // no change.
        expect(initSpy).to.be.calledTwice; // no change.
      });

      it('should schedule and cleanup useSyncEffect', () => {
        const effectSpy = env.sandbox.spy();
        const cleanupSpy = env.sandbox.spy();
        const Comp = (node, input) => {
          useSyncEffect(() => {
            effectSpy(input);
            return cleanupSpy;
          }, [Math.floor(input / 10)]);
        };

        // 1st call.
        setComponent(parent.node, Comp, 1);
        clock.runAll();
        expect(effectSpy).to.be.calledOnce.calledWith(1);
        expect(cleanupSpy).to.not.be.called;

        // 2nd call: no-op.
        setComponent(parent.node, Comp, 2);
        clock.runAll();
        expect(effectSpy).to.be.calledOnce; // no change.
        expect(cleanupSpy).to.not.be.called; // no change.

        // 3rd call: re-run.
        setComponent(parent.node, Comp, 12);
        clock.runAll();
        expect(effectSpy).to.be.calledTwice.calledWith(12);
        expect(cleanupSpy).to.be.calledOnce;

        // Remove.
        removeComponent(parent.node, Comp);
        clock.runAll();
        expect(cleanupSpy).to.be.calledTwice;
        expect(effectSpy).to.be.calledTwice; // no change.
      });

      it('should schedule and cleanup mount/dismount', () => {
        const effectSpy = env.sandbox.spy();
        const cleanupSpy = env.sandbox.spy();
        const Comp = (node, input) => {
          useSyncEffect(() => {
            effectSpy(input);
            return cleanupSpy;
          });
        };

        // 1st call.
        setComponent(parent.node, Comp, 1);
        clock.runAll();
        expect(effectSpy).to.be.calledOnce.calledWith(1);
        expect(cleanupSpy).to.not.be.called;

        // 2nd call: no-op.
        setComponent(parent.node, Comp, 2);
        clock.runAll();
        expect(effectSpy).to.be.calledOnce; // no change.
        expect(cleanupSpy).to.not.be.called; // no change.

        // Remove.
        removeComponent(parent.node, Comp);
        clock.runAll();
        expect(cleanupSpy).to.be.calledOnce;
        expect(effectSpy).to.be.calledOnce; // no change.
      });
    });
  });
});
