import {ContextNode} from '#core/context/node';
import {deepScan, findParent} from '#core/context/scan';
import {domOrderComparator} from '#core/dom';

describes.realWin('ContextNode', {}, (env) => {
  let win, doc;
  let tree;
  let clock;
  let discoverWrapper;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    clock = env.sandbox.useFakeTimers();

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

  function expectContext(nodeOrContext, spec) {
    const contextNode = nodeOrContext.nodeType
      ? ContextNode.get(nodeOrContext)
      : nodeOrContext;
    if (spec.isRoot !== undefined) {
      expect(contextNode.isRoot, 'isRoot').to.equal(spec.isRoot);
    }
    if (spec.root !== undefined) {
      const {root} = contextNode;
      expect((root && root.node) ?? null, 'root').to.equal(spec.root);
    }
    if (spec.discoverable !== undefined) {
      expect(contextNode.isDiscoverable(), 'discoverable').to.equal(
        spec.discoverable
      );
    }
    if (spec.parent !== undefined) {
      const {parent} = contextNode;
      const parentNode = (parent && parent.node) ?? null;
      const specNode =
        ((spec.parent && spec.parent.node) || spec.parent) ?? null;
      expect(parentNode, 'parent').to.equal(specNode);
    }
    if (spec.children !== undefined) {
      const children = (contextNode.children || []).map((cn) => cn.node || cn);
      children.sort(domOrderComparator);
      const specChildren = spec.children.slice(0);
      specChildren.sort(domOrderComparator);
      expect(children, 'children').to.deep.equal(specChildren);
    }
  }

  describe('ContextNode.get', () => {
    it('should create an element node', () => {
      const el = doc.createElement('div');
      const cn = ContextNode.get(el);
      expect(cn.node).to.equal(el);
      // Parent always starts as null.
      expectContext(cn, {
        parent: null,
        isRoot: false,
        root: null,
        children: [],
        discoverable: true,
      });
    });

    it('should create a fragment node', () => {
      const frag = doc.createDocumentFragment();
      const cn = ContextNode.get(frag);
      expect(cn.node).to.equal(frag);
      // Parent always starts as null.
      expectContext(cn, {
        parent: null,
        isRoot: false,
        root: null,
        children: [],
        discoverable: true,
      });
    });

    it('should create a document node', () => {
      const cn = ContextNode.get(doc);
      expect(cn.node).to.equal(doc);
      // Parent always starts as null.
      expectContext(cn, {
        parent: null,
        isRoot: true,
        root: doc,
        children: [],
        discoverable: false,
      });
    });

    it('should create a node only once', () => {
      const el = doc.createElement('div');
      const frag = doc.createDocumentFragment();
      const cn1 = ContextNode.get(el);
      const cn2 = ContextNode.get(frag);
      const cn3 = ContextNode.get(doc);
      expect(cn1).to.equal(ContextNode.get(el));
      expect(cn2).to.equal(ContextNode.get(frag));
      expect(cn3).to.equal(ContextNode.get(doc));
    });
  });

  describe('ContextNode.closest', () => {
    let element;
    let grandparent;

    beforeEach(() => {
      element = el('T-1-1-1');
      grandparent = el('T-1');
    });

    it('should find itself', () => {
      const elementContext = ContextNode.get(element);
      expect(ContextNode.closest(element)).to.equal(elementContext);
    });

    it('should skip itself', () => {
      ContextNode.get(element);
      const grandparentContext = ContextNode.get(grandparent);
      expect(ContextNode.closest(element, false)).to.equal(grandparentContext);
      expect(ContextNode.closest(grandparent, false)).to.be.null;
    });

    it('should go up DOM tree', () => {
      const grandparentContext = ContextNode.get(grandparent);
      expect(ContextNode.closest(element)).to.equal(grandparentContext);
    });

    it('should auto-create root when connected', () => {
      doc.body.appendChild(tree);
      expect(ContextNode.closest(element)).to.equal(ContextNode.get(doc));
      expectContext(ContextNode.get(doc), {isRoot: true});
    });

    it('should auto-create root on a fragment', () => {
      const frag = doc.createDocumentFragment();
      frag.appendChild(tree);
      expect(ContextNode.closest(element)).to.equal(ContextNode.get(frag));
      expectContext(ContextNode.get(frag), {
        isRoot: false,
        root: null,
        parent: null,
      });
    });

    it('should auto-create a custom AMP element', () => {
      const ampElement = doc.createElement('amp-element');
      ampElement.appendChild(tree);
      expect(ContextNode.closest(element)).to.equal(
        ContextNode.get(ampElement)
      );
      expectContext(ContextNode.get(ampElement), {
        isRoot: false,
        root: null,
        parent: null,
      });
    });
  });

  describe('discover', () => {
    let sibling1;
    let sibling2;
    let cousin1;
    let parent;
    let grandparent;

    beforeEach(() => {
      sibling1 = el('T-1-1-1');
      sibling2 = el('T-1-1-2');
      cousin1 = el('T-1-2-1');
      parent = el('T-1-1');
      grandparent = el('T-1');
    });

    it('should be created in an undiscovered mode', () => {
      expectContext(sibling1, {parent: null, discoverable: true});
      expectContext(sibling2, {parent: null, discoverable: true});
      expectContext(cousin1, {parent: null, discoverable: true});
    });

    describe('disconnected tree', () => {
      beforeEach(async () => {
        await waitForDiscover(sibling1, sibling2, cousin1);
      });

      it('should not auto-discover an orphan', async () => {
        expectContext(sibling1, {
          parent: null,
          children: [],
          root: null,
          isRoot: false,
          discoverable: true,
        });
        expectContext(sibling2, {
          parent: null,
          children: [],
          root: null,
          isRoot: false,
          discoverable: true,
        });
        expectContext(cousin1, {
          parent: null,
          children: [],
          root: null,
          isRoot: false,
          discoverable: true,
        });
      });

      it('should auto-discover the grandparent', async () => {
        await waitForDiscover(grandparent);
        await rediscover(sibling1, sibling2, cousin1);

        expectContext(sibling1, {
          isRoot: false,
          root: null,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
        expectContext(sibling2, {
          isRoot: false,
          root: null,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
        expectContext(cousin1, {
          isRoot: false,
          root: null,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
        expectContext(grandparent, {
          isRoot: false,
          root: null,
          parent: null,
          children: [sibling1, sibling2, cousin1],
          discoverable: true,
        });

        const element3 = el('T-1-1-3');
        await waitForDiscover(element3);
        expectContext(element3, {
          isRoot: false,
          root: null,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
        expectContext(grandparent, {
          isRoot: false,
          root: null,
          parent: null,
          children: [sibling1, sibling2, cousin1, element3],
          discoverable: true,
        });
      });

      it('should insert an intermediary parent', async () => {
        await waitForDiscover(grandparent);
        await rediscover(sibling1, sibling2, cousin1);
        expectContext(sibling1, {parent: grandparent});
        expectContext(sibling2, {parent: grandparent});
        expectContext(cousin1, {parent: grandparent});

        await waitForDiscover(parent);
        expectContext(sibling1, {
          parent,
          children: [],
          isRoot: false,
          root: null,
          discoverable: true,
        });
        expectContext(sibling2, {
          parent,
          children: [],
          isRoot: false,
          root: null,
          discoverable: true,
        });
        expectContext(parent, {
          parent: grandparent,
          children: [sibling1, sibling2],
          isRoot: false,
          root: null,
          discoverable: true,
        });
        expectContext(grandparent, {
          parent: null,
          children: [parent, cousin1],
          isRoot: false,
          root: null,
          discoverable: true,
        });
      });

      it('should assign/unassign a slot', async () => {
        await waitForDiscover(grandparent, parent);
        await rediscover(sibling1, sibling2, cousin1);
        expectContext(sibling1, {parent});
        expectContext(sibling2, {parent});
        expectContext(cousin1, {grandparent});
        expectContext(grandparent, {children: [parent, cousin1]});
        expectContext(parent, {children: [sibling1, sibling2]});

        // Slot cousin1 under parent.
        ContextNode.assignSlot(cousin1, el('T-1-1-3'));
        await rediscover(cousin1);
        expectContext(cousin1, {parent});
        expectContext(grandparent, {children: [parent]});
        expectContext(parent, {children: [sibling1, sibling2, cousin1]});

        // Unslot cousin1.
        ContextNode.unassignSlot(cousin1, el('T-1-1-3'));
        await rediscover(cousin1);
        expectContext(cousin1, {parent: grandparent});
        expectContext(grandparent, {children: [parent, cousin1]});
        expectContext(parent, {children: [sibling1, sibling2]});
      });

      it('should assign/unassign a slot in Shadow DOM', async () => {
        if (Element.prototype.attachShadow) {
          return;
        }

        await waitForDiscover(grandparent, parent);

        const grandchild = doc.createElement('div');
        sibling1.appendChild(grandchild);

        await waitForDiscover(grandchild);

        const shadowRoot = sibling1.attachShadow({mode: 'open'});
        await waitForDiscover(shadowRoot);
        expectContext(grandchild, {parent: sibling1});
        expectContext(sibling1, {children: [grandchild, shadowRoot]});
        expectContext(shadowRoot, {children: [], parent: sibling1});

        // Slot.
        const slot = doc.createElement('slot');
        shadowRoot.appendChild(slot);
        await rediscover(grandchild);
        expectContext(grandchild, {parent: shadowRoot});
        expectContext(sibling1, {children: [shadowRoot]});
        expectContext(shadowRoot, {children: [grandchild], parent: sibling1});

        // Unslot.
        shadowRoot.removeChild(slot);
        await rediscover(grandchild);
        expectContext(grandchild, {parent: sibling1});
        expectContext(sibling1, {children: [grandchild, shadowRoot]});
        expectContext(shadowRoot, {children: [], parent: sibling1});
      });

      it('should override the root', async () => {
        await waitForDiscover(grandparent, parent);
        await rediscover(sibling1, sibling2, cousin1);

        ContextNode.get(grandparent).setIsRoot(true);

        expectContext(grandparent, {
          parent: null,
          children: [parent, cousin1],
          isRoot: true,
          root: grandparent,
          discoverable: false,
        });
        expectContext(parent, {
          parent: grandparent,
          children: [sibling1, sibling2],
          isRoot: false,
          root: grandparent,
          discoverable: true,
        });
        expectContext(sibling1, {
          parent,
          children: [],
          isRoot: false,
          root: grandparent,
          discoverable: true,
        });
        expectContext(sibling2, {
          parent,
          children: [],
          isRoot: false,
          root: grandparent,
          discoverable: true,
        });
        expectContext(cousin1, {
          parent: grandparent,
          children: [],
          isRoot: false,
          root: grandparent,
          discoverable: true,
        });
      });

      it('should override the parent', async () => {
        await waitForDiscover(grandparent);
        await rediscover(sibling1, sibling2, cousin1);
        expectContext(sibling1, {parent: grandparent});
        expectContext(sibling2, {parent: grandparent});
        expectContext(cousin1, {parent: grandparent});

        ContextNode.get(sibling2).setParent(sibling1);
        expectContext(sibling2, {
          parent: sibling1,
          children: [],
          discoverable: false,
        });
        expectContext(sibling1, {
          parent: grandparent,
          children: [sibling2],
          discoverable: true,
        });
        expectContext(grandparent, {
          children: [sibling1, cousin1],
          discoverable: true,
        });
      });
    });

    describe('tree connected later', () => {
      beforeEach(async () => {
        await waitForDiscover(sibling1, sibling2, cousin1);
      });

      function connectTree() {
        doc.body.appendChild(tree);
        return ContextNode.get(doc);
      }

      it('should configure the root', async () => {
        expectContext(connectTree(), {
          discoverable: false,
          isRoot: true,
          root: doc,
          parent: null,
          children: [],
        });
      });

      it('should auto-discover an orphan', async () => {
        expectContext(sibling1, {parent: null, root: null});
        expectContext(sibling2, {parent: null, root: null});
        expectContext(cousin1, {parent: null, root: null});

        connectTree();
        await rediscover(sibling1, sibling2, cousin1);
        expectContext(sibling1, {
          parent: doc,
          root: doc,
          children: [],
          isRoot: false,
          discoverable: true,
        });
        expectContext(sibling2, {
          parent: doc,
          root: doc,
          children: [],
          isRoot: false,
          discoverable: true,
        });
        expectContext(cousin1, {
          parent: doc,
          root: doc,
          children: [],
          isRoot: false,
          discoverable: true,
        });
        expectContext(doc, {
          isRoot: true,
          root: doc,
          parent: null,
          children: [sibling1, sibling2, cousin1],
        });
      });

      it('should auto-discover the grandparent', async () => {
        await waitForDiscover(grandparent);
        await rediscover(sibling1, sibling2, cousin1);

        connectTree();
        await rediscover(grandparent);

        expectContext(doc, {
          isRoot: true,
          root: doc,
          parent: null,
          children: [grandparent],
          discoverable: false,
        });
        expectContext(grandparent, {
          isRoot: false,
          root: doc,
          parent: doc,
          children: [sibling1, sibling2, cousin1],
          discoverable: true,
        });
        expectContext(sibling1, {
          isRoot: false,
          root: doc,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
        expectContext(sibling2, {
          isRoot: false,
          root: doc,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
        expectContext(cousin1, {
          isRoot: false,
          root: doc,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
      });

      it('should insert an intermediary parent', async () => {
        await waitForDiscover(grandparent, parent);
        await rediscover(sibling1, sibling2, cousin1);

        connectTree();
        await rediscover(grandparent);

        expectContext(doc, {
          parent: null,
          children: [grandparent],
          isRoot: true,
          root: doc,
          discoverable: false,
        });
        expectContext(grandparent, {
          parent: doc,
          children: [parent, cousin1],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
        expectContext(parent, {
          parent: grandparent,
          children: [sibling1, sibling2],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
        expectContext(sibling1, {
          parent,
          children: [],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
        expectContext(sibling2, {
          parent,
          children: [],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
        expectContext(cousin1, {
          parent: grandparent,
          children: [],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
      });
    });

    describe('tree connected earlier', () => {
      beforeEach(async () => {
        doc.body.appendChild(tree);
        await waitForDiscover(sibling1, sibling2, cousin1);
      });

      it('should configure root', () => {
        expectContext(doc, {
          root: doc,
          isRoot: true,
          parent: null,
          children: [sibling1, sibling2, cousin1],
          discoverable: false,
        });
      });

      it('should auto-discover an orphan', async () => {
        expectContext(sibling1, {
          parent: doc,
          root: doc,
          isRoot: false,
          children: [],
          discoverable: true,
        });
        expectContext(sibling2, {
          parent: doc,
          root: doc,
          isRoot: false,
          children: [],
          discoverable: true,
        });
        expectContext(cousin1, {
          parent: doc,
          root: doc,
          isRoot: false,
          children: [],
          discoverable: true,
        });
      });

      it('should auto-discover the grandparent', async () => {
        await waitForDiscover(grandparent);

        expectContext(doc, {
          isRoot: true,
          root: doc,
          parent: null,
          children: [grandparent],
          discoverable: false,
        });
        expectContext(grandparent, {
          isRoot: false,
          root: doc,
          parent: doc,
          children: [sibling1, sibling2, cousin1],
          discoverable: true,
        });
        expectContext(sibling1, {
          isRoot: false,
          root: doc,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
        expectContext(sibling2, {
          isRoot: false,
          root: doc,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
        expectContext(cousin1, {
          isRoot: false,
          root: doc,
          parent: grandparent,
          children: [],
          discoverable: true,
        });
      });

      it('should insert an intermediary parent', async () => {
        await waitForDiscover(grandparent, parent);

        expectContext(doc, {
          isRoot: true,
          root: doc,
          parent: null,
          children: [grandparent],
          discoverable: false,
        });
        expectContext(grandparent, {
          parent: doc,
          children: [parent, cousin1],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
        expectContext(parent, {
          parent: grandparent,
          children: [sibling1, sibling2],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
        expectContext(sibling1, {
          parent,
          children: [],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
        expectContext(sibling2, {
          parent,
          children: [],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
        expectContext(cousin1, {
          parent: grandparent,
          children: [],
          isRoot: false,
          root: doc,
          discoverable: true,
        });
      });

      it('should move to new root', async () => {
        await waitForDiscover(grandparent, parent);

        const doc2 = document.implementation.createHTMLDocument('');
        ContextNode.get(doc2);
        doc2.body.appendChild(tree);
        await rediscover(grandparent);

        expectContext(doc, {
          parent: null,
          children: [],
          isRoot: true,
          root: doc,
          discoverable: false,
        });
        expectContext(doc2, {
          parent: null,
          children: [grandparent],
          isRoot: true,
          root: doc2,
          discoverable: false,
        });
        expectContext(grandparent, {
          parent: doc2,
          children: [parent, cousin1],
          root: doc2,
        });
        expectContext(parent, {
          parent: grandparent,
          children: [sibling1, sibling2],
          root: doc2,
        });
        expectContext(sibling1, {
          parent,
          children: [],
          root: doc2,
        });
        expectContext(sibling2, {
          parent,
          children: [],
          root: doc2,
        });
        expectContext(cousin1, {
          parent: grandparent,
          children: [],
          root: doc2,
        });
      });

      it('should override the root', async () => {
        await waitForDiscover(grandparent, parent);

        ContextNode.get(grandparent).setIsRoot(true);

        expectContext(grandparent, {
          parent: doc,
          children: [parent, cousin1],
          isRoot: true,
          root: grandparent,
          discoverable: false,
        });
        expectContext(parent, {
          parent: grandparent,
          children: [sibling1, sibling2],
          isRoot: false,
          root: grandparent,
          discoverable: true,
        });
        expectContext(sibling1, {
          parent,
          children: [],
          isRoot: false,
          root: grandparent,
          discoverable: true,
        });
        expectContext(sibling2, {
          parent,
          children: [],
          isRoot: false,
          root: grandparent,
          discoverable: true,
        });
        expectContext(cousin1, {
          parent: grandparent,
          children: [],
          isRoot: false,
          root: grandparent,
          discoverable: true,
        });
      });
    });
  });

  describe('discover shadow DOM', () => {
    let sibling1;
    let sibling2;
    let parent;

    beforeEach(() => {
      sibling1 = el('T-1-1-1');
      sibling2 = el('T-1-1-2');
      parent = el('T-1-1');
    });

    it('should rediscover slots when shadow root is added', async () => {
      doc.body.appendChild(tree);
      await waitForDiscover(parent, sibling1, sibling2);

      const shadowRoot = parent.attachShadow({mode: 'open'});
      ContextNode.get(shadowRoot).setParent(parent);

      const slot1 = doc.createElement('slot');
      slot1.name = 'slot1';
      sibling1.setAttribute('slot', 'slot1');
      shadowRoot.appendChild(slot1);
      await waitForDiscover(shadowRoot, sibling1);

      // sibling1's parent is shadow root because it matches the slot.
      expectContext(sibling1, {parent: shadowRoot});
      // sibling2's parent stays with "parent" because it's unslotted.
      expectContext(sibling2, {parent});
    });

    describe('shadow DOM exists from the start', () => {
      let shadowRoot;
      let slot1, slot1Parent;

      beforeEach(async () => {
        shadowRoot = parent.attachShadow({mode: 'open'});
        ContextNode.get(shadowRoot).setParent(parent);

        slot1Parent = doc.createElement('div');
        slot1Parent.id = 'slot1-parent';
        shadowRoot.appendChild(slot1Parent);

        slot1 = doc.createElement('slot');
        slot1.id = slot1.name = 'slot1';
        sibling1.setAttribute('slot', 'slot1');
        slot1Parent.appendChild(slot1);

        doc.body.appendChild(tree);
        await waitForDiscover(parent, shadowRoot, sibling1, sibling2);
      });

      function awaitSlotChange() {
        return new Promise((resolve) => {
          shadowRoot.addEventListener('slotchange', resolve);
        });
      }

      it('should assign shadow root as a parent via slot', () => {
        // sibling1's parent is shadow root because it matches the slot.
        expectContext(sibling1, {parent: shadowRoot});
        // sibling2's parent stays with "parent" because it's unslotted.
        expectContext(sibling2, {parent});
      });

      it('should reassign when slots change', async () => {
        sibling1.removeAttribute('slot');
        sibling2.setAttribute('slot', 'slot1');
        await awaitSlotChange();
        clock.runAll();

        // sibling1's parent stays with "parent" because it's unslotted.
        expectContext(sibling1, {parent});
        // sibling2's parent is shadow root because it matches the slot.
        expectContext(sibling2, {parent: shadowRoot});
      });

      it('should reassign when slots are removed', async () => {
        slot1Parent.removeChild(slot1);
        await waitForDiscover(sibling1);
        // Returns to parent.
        expectContext(sibling1, {parent});
      });

      it('should reassign to slot if it becomes a context node', async () => {
        const sibling1Wait = waitForDiscover(sibling1);
        await rediscover(slot1);
        await sibling1Wait;
        // slot belongs to the shadow root.
        expectContext(slot1, {parent: shadowRoot});
        // sibling1's parent is slot now.
        expectContext(sibling1, {parent: slot1});
        // Not changed: unslotted.
        expectContext(sibling2, {parent});
      });

      it('should reassign to slot parent becomes a context node', async () => {
        const sibling1Wait = waitForDiscover(sibling1);
        await rediscover(slot1Parent);
        await sibling1Wait;
        // slot belongs to the shadow root.
        expectContext(slot1Parent, {parent: shadowRoot});
        // sibling1's parent is slot now.
        expectContext(sibling1, {parent: slot1Parent});
        // Not changed: unslotted.
        expectContext(sibling2, {parent});
      });
    });
  });

  describe('discover groups', () => {
    let sibling1;
    let sibling2;
    let cousin1;
    let parent;
    let grandparent;

    beforeEach(async () => {
      sibling1 = el('T-1-1-1');
      sibling2 = el('T-1-1-2');
      cousin1 = el('T-1-2-1');
      parent = el('T-1-1');
      grandparent = el('T-1');
      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);
    });

    it('should rediscover children when a new group is added', async () => {
      const group1 = ContextNode.get(parent).addGroup(
        'group1',
        (node) => node == sibling1,
        0
      );
      await waitForDiscover(group1, sibling1);
      clock.runAll();

      expect(group1.node).to.equal(parent);
      expectContext(group1, {parent, children: [sibling1]});

      // sibling1 is reassigned to the group.
      expectContext(sibling1, {parent: group1});

      // sibling2 stays stays unchanged.
      expectContext(sibling2, {parent});
    });

    it('should discover a new child', async () => {
      const sibling3 = el('T-1-1-3');
      const group1 = ContextNode.get(parent).addGroup(
        'group1',
        (node) => node == sibling3,
        0
      );
      await waitForDiscover(group1);

      // Discover the new node.
      await rediscover(sibling3);
      expectContext(sibling3, {parent: group1});
    });

    it('should handle weight', async () => {
      const group1 = ContextNode.get(parent).addGroup(
        'group1',
        (node) => node == sibling1,
        0
      );
      await waitForDiscover(group1, sibling1);
      expectContext(sibling1, {parent: group1});

      // A lower weight.
      const group2 = ContextNode.get(parent).addGroup(
        'group1',
        (node) => node == sibling1,
        -1
      );
      await waitForDiscover(group2, sibling1);
      expectContext(sibling1, {parent: group1});

      // A higher weight.
      const group3 = ContextNode.get(parent).addGroup(
        'group1',
        (node) => node == sibling1,
        1
      );
      await waitForDiscover(group3, sibling1);
      expectContext(sibling1, {parent: group3});
    });
  });

  describe('scanners', () => {
    const EXCLUDE_SELF = false;

    let parent;
    let grandparent;
    let sibling1;
    let sibling2;
    let cousin1;

    beforeEach(async () => {
      grandparent = ContextNode.get(el('T-1'));
      parent = ContextNode.get(el('T-1-1'));
      sibling1 = ContextNode.get(el('T-1-1-1'));
      sibling2 = ContextNode.get(el('T-1-1-2'));
      cousin1 = ContextNode.get(el('T-1-2-1'));
      await waitForDiscover(grandparent, parent, sibling1, sibling2, cousin1);
    });

    it('should find closest', () => {
      const any = () => true;
      expect(findParent(sibling1, any)).to.equal(sibling1);
      expect(findParent(sibling1, any, null, EXCLUDE_SELF)).to.equal(parent);

      const eq = (cn, arg) => cn === arg;
      expect(findParent(sibling1, eq, sibling1)).to.equal(sibling1);
      expect(findParent(sibling1, eq, sibling1, EXCLUDE_SELF)).to.be.null;
      expect(findParent(sibling1, eq, parent)).to.equal(parent);
    });

    it('should scan the subtree completely', () => {
      const scanned = [];

      const scan = (cn, exclude) => {
        scanned.push(cn);
        if (exclude && exclude.indexOf(cn) != -1) {
          return false;
        }
        return true;
      };

      // Scan all.
      scanned.length = 0;
      deepScan(grandparent, scan);
      expect(scanned).to.deep.equal([
        grandparent,
        parent,
        sibling1,
        sibling2,
        cousin1,
      ]);

      // Scan subtree.
      scanned.length = 0;
      deepScan(grandparent, scan, null, true, EXCLUDE_SELF);
      expect(scanned).to.deep.equal([parent, sibling1, sibling2, cousin1]);

      // Scan some.
      scanned.length = 0;
      deepScan(grandparent, scan, [parent]);
      expect(scanned).to.deep.equal([grandparent, parent, cousin1]);
    });
  });
});
