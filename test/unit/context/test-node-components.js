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
  useRemoveChildComponent,
  useSetChildComponent,
  useSubscribeChild,
  useUnsubscribeChild,
} from '../../../src/context/component-install';
import {
  useDisposableMemo,
  useMemo,
  useRef,
  useRemoveChildProp,
  useSetChildProp,
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

    describe('child props', () => {
      let ComponentSelfProps;
      let ComponentParentProps;
      let sibling1Stub;
      let parentStub;
      let grandparentStub;

      beforeEach(() => {
        ComponentSelfProps = (unusedNode, input) => {
          const setChildProp = useSetChildProp();
          const removeChildProp = useRemoveChildProp();
          if (input) {
            setChildProp(Concat, input);
          } else {
            removeChildProp(Concat);
          }
        };
        ComponentParentProps = (unusedNode, input) => {
          const setChildProp = useSetChildProp();
          const removeChildProp = useRemoveChildProp();
          if (input) {
            setChildProp(Concat, input, parent.node);
          } else {
            removeChildProp(Concat, parent.node);
          }
        };

        sibling1Stub = sandbox.stub();
        parentStub = sandbox.stub();
        grandparentStub = sandbox.stub();
        sibling1.values.subscribe(Concat, sibling1Stub);
        parent.values.subscribe(Concat, parentStub);
        grandparent.values.subscribe(Concat, grandparentStub);
        clock.runAll();
        [sibling1Stub, parentStub, grandparentStub].forEach((stub) => {
          stub.resetHistory();
        });
      });

      it('should set props in components', () => {
        setComponent(grandparent.node, ComponentSelfProps, 'A');
        clock.runAll();
        expect(sibling1Stub).to.be.calledOnce.calledWith('A');
        expect(parentStub).to.be.calledOnce.calledWith('A');
        expect(grandparentStub).to.be.calledOnce.calledWith('A');

        setComponent(grandparent.node, ComponentParentProps, 'B');
        clock.runAll();
        expect(sibling1Stub).to.be.calledTwice.calledWith('AB');
        expect(parentStub).to.be.calledTwice.calledWith('AB');
        expect(grandparentStub).to.be.calledOnce; // no change.
      });

      it('should remove props', () => {
        setComponent(grandparent.node, ComponentSelfProps, 'A');
        setComponent(grandparent.node, ComponentParentProps, 'B');
        clock.runAll();
        expect(sibling1Stub).to.be.calledOnce.calledWith('AB');
        expect(parentStub).to.be.calledOnce.calledWith('AB');
        expect(grandparentStub).to.be.calledOnce.calledWith('A');

        setComponent(grandparent.node, ComponentSelfProps, null);
        clock.runAll();
        expect(sibling1Stub).to.be.calledTwice.calledWith('B');
        expect(parentStub).to.be.calledTwice.calledWith('B');
        expect(grandparentStub).to.be.calledTwice.calledWith('');

        setComponent(grandparent.node, ComponentParentProps, null);
        clock.runAll();
        expect(sibling1Stub).to.be.calledThrice.calledWith('');
        expect(parentStub).to.be.calledThrice.calledWith('');
        expect(grandparentStub).to.be.calledTwice; // no change.
      });

      it('should remove props when component is disconnected', () => {
        setComponent(grandparent.node, ComponentSelfProps, 'A');
        setComponent(grandparent.node, ComponentParentProps, 'B');
        clock.runAll();
        expect(sibling1Stub).to.be.calledOnce.calledWith('AB');
        expect(parentStub).to.be.calledOnce.calledWith('AB');
        expect(grandparentStub).to.be.calledOnce.calledWith('A');

        removeComponent(grandparent.node, ComponentSelfProps);
        clock.runAll();
        expect(sibling1Stub).to.be.calledTwice.calledWith('B');
        expect(parentStub).to.be.calledTwice.calledWith('B');
        expect(grandparentStub).to.be.calledTwice.calledWith('');

        removeComponent(grandparent.node, ComponentParentProps);
        clock.runAll();
        expect(sibling1Stub).to.be.calledThrice.calledWith('');
        expect(parentStub).to.be.calledThrice.calledWith('');
        expect(grandparentStub).to.be.calledTwice; // no change.
      });

      it('should remove props when child node is disconnected', async () => {
        setComponent(grandparent.node, ComponentSelfProps, 'A');
        setComponent(grandparent.node, ComponentParentProps, 'B');
        clock.runAll();
        expect(sibling1Stub).to.be.calledOnce.calledWith('AB');
        expect(parentStub).to.be.calledOnce.calledWith('AB');
        expect(grandparentStub).to.be.calledOnce.calledWith('A');

        parent.node.remove();
        await rediscover(parent);
        clock.runAll();
        expect(grandparent.values.has(Concat)).to.be.true;
        expect(parent.values.has(Concat)).to.be.false;
      });

      it('should remove props when the node is disconnected', async () => {
        setComponent(grandparent.node, ComponentSelfProps, 'A');
        setComponent(grandparent.node, ComponentParentProps, 'B');
        clock.runAll();
        expect(sibling1Stub).to.be.calledOnce.calledWith('AB');
        expect(parentStub).to.be.calledOnce.calledWith('AB');
        expect(grandparentStub).to.be.calledOnce.calledWith('A');

        grandparent.node.remove();
        await rediscover(grandparent);
        clock.runAll();
        expect(grandparent.values.has(Concat)).to.be.false;
        expect(parent.values.has(Concat)).to.be.false;
      });
    });

    describe('child components', () => {
      let ComponentSelfChildren;
      let ComponentParentChildren;
      let ChildComponent, childComponentSpy, childCleanupSpy;

      beforeEach(() => {
        ComponentSelfChildren = (unusedNode, input) => {
          const setChildComponent = useSetChildComponent();
          const removeChildComponent = useRemoveChildComponent();
          if (input) {
            setChildComponent(ChildComponent, input);
          } else {
            removeChildComponent(ChildComponent);
          }
        };
        ComponentParentChildren = (unusedNode, input) => {
          const setChildComponent = useSetChildComponent();
          const removeChildComponent = useRemoveChildComponent();
          if (input) {
            setChildComponent(ChildComponent, input, parent.node);
          } else {
            removeChildComponent(ChildComponent, parent.node);
          }
        };

        childComponentSpy = sandbox.spy();
        childCleanupSpy = sandbox.spy();
        ChildComponent = function (...args) {
          childComponentSpy.apply(null, args);
          useSyncEffect(() => childCleanupSpy);
        };
      });

      it('should set child component', () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        clock.runAll();
        expect(childComponentSpy).to.be.calledOnce.calledWith(
          grandparent.node,
          'A'
        );

        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(childComponentSpy).to.be.calledTwice.calledWith(
          parent.node,
          'B'
        );

        expect(childCleanupSpy).to.not.be.called;
      });

      it('should remove child component', () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        clock.runAll();
        expect(childComponentSpy).to.be.calledOnce.calledWith(
          grandparent.node,
          'A'
        );

        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(childComponentSpy).to.be.calledTwice.calledWith(
          parent.node,
          'B'
        );

        // Null input removes the component.
        setComponent(grandparent.node, ComponentParentChildren, null);
        clock.runAll();
        expect(childComponentSpy).to.be.calledTwice; // no changes.
        expect(childCleanupSpy).to.be.calledOnce;

        setComponent(grandparent.node, ComponentSelfChildren, null);
        clock.runAll();
        expect(childComponentSpy).to.be.calledTwice; // no changes.
        expect(childCleanupSpy).to.be.calledTwice;
      });

      it('should update child component', () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        clock.runAll();
        expect(childComponentSpy).to.be.calledOnce.calledWith(
          grandparent.node,
          'A'
        );

        setComponent(grandparent.node, ComponentSelfChildren, 'B');
        clock.runAll();
        expect(childComponentSpy).to.be.calledTwice.calledWith(
          grandparent.node,
          'B'
        );

        expect(childCleanupSpy).to.not.be.called;
      });

      it('should remove child component on removal', () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(childComponentSpy)
          .to.be.calledTwice.calledWith(grandparent.node, 'A')
          .calledWith(parent.node, 'B');
        expect(childCleanupSpy).to.not.be.called;

        removeComponent(grandparent.node, ComponentSelfChildren);
        clock.runAll();
        expect(childCleanupSpy).to.be.calledOnce;

        removeComponent(grandparent.node, ComponentParentChildren);
        clock.runAll();
        expect(childCleanupSpy).to.be.calledTwice;
      });

      it('should remove component when child node is disconnected', async () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(childComponentSpy)
          .to.be.calledTwice.calledWith(grandparent.node, 'A')
          .calledWith(parent.node, 'B');
        expect(childCleanupSpy).to.not.be.called;

        parent.node.remove();
        await rediscover(parent);
        clock.runAll();
        expect(childComponentSpy).to.be.calledTwice; // no changes.
        expect(childCleanupSpy).to.be.calledOnce;
      });

      it('should remove component when the node is disconnected', async () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(childComponentSpy)
          .to.be.calledTwice.calledWith(grandparent.node, 'A')
          .calledWith(parent.node, 'B');
        expect(childCleanupSpy).to.not.be.called;

        grandparent.node.remove();
        await rediscover(grandparent);
        clock.runAll();
        expect(childComponentSpy).to.be.calledTwice; // no changes.
        expect(childCleanupSpy).to.be.calledTwice;
      });
    });

    describe('child subscriber', () => {
      let ComponentSelfChildren;
      let ComponentParentChildren;
      let subscriber, subscriberSpy, subscriberCleanupSpy;

      beforeEach(() => {
        subscriberSpy = sandbox.spy();
        subscriberCleanupSpy = sandbox.spy();

        subscriber = (...args) => {
          subscriberSpy.apply(null, args);
          return subscriberCleanupSpy;
        };

        ComponentSelfChildren = (unusedNode, input) => {
          const subscribeChild = useSubscribeChild();
          const unsubscribeChild = useUnsubscribeChild();
          if (input) {
            subscribeChild([Concat], subscriber);
          } else {
            unsubscribeChild(subscriber);
          }
        };
        ComponentParentChildren = (unusedNode, input) => {
          const subscribeChild = useSubscribeChild();
          const unsubscribeChild = useUnsubscribeChild();
          if (input) {
            subscribeChild([Concat], subscriber, parent.node);
          } else {
            unsubscribeChild(subscriber, parent.node);
          }
        };

        grandparent.values.set(Concat, 'OWNER1', 'C');
        clock.runAll();
      });

      it('should set child subscriber', () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        clock.runAll();
        expect(subscriberSpy).to.be.calledOnce.calledWith('C');

        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice.calledWith('C');

        expect(subscriberCleanupSpy).to.not.be.called;
      });

      it('should remove child subscriber', () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        clock.runAll();
        expect(subscriberSpy).to.be.calledOnce.calledWith('C');

        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice.calledWith('C');

        // Null input removes the subscriber.
        setComponent(grandparent.node, ComponentParentChildren, null);
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice; // no changes.
        expect(subscriberCleanupSpy).to.be.calledOnce;

        setComponent(grandparent.node, ComponentSelfChildren, null);
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice; // no changes.
        expect(subscriberCleanupSpy).to.be.calledTwice;
      });

      it('should update child subscriber', () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        clock.runAll();
        expect(subscriberSpy).to.be.calledOnce.calledWith('C');

        setComponent(grandparent.node, ComponentSelfChildren, 'B');
        clock.runAll();
        expect(subscriberSpy).to.be.calledOnce; // no changes.
        expect(subscriberCleanupSpy).to.not.be.called;
      });

      it('should remove child subscriber on removal', () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice.calledWith('C');

        removeComponent(grandparent.node, ComponentSelfChildren);
        clock.runAll();
        expect(subscriberCleanupSpy).to.be.calledOnce;

        removeComponent(grandparent.node, ComponentParentChildren);
        clock.runAll();
        expect(subscriberCleanupSpy).to.be.calledTwice;
      });

      it('should remove subscriber when child node is disconnected', async () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice.calledWith('C');
        expect(subscriberCleanupSpy).to.not.be.called;

        parent.node.remove();
        await rediscover(parent);
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice; // no changes.
        expect(subscriberCleanupSpy).to.be.calledOnce;
      });

      it('should remove subscriber when the node is disconnected', async () => {
        setComponent(grandparent.node, ComponentSelfChildren, 'A');
        setComponent(grandparent.node, ComponentParentChildren, 'B');
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice.calledWith('C');
        expect(subscriberCleanupSpy).to.not.be.called;

        grandparent.node.remove();
        await rediscover(grandparent);
        clock.runAll();
        expect(subscriberSpy).to.be.calledTwice; // no changes.
        expect(subscriberCleanupSpy).to.be.calledTwice;
      });
    });
  });
});
