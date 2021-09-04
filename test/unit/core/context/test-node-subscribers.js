import {ContextNode} from '#core/context/node';
import {contextProp} from '#core/context/prop';
import {subscribe, unsubscribe} from '#core/context/subscriber';

const NonRecursive = contextProp('NonRecursive');

const Concat = contextProp('Concat', {
  recursive: true,
  compute: (contextNode, inputs, parentValue) =>
    `${parentValue}${inputs.join('|')}`,
  defaultValue: '',
});

describes.realWin('ContextNode - subscribers', {}, (env) => {
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
  });
});
