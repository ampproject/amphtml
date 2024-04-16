import {ContextNode} from '#core/context/node';
import {contextProp} from '#core/context/prop';
import {Values} from '#core/context/values';

const NonRecursive = contextProp('NonRecursive');

const Recursive = contextProp('Recursive', {recursive: true});

const Concat = contextProp('Concat', {
  recursive: true,
  compute: (contextNode, inputs, parentValue) =>
    `${parentValue}${inputs.length > 1 ? `(${inputs.join('|')})` : inputs[0]}`,
  defaultValue: '',
});

const Computed = contextProp('Computed', {
  deps: [NonRecursive, Recursive, Concat],
  compute: (contextNode, inputs, nonRecursive, recursive, concat) =>
    `${inputs[0] ?? 'no-input'}/${nonRecursive}/${recursive}/${concat}`,
});

const ComputedRecursiveWithDeps = contextProp('Computed', {
  deps: [Recursive],
  recursive: true,
  defaultValue: 'DEF',
  compute: (contextNode, inputs, parentValue, recursive) =>
    `${inputs[0] ?? 'no-input'}/${parentValue}/${recursive}`,
});

describes.realWin('ContextNode - values', {}, (env) => {
  let sandbox;
  let win, doc;
  let tree;
  let clock;
  let discoverWrapper;
  let calcSpy;

  beforeEach(() => {
    sandbox = env.sandbox;
    win = env.win;
    doc = win.document;
    clock = sandbox.useFakeTimers();

    tree = (() => {
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
      return createSubtree('T', 4, 4);
    })();

    discoverWrapper = wrapper(ContextNode.prototype, 'discover_');

    calcSpy = env.sandbox.spy(Values.prototype, 'calc_');

    // Customize output of the ContextNode for easy debug.
    ContextNode.prototype.inspect = function () {
      const contextNode = this;
      return `ContextNode(${contextNode.node.id || contextNode.node.nodeName})`;
    };
  });

  afterEach(() => {
    delete ContextNode.prototype.inspect;
  });

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

  describe('connected, non-recursive', () => {
    let sibling1, sibling1Stub;
    let sibling2, sibling2Stub;
    let cousin1, cousin1Stub;
    let parent, parentStub;
    let grandparent, grandparentStub;

    beforeEach(async () => {
      doc.body.appendChild(tree);
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      parent = ContextNode.get(el('T-1-1'));
      grandparent = ContextNode.get(el('T-1'));

      sibling1Stub = sandbox.stub();
      sibling2Stub = sandbox.stub();
      cousin1Stub = sandbox.stub();
      parentStub = sandbox.stub();
      grandparentStub = sandbox.stub();

      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);

      sibling1.values.subscribe(NonRecursive, sibling1Stub);
      sibling2.values.subscribe(NonRecursive, sibling2Stub);
      cousin1.values.subscribe(NonRecursive, cousin1Stub);
      parent.values.subscribe(NonRecursive, parentStub);
      grandparent.values.subscribe(NonRecursive, grandparentStub);
      clock.runAll();
      calcSpy.resetHistory();
    });

    it('should resolve with an existing value immediately', async () => {
      grandparent.values.set(NonRecursive, 'OWNER1', 'A');
      clock.runAll();

      const spy = sandbox.stub();
      grandparent.values.subscribe(NonRecursive, spy);
      clock.runAll();

      expect(spy).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(1);
    });

    it('should read a non-recursive value on the node', async () => {
      grandparent.values.set(NonRecursive, 'OWNER1', 'A');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      expect(calcSpy).to.have.callCount(1);

      calcSpy.resetHistory();
      grandparent.values.set(NonRecursive, 'OWNER1', 'Z');
      clock.runAll();

      expect(grandparentStub).to.be.calledTwice.calledWith('Z');
      expect(parentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      expect(calcSpy).to.have.callCount(1);
    });

    it('should not update the same value twice', async () => {
      grandparent.values.set(NonRecursive, 'OWNER1', 'A');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(1);

      grandparent.values.set(NonRecursive, 'OWNER1', 'A');
      clock.runAll();
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(1); // no change.
    });
  });

  describe('connected, recursive', () => {
    let sibling1, sibling1Stub;
    let sibling2, sibling2Stub;
    let cousin1, cousin1Stub;
    let parent, parentStub;
    let grandparent, grandparentStub;

    beforeEach(async () => {
      doc.body.appendChild(tree);
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      parent = ContextNode.get(el('T-1-1'));
      grandparent = ContextNode.get(el('T-1'));

      sibling1Stub = sandbox.stub();
      sibling2Stub = sandbox.stub();
      cousin1Stub = sandbox.stub();
      parentStub = sandbox.stub();
      grandparentStub = sandbox.stub();

      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);

      sibling1.values.subscribe(Recursive, sibling1Stub);
      sibling2.values.subscribe(Recursive, sibling2Stub);
      cousin1.values.subscribe(Recursive, cousin1Stub);
      parent.values.subscribe(Recursive, parentStub);
      grandparent.values.subscribe(Recursive, grandparentStub);
      clock.runAll();
      calcSpy.resetHistory();
    });

    it('should read a recursive value on the node', async () => {
      grandparent.values.set(Recursive, 'OWNER1', 'A');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('A');
      expect(sibling1Stub).to.be.calledOnce.calledWith('A');
      expect(sibling2Stub).to.be.calledOnce.calledWith('A');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      grandparent.values.set(Recursive, 'OWNER1', 'B');
      clock.runAll();

      expect(grandparentStub).to.be.calledTwice.calledWith('B');
      expect(parentStub).to.be.calledTwice.calledWith('B');
      expect(sibling1Stub).to.be.calledTwice.calledWith('B');
      expect(sibling2Stub).to.be.calledTwice.calledWith('B');
      expect(cousin1Stub).to.be.calledTwice.calledWith('B');
      expect(calcSpy).to.have.callCount(5);
    });

    it('should override a recursive value on the node', async () => {
      grandparent.values.set(Recursive, 'OWNER1', 'A');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('A');
      expect(sibling1Stub).to.be.calledOnce.calledWith('A');
      expect(sibling2Stub).to.be.calledOnce.calledWith('A');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      parent.values.set(Recursive, 'OWNER1', 'B');
      clock.runAll();

      expect(parentStub).to.be.calledTwice.calledWith('B');
      expect(sibling1Stub).to.be.calledTwice.calledWith('B');
      expect(sibling2Stub).to.be.calledTwice.calledWith('B');
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(cousin1Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(3);
    });

    it('should stop recompute a value when a node is removed', async () => {
      grandparent.values.set(Recursive, 'OWNER1', 'A');
      parent.values.set(Recursive, 'OWNER1', 'B');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('B');
      expect(sibling1Stub).to.be.calledOnce.calledWith('B');
      expect(sibling2Stub).to.be.calledOnce.calledWith('B');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      parent.node.remove();
      await rediscover(parent);
      clock.runAll();
      expect(calcSpy).to.have.callCount(0);
    });

    it('should recompute a value when a node is reparented', async () => {
      grandparent.values.set(Recursive, 'OWNER1', 'A');
      parent.values.set(Recursive, 'OWNER1', 'B');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('B');
      expect(sibling1Stub).to.be.calledOnce.calledWith('B');
      expect(sibling2Stub).to.be.calledOnce.calledWith('B');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      grandparent.node.appendChild(sibling1.node);
      await rediscover(sibling1);
      clock.runAll();

      expect(sibling1Stub).to.be.calledTwice.calledWith('A');
      expect(grandparentStub).to.be.calledOnce; // no changes.
      expect(parentStub).to.be.calledOnce; // no changes.
      expect(sibling2Stub).to.be.calledOnce; // no changes.
      expect(cousin1Stub).to.be.calledOnce; // no changes.
      expect(calcSpy).to.have.callCount(1);
    });
  });

  describe('connected, computable recursive', () => {
    let sibling1, sibling1Stub;
    let sibling2, sibling2Stub;
    let cousin1, cousin1Stub;
    let parent, parentStub;
    let grandparent, grandparentStub;

    beforeEach(async () => {
      doc.body.appendChild(tree);
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      parent = ContextNode.get(el('T-1-1'));
      grandparent = ContextNode.get(el('T-1'));

      sibling1Stub = sandbox.stub();
      sibling2Stub = sandbox.stub();
      cousin1Stub = sandbox.stub();
      parentStub = sandbox.stub();
      grandparentStub = sandbox.stub();

      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);

      sibling1.values.subscribe(Concat, sibling1Stub);
      sibling2.values.subscribe(Concat, sibling2Stub);
      cousin1.values.subscribe(Concat, cousin1Stub);
      parent.values.subscribe(Concat, parentStub);
      grandparent.values.subscribe(Concat, grandparentStub);
      clock.runAll();
      calcSpy.resetHistory();
      sibling1Stub.resetHistory();
      sibling2Stub.resetHistory();
      cousin1Stub.resetHistory();
      parentStub.resetHistory();
      grandparentStub.resetHistory();
    });

    it('should override a computed value on the node', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('A');
      expect(sibling1Stub).to.be.calledOnce.calledWith('A');
      expect(sibling2Stub).to.be.calledOnce.calledWith('A');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      parent.values.set(Concat, 'OWNER1', 'B');
      clock.runAll();

      expect(parentStub).to.be.calledTwice.calledWith('AB');
      expect(sibling1Stub).to.be.calledTwice.calledWith('AB');
      expect(sibling2Stub).to.be.calledTwice.calledWith('AB');
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(cousin1Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(3);

      calcSpy.resetHistory();
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(sibling1Stub).to.be.calledThrice.calledWith('ABC');
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(parentStub).to.be.calledTwice; // no change.
      expect(sibling2Stub).to.be.calledTwice; // no change.
      expect(cousin1Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(1);
    });

    it('should override a computed value in reverse', async () => {
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(sibling1Stub).to.be.calledOnce.calledWith('C');
      expect(grandparentStub).to.not.be.called;
      expect(parentStub).to.be.not.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      expect(calcSpy).to.have.callCount(1);

      calcSpy.resetHistory();
      parent.values.set(Concat, 'OWNER1', 'B');
      clock.runAll();

      expect(sibling1Stub).to.be.calledTwice.calledWith('BC');
      expect(parentStub).to.be.calledOnce.calledWith('B');
      expect(sibling2Stub).to.be.calledOnce.calledWith('B');
      expect(grandparentStub).to.not.be.called;
      expect(cousin1Stub).to.be.not.called;
      expect(calcSpy).to.have.callCount(3);

      calcSpy.resetHistory();
      grandparent.values.set(Concat, 'OWNER1', 'A');
      clock.runAll();

      expect(sibling1Stub).to.be.calledThrice.calledWith('ABC');
      expect(parentStub).to.be.calledTwice.calledWith('AB');
      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(sibling2Stub).to.be.calledTwice.calledWith('AB');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);
    });

    it('should override a computed value in between', async () => {
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(sibling1Stub).to.be.calledOnce.calledWith('C');
      expect(grandparentStub).to.not.be.called;
      expect(parentStub).to.be.not.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      expect(calcSpy).to.have.callCount(1);

      calcSpy.resetHistory();
      grandparent.values.set(Concat, 'OWNER1', 'A');
      clock.runAll();

      expect(sibling1Stub).to.be.calledTwice.calledWith('AC');
      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('A');
      expect(sibling2Stub).to.be.calledOnce.calledWith('A');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      parent.values.set(Concat, 'OWNER1', 'B');
      clock.runAll();

      expect(sibling1Stub).to.be.calledThrice.calledWith('ABC');
      expect(parentStub).to.be.calledTwice.calledWith('AB');
      expect(sibling2Stub).to.be.calledTwice.calledWith('AB');
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(cousin1Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(3);
    });

    it('should recompute the value on new input', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      parent.values.set(Concat, 'OWNER1', 'B');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('AB');
      expect(sibling1Stub).to.be.calledOnce.calledWith('ABC');
      expect(sibling2Stub).to.be.calledOnce.calledWith('AB');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      grandparent.values.set(Concat, 'OWNER1', 'Z');
      clock.runAll();

      expect(grandparentStub).to.be.calledTwice.calledWith('Z');
      expect(parentStub).to.be.calledTwice.calledWith('ZB');
      expect(sibling1Stub).to.be.calledTwice.calledWith('ZBC');
      expect(sibling2Stub).to.be.calledTwice.calledWith('ZB');
      expect(cousin1Stub).to.be.calledTwice.calledWith('Z');
      expect(calcSpy).to.have.callCount(5);
    });

    it('should recompute value when input is removed', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      parent.values.set(Concat, 'OWNER1', 'B');
      parent.values.set(Concat, 'OWNER2', 'Y');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('A(B|Y)');
      expect(sibling1Stub).to.be.calledOnce.calledWith('A(B|Y)C');
      expect(sibling2Stub).to.be.calledOnce.calledWith('A(B|Y)');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      parent.values.remove(Concat, 'OWNER2');
      clock.runAll();

      expect(parentStub).to.be.calledTwice.calledWith('AB');
      expect(sibling1Stub).to.be.calledTwice.calledWith('ABC');
      expect(sibling2Stub).to.be.calledTwice.calledWith('AB');
      expect(grandparentStub).to.be.calledOnce;
      expect(cousin1Stub).to.be.calledOnce;
      expect(calcSpy).to.have.callCount(3);

      calcSpy.resetHistory();
      parent.values.remove(Concat, 'OWNER1');
      clock.runAll();

      expect(parentStub).to.be.calledThrice.calledWith('A');
      expect(sibling1Stub).to.be.calledThrice.calledWith('AC');
      expect(sibling2Stub).to.be.calledThrice.calledWith('A');
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(cousin1Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(3);
    });

    it('should recompute the value on parent change', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      parent.values.set(Concat, 'OWNER1', 'B');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('AB');
      expect(sibling1Stub).to.be.calledOnce.calledWith('ABC');
      expect(sibling2Stub).to.be.calledOnce.calledWith('AB');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      tree.appendChild(parent.node);
      rediscover(parent);
      clock.runAll();

      expect(parentStub).to.be.calledTwice.calledWith('B');
      expect(sibling1Stub).to.be.calledTwice.calledWith('BC');
      expect(sibling2Stub).to.be.calledTwice.calledWith('B');
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(cousin1Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(3);
    });

    it('should stop/resume when disconnected/reconnected', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      parent.values.set(Concat, 'OWNER1', 'B');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('AB');
      expect(sibling1Stub).to.be.calledOnce.calledWith('ABC');
      expect(sibling2Stub).to.be.calledOnce.calledWith('AB');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      parent.node.remove();
      await rediscover(parent);
      clock.runAll();
      expect(calcSpy).to.have.callCount(0);

      calcSpy.resetHistory();
      grandparent.values.set(Concat, 'OWNER1', 'Z');
      parent.values.set(Concat, 'OWNER1', 'Y');
      clock.runAll();

      expect(grandparentStub).to.be.calledTwice.calledWith('Z');
      expect(cousin1Stub).to.be.calledTwice.calledWith('Z');
      expect(parentStub).to.be.calledOnce; // no change.
      expect(sibling1Stub).to.be.calledOnce; // no change.
      expect(sibling2Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(2);

      calcSpy.resetHistory();
      grandparent.node.appendChild(parent.node);
      await rediscover(parent);
      clock.runAll();

      expect(parentStub).to.be.calledTwice.calledWith('ZY');
      expect(sibling1Stub).to.be.calledTwice.calledWith('ZYC');
      expect(sibling2Stub).to.be.calledTwice.calledWith('ZY');
      expect(grandparentStub).to.be.calledTwice; // no change.
      expect(cousin1Stub).to.be.calledTwice; // no change.
      expect(calcSpy).to.have.callCount(3);
    });

    it('should recompute when reparented', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      parent.values.set(Concat, 'OWNER1', 'B');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('AB');
      expect(sibling1Stub).to.be.calledOnce.calledWith('ABC');
      expect(sibling2Stub).to.be.calledOnce.calledWith('AB');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      grandparent.node.appendChild(sibling1.node);
      await rediscover(sibling1);
      clock.runAll();

      expect(sibling1Stub).to.be.calledTwice.calledWith('AC');
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(cousin1Stub).to.be.calledOnce; // no change.
      expect(parentStub).to.be.calledOnce; // no change.
      expect(sibling2Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(1);
    });

    it('should accept multiple inputs', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('A');
      expect(sibling1Stub).to.be.calledOnce.calledWith('AC');
      expect(sibling2Stub).to.be.calledOnce.calledWith('A');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);

      calcSpy.resetHistory();
      grandparent.values.set(Concat, 'OWNER2', 'Z');
      clock.runAll();

      expect(grandparentStub).to.be.calledTwice.calledWith('(A|Z)');
      expect(parentStub).to.be.calledTwice.calledWith('(A|Z)');
      expect(sibling1Stub).to.be.calledTwice.calledWith('(A|Z)C');
      expect(sibling2Stub).to.be.calledTwice.calledWith('(A|Z)');
      expect(cousin1Stub).to.be.calledTwice.calledWith('(A|Z)');
      expect(calcSpy).to.have.callCount(5);
    });
  });

  describe('connected, with deps', () => {
    let sibling1, sibling1Stub;
    let sibling2, sibling2Stub;
    let cousin1, cousin1Stub;
    let parent, parentStub;
    let grandparent, grandparentStub;

    beforeEach(async () => {
      doc.body.appendChild(tree);
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      parent = ContextNode.get(el('T-1-1'));
      grandparent = ContextNode.get(el('T-1'));

      sibling1Stub = sandbox.stub();
      sibling2Stub = sandbox.stub();
      cousin1Stub = sandbox.stub();
      parentStub = sandbox.stub();
      grandparentStub = sandbox.stub();

      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);

      sibling1.values.subscribe(Computed, sibling1Stub);
      sibling2.values.subscribe(Computed, sibling2Stub);
      cousin1.values.subscribe(Computed, cousin1Stub);
      parent.values.subscribe(Computed, parentStub);
      grandparent.values.subscribe(Computed, grandparentStub);
      clock.runAll();
      calcSpy.resetHistory();
    });

    it('should compute with all dependencies only', () => {
      expect(grandparentStub).to.not.be.called;
      expect(parentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;

      // Add a computed recursive dependency.
      grandparent.values.set(Concat, 'OWNER1', 'A');
      clock.runAll();
      expect(grandparentStub).to.not.be.called;
      expect(parentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;

      // Add a recursive dependency.
      grandparent.values.set(Recursive, 'OWNER1', 'recursive');
      clock.runAll();
      expect(grandparentStub).to.not.be.called;
      expect(parentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;

      // Add a non-recursive dependency.
      calcSpy.resetHistory();
      parent.values.set(NonRecursive, 'OWNER1', 'non-recursive');
      clock.runAll();
      expect(parentStub).to.be.calledOnce.calledWith(
        'no-input/non-recursive/recursive/A'
      );
      expect(grandparentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      // One computation for `NonRecursive` and one for `Computed`.
      expect(calcSpy).to.have.callCount(2);

      // Set input.
      calcSpy.resetHistory();
      parent.values.set(Computed, 'OWNER1', 'computed');
      clock.runAll();
      expect(parentStub).to.be.calledTwice.calledWith(
        'computed/non-recursive/recursive/A'
      );
      expect(grandparentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      expect(calcSpy).to.have.callCount(1);
    });

    it('should recompute on a recursive changes', () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      grandparent.values.set(Recursive, 'OWNER1', 'recursive');
      parent.values.set(NonRecursive, 'OWNER1', 'non-recursive1');
      sibling1.values.set(NonRecursive, 'OWNER1', 'non-recursive2');
      clock.runAll();

      expect(parentStub).to.be.calledOnce.calledWith(
        'no-input/non-recursive1/recursive/A'
      );
      expect(sibling1Stub).to.be.calledOnce.calledWith(
        'no-input/non-recursive2/recursive/A'
      );
      expect(grandparentStub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;

      calcSpy.resetHistory();
      grandparent.values.set(Concat, 'OWNER1', 'Z');
      clock.runAll();
      expect(parentStub).to.be.calledTwice.calledWith(
        'no-input/non-recursive1/recursive/Z'
      );
      expect(sibling1Stub).to.be.calledTwice.calledWith(
        'no-input/non-recursive2/recursive/Z'
      );
      expect(grandparentStub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      // 5x `Concat` + 5x `Computed`
      expect(calcSpy).to.have.callCount(10);
    });

    it('should recompute on a non-recursive changes', () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      grandparent.values.set(Recursive, 'OWNER1', 'recursive');
      parent.values.set(NonRecursive, 'OWNER1', 'non-recursive1');
      sibling1.values.set(NonRecursive, 'OWNER1', 'non-recursive2');
      clock.runAll();

      expect(parentStub).to.be.calledOnce.calledWith(
        'no-input/non-recursive1/recursive/A'
      );
      expect(sibling1Stub).to.be.calledOnce.calledWith(
        'no-input/non-recursive2/recursive/A'
      );
      expect(grandparentStub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;

      calcSpy.resetHistory();
      parent.values.set(NonRecursive, 'OWNER1', 'non-recursiveZ');
      clock.runAll();
      expect(parentStub).to.be.calledTwice.calledWith(
        'no-input/non-recursiveZ/recursive/A'
      );
      expect(sibling1Stub).to.be.calledOnce; // no change.
      expect(grandparentStub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      // 1x `NonRecursive` + 1x `Computed`
      expect(calcSpy).to.have.callCount(2);
    });
  });

  describe('connected, recursive, with deps', () => {
    let sibling1, sibling1Stub;
    let sibling2, sibling2Stub;
    let cousin1, cousin1Stub;
    let parent, parentStub;
    let grandparent, grandparentStub;

    beforeEach(async () => {
      doc.body.appendChild(tree);
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      parent = ContextNode.get(el('T-1-1'));
      grandparent = ContextNode.get(el('T-1'));

      sibling1Stub = sandbox.stub();
      sibling2Stub = sandbox.stub();
      cousin1Stub = sandbox.stub();
      parentStub = sandbox.stub();
      grandparentStub = sandbox.stub();

      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);

      sibling1.values.subscribe(ComputedRecursiveWithDeps, sibling1Stub);
      sibling2.values.subscribe(ComputedRecursiveWithDeps, sibling2Stub);
      cousin1.values.subscribe(ComputedRecursiveWithDeps, cousin1Stub);
      parent.values.subscribe(ComputedRecursiveWithDeps, parentStub);
      grandparent.values.subscribe(ComputedRecursiveWithDeps, grandparentStub);
      clock.runAll();
      calcSpy.resetHistory();
    });

    it('should compute without input', () => {
      expect(grandparentStub).to.not.be.called;
      expect(parentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;

      grandparent.values.set(Recursive, 'OWNER1', 'A');
      clock.runAll();
      expect(sibling1Stub).to.be.calledOnce.calledWith('no-input/DEF/A');
    });
  });

  describe('connected, discovered later', () => {
    let sibling1, sibling1Stub;
    let sibling2, sibling2Stub;
    let cousin1, cousin1Stub;
    let grandparent, grandparentStub;

    beforeEach(async () => {
      doc.body.appendChild(tree);
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      grandparent = ContextNode.get(el('T-1'));

      sibling1Stub = sandbox.stub();
      sibling2Stub = sandbox.stub();
      cousin1Stub = sandbox.stub();
      grandparentStub = sandbox.stub();

      await waitForDiscover(grandparent, sibling1, sibling2, cousin1);

      sibling1.values.subscribe(Concat, sibling1Stub);
      sibling2.values.subscribe(Concat, sibling2Stub);
      cousin1.values.subscribe(Concat, cousin1Stub);
      grandparent.values.subscribe(Concat, grandparentStub);
      clock.runAll();
      calcSpy.resetHistory();
      sibling1Stub.resetHistory();
      sibling2Stub.resetHistory();
      cousin1Stub.resetHistory();
      grandparentStub.resetHistory();
    });

    it('should override a computed value on a new node', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(sibling1Stub).to.be.calledOnce.calledWith('AC');
      expect(sibling2Stub).to.be.calledOnce.calledWith('A');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(4);

      calcSpy.resetHistory();
      const parent = ContextNode.get(el('T-1-1'));
      const parentStub = sandbox.stub();
      parent.values.subscribe(Concat, parentStub);
      parent.values.set(Concat, 'OWNER1', 'B');
      await waitForDiscover(parent);
      clock.runAll();

      expect(parentStub).to.be.calledOnce.calledWith('AB');
      expect(sibling1Stub).to.be.calledTwice.calledWith('ABC');
      expect(sibling2Stub).to.be.calledTwice.calledWith('AB');
      expect(grandparentStub).to.be.calledOnce; // no change.
      expect(cousin1Stub).to.be.calledOnce; // no change.
      expect(calcSpy).to.have.callCount(3);
    });
  });

  describe('not connected', () => {
    let sibling1, sibling1Stub;
    let sibling2, sibling2Stub;
    let cousin1, cousin1Stub;
    let parent, parentStub;
    let grandparent, grandparentStub;

    beforeEach(async () => {
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      parent = ContextNode.get(el('T-1-1'));
      grandparent = ContextNode.get(el('T-1'));

      sibling1Stub = sandbox.stub();
      sibling2Stub = sandbox.stub();
      cousin1Stub = sandbox.stub();
      parentStub = sandbox.stub();
      grandparentStub = sandbox.stub();

      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);

      sibling1.values.subscribe(Concat, sibling1Stub);
      sibling2.values.subscribe(Concat, sibling2Stub);
      cousin1.values.subscribe(Concat, cousin1Stub);
      parent.values.subscribe(Concat, parentStub);
      grandparent.values.subscribe(Concat, grandparentStub);
      clock.runAll();
      calcSpy.resetHistory();
    });

    it('should compute when connected', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      parent.values.set(Concat, 'OWNER1', 'B');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      expect(calcSpy).to.not.be.called;

      calcSpy.resetHistory();
      doc.body.appendChild(tree);
      await rediscover(grandparent);
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('AB');
      expect(sibling1Stub).to.be.calledOnce.calledWith('ABC');
      expect(sibling2Stub).to.be.calledOnce.calledWith('AB');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);
    });

    it('should compute when made a root', async () => {
      grandparent.values.set(Concat, 'OWNER1', 'A');
      parent.values.set(Concat, 'OWNER1', 'B');
      sibling1.values.set(Concat, 'OWNER1', 'C');
      clock.runAll();

      expect(grandparentStub).to.not.be.called;
      expect(sibling1Stub).to.not.be.called;
      expect(sibling2Stub).to.not.be.called;
      expect(cousin1Stub).to.not.be.called;
      expect(calcSpy).to.not.be.called;

      calcSpy.resetHistory();
      grandparent.setIsRoot(true);
      clock.runAll();

      expect(grandparentStub).to.be.calledOnce.calledWith('A');
      expect(parentStub).to.be.calledOnce.calledWith('AB');
      expect(sibling1Stub).to.be.calledOnce.calledWith('ABC');
      expect(sibling2Stub).to.be.calledOnce.calledWith('AB');
      expect(cousin1Stub).to.be.calledOnce.calledWith('A');
      expect(calcSpy).to.have.callCount(5);
    });
  });
});
