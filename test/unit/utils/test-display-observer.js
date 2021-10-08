import {Deferred} from '#core/data-structures/promise';
import {removeItem} from '#core/types/array';

import {
  measureDisplay,
  observeDisplay,
  registerContainer,
  unobserveDisplay,
  unregisterContainer,
} from '#utils/display-observer';

describes.realWin('display-observer', {amp: true}, (env) => {
  let win, doc, ampdoc;
  let element;
  let docObserver, viewportObserver, containerObservers;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    element = doc.createElement('div');
    element.id = 'element1';
    doc.body.appendChild(element);

    class FakeIntersectionObserver {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.elements = [];
      }

      disconnect() {
        this.elements.length = 0;
      }

      observe(element) {
        if (this.elements.includes(element)) {
          throw new Error('already observed');
        }
        this.elements.push(element);
      }

      unobserve(element) {
        if (!this.elements.includes(element)) {
          throw new Error(
            'not observed: ' + element.id + ' on ' + this.options?.root?.id
          );
        }
        removeItem(this.elements, element);
      }

      notify(entries) {
        if (!entries.some(({target}) => this.elements.includes(target))) {
          throw new Error('unobserved target');
        }
        const {callback} = this;
        return Promise.resolve().then(() => {
          callback(entries, this);
        });
      }
    }

    docObserver = null;
    viewportObserver = null;
    containerObservers = new Map();
    env.sandbox
      .stub(win, 'IntersectionObserver')
      .value(function (callback, options) {
        if (!options.root) {
          return (viewportObserver =
            viewportObserver ||
            new FakeIntersectionObserver(callback, options));
        }
        if (options.root == doc.body) {
          return (docObserver =
            docObserver || new FakeIntersectionObserver(callback, options));
        }
        if (options.root) {
          const containerObserver = new FakeIntersectionObserver(
            callback,
            options
          );
          containerObservers.set(options.root, containerObserver);
          return containerObserver;
        }
        return new FakeIntersectionObserver(callback, options);
      });
  });

  function createCallbackCaller() {
    const results = [];
    let deferred = null;
    const caller = (value) => {
      results.push(value);
      if (deferred) {
        const next = results.shift();
        deferred.resolve(next);
        deferred = null;
      }
    };
    caller.next = () => {
      if (results.length > 0) {
        const next = results.shift();
        return Promise.resolve(next);
      }
      deferred = new Deferred();
      return deferred.promise;
    };
    caller.isEmpty = () => results.length == 0;
    return caller;
  }

  describe('measureDisplay', () => {
    it('should measure display via doc observer', async () => {
      const promise = measureDisplay(element);
      docObserver.notify([{target: element, isIntersecting: true}]);
      const isDisplayed = await promise;
      expect(isDisplayed).to.be.true;
      expect(docObserver.elements).to.not.include(element);
    });

    it('should measure display via viewport observer', async () => {
      const promise = measureDisplay(element);
      viewportObserver.notify([{target: element, isIntersecting: true}]);
      const isDisplayed = await promise;
      expect(isDisplayed).to.be.true;
      expect(viewportObserver.elements).to.not.include(element);
    });

    it('should measure display via one of observers', async () => {
      const promise = measureDisplay(element);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      docObserver.notify([{target: element, isIntersecting: true}]);
      const isDisplayed = await promise;
      expect(isDisplayed).to.be.true;
      expect(docObserver.elements).to.not.include(element);
      expect(viewportObserver.elements).to.not.include(element);
    });

    it('should measure display via as false', async () => {
      const promise = measureDisplay(element);
      docObserver.notify([{target: element, isIntersecting: false}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const isDisplayed = await promise;
      expect(isDisplayed).to.be.false;
      expect(docObserver.elements).to.not.include(element);
      expect(viewportObserver.elements).to.not.include(element);
    });
  });

  describe('observe', () => {
    it('should observe changes: true -> false', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      docObserver.notify([{target: element, isIntersecting: true}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;

      // Change intersection.
      docObserver.notify([{target: element, isIntersecting: false}]);
      const display2 = await callbackCaller.next();
      expect(display2).to.be.false;

      // No change.
      await viewportObserver.notify([{target: element, isIntersecting: false}]);
      expect(callbackCaller.isEmpty()).to.be.true;
    });

    it('should observe changes: false -> true', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      await docObserver.notify([{target: element, isIntersecting: false}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.false;

      // Change intersection.
      docObserver.notify([{target: element, isIntersecting: true}]);
      const display2 = await callbackCaller.next();
      expect(display2).to.be.true;

      // No change.
      viewportObserver.notify([{target: element, isIntersecting: true}]);
      expect(callbackCaller.isEmpty()).to.be.true;
    });

    it('should ignore unknown intersection', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      await docObserver.notify([{target: element, isIntersecting: false}]);
      expect(callbackCaller.isEmpty()).to.be.true;

      // Change intersection.
      await docObserver.notify([{target: element, isIntersecting: true}]);
      expect(callbackCaller.isEmpty()).to.be.false;
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;
    });

    it('should only observe last change', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      viewportObserver.notify([{target: element, isIntersecting: false}]);
      docObserver.notify([
        {target: element, isIntersecting: false},
        {target: element, isIntersecting: true},
      ]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;
      expect(callbackCaller.isEmpty()).to.be.true;
    });

    it('should observe multiple callbacks', async () => {
      // First callback.
      const callbackCaller1 = createCallbackCaller();
      observeDisplay(element, callbackCaller1);
      docObserver.notify([{target: element, isIntersecting: true}]);
      const display1 = await callbackCaller1.next();
      expect(display1).to.be.true;

      // Second callback.
      const callbackCaller2 = createCallbackCaller();
      observeDisplay(element, callbackCaller2);
      const display2 = await callbackCaller2.next();
      expect(display2).to.be.true;
    });

    it('should unobserve multiple callbacks', async () => {
      const callbackCaller1 = createCallbackCaller();
      const callbackCaller2 = createCallbackCaller();
      observeDisplay(element, callbackCaller1);
      observeDisplay(element, callbackCaller2);
      expect(docObserver.elements).to.include(element);
      expect(viewportObserver.elements).to.include(element);

      // Unobserve first callback.
      unobserveDisplay(element, callbackCaller2);
      expect(docObserver.elements).to.include(element);
      expect(viewportObserver.elements).to.include(element);

      // Unobserve second callback.
      unobserveDisplay(element, callbackCaller1);
      expect(docObserver.elements).to.not.include(element);
      expect(viewportObserver.elements).to.not.include(element);
    });

    it('should observe document visibility', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      docObserver.notify([{target: element, isIntersecting: true}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;

      // Paused visibility.
      ampdoc.overrideVisibilityState('paused');
      const display2 = await callbackCaller.next();
      expect(display2).to.be.false;

      // Visibile visibility.
      ampdoc.overrideVisibilityState('visible');
      const display3 = await callbackCaller.next();
      expect(display3).to.be.true;
    });

    it('should treat hidden document visibility as displayed', async () => {
      const callbackCaller = createCallbackCaller();
      observeDisplay(element, callbackCaller);

      // First response.
      docObserver.notify([{target: element, isIntersecting: true}]);
      viewportObserver.notify([{target: element, isIntersecting: false}]);
      const display1 = await callbackCaller.next();
      expect(display1).to.be.true;

      // Paused visibility.
      ampdoc.overrideVisibilityState('paused');
      const display2 = await callbackCaller.next();
      expect(display2).to.be.false;

      // Hidden visibility.
      ampdoc.overrideVisibilityState('hidden');
      const display3 = await callbackCaller.next();
      expect(display3).to.be.true;
    });
  });

  describe('registerContainer', () => {
    let container;
    let topElement;

    beforeEach(() => {
      container = doc.createElement('div');
      container.id = 'container1';
      doc.body.appendChild(container);
      container.appendChild(element);

      topElement = doc.createElement('div');
      topElement.id = 'topElement1';
      doc.body.appendChild(topElement);
    });

    it('should create observer only after container display is known', async () => {
      registerContainer(container);
      expect(containerObservers.get(container)).to.not.exist;

      await viewportObserver.notify([
        {target: container, isIntersecting: false},
      ]);
      expect(containerObservers.get(container)).to.not.exist;

      await viewportObserver.notify([
        {target: container, isIntersecting: true},
      ]);
      expect(containerObservers.get(container)).to.exist;
    });

    it('should only observe contained elements', async () => {
      const elementCallback = createCallbackCaller();
      observeDisplay(element, elementCallback);
      const topElementCallback = createCallbackCaller();
      observeDisplay(topElement, topElementCallback);

      viewportObserver.notify([{target: element, isIntersecting: false}]);
      docObserver.notify([{target: element, isIntersecting: false}]);
      viewportObserver.notify([{target: topElement, isIntersecting: false}]);
      docObserver.notify([{target: topElement, isIntersecting: false}]);

      const display1 = await elementCallback.next();
      const display2 = await topElementCallback.next();
      expect(display1).to.be.false;
      expect(display2).to.be.false;

      registerContainer(container);
      await viewportObserver.notify([
        {target: container, isIntersecting: true},
      ]);

      const containerObserver = containerObservers.get(container);
      expect(containerObserver.elements).to.include(element);
      expect(containerObserver.elements).to.not.include(topElement);

      containerObserver.notify([{target: element, isIntersecting: true}]);
      const display3 = await elementCallback.next();
      const display4 = await topElementCallback.next();
      expect(display3).to.be.true;
      expect(display4).to.be.false; // no change.
    });

    it('should unregister observer', async () => {
      const elementCallback = createCallbackCaller();
      observeDisplay(element, elementCallback);

      viewportObserver.notify([{target: element, isIntersecting: false}]);
      docObserver.notify([{target: element, isIntersecting: false}]);

      const display1 = await elementCallback.next();
      expect(display1).to.be.false;

      registerContainer(container);
      await viewportObserver.notify([
        {target: container, isIntersecting: true},
      ]);
      const containerObserver = containerObservers.get(container);
      containerObserver.notify([{target: element, isIntersecting: true}]);
      const display2 = await elementCallback.next();
      expect(display2).to.be.true;

      unregisterContainer(container);
      expect(docObserver.elements).to.not.include(container);
      expect(containerObserver.elements).to.not.include(element);

      const display3 = await elementCallback.next();
      expect(display3).to.be.false;
    });

    it('should change display when container observer is notified', async () => {
      const elementCallback = createCallbackCaller();
      observeDisplay(element, elementCallback);

      viewportObserver.notify([{target: element, isIntersecting: false}]);
      docObserver.notify([{target: element, isIntersecting: false}]);

      const display1 = await elementCallback.next();
      expect(display1).to.be.false;

      registerContainer(container);
      await viewportObserver.notify([
        {target: container, isIntersecting: true},
      ]);

      const containerObserver = containerObservers.get(container);
      containerObserver.notify([{target: element, isIntersecting: true}]);
      const display2 = await elementCallback.next();
      expect(display2).to.be.true;

      containerObserver.notify([{target: element, isIntersecting: false}]);
      const display3 = await elementCallback.next();
      expect(display3).to.be.false;
    });

    it('should change display when container display has changed', async () => {
      const elementCallback = createCallbackCaller();
      observeDisplay(element, elementCallback);

      viewportObserver.notify([{target: element, isIntersecting: false}]);
      docObserver.notify([{target: element, isIntersecting: false}]);

      const display1 = await elementCallback.next();
      expect(display1).to.be.false;

      registerContainer(container);
      await docObserver.notify([{target: container, isIntersecting: false}]);
      await viewportObserver.notify([
        {target: container, isIntersecting: true},
      ]);

      const containerObserver = containerObservers.get(container);
      containerObserver.notify([{target: element, isIntersecting: true}]);
      const display2 = await elementCallback.next();
      expect(display2).to.be.true;

      await viewportObserver.notify([
        {target: container, isIntersecting: false},
      ]);
      const display3 = await elementCallback.next();
      expect(display3).to.be.false;
    });

    it('should compute display for nested observers', async () => {
      const childContainer = doc.createElement('div');
      childContainer.id = 'child-container1';
      container.appendChild(childContainer);
      childContainer.appendChild(element);

      const elementCallback = createCallbackCaller();
      observeDisplay(element, elementCallback);
      await viewportObserver.notify([{target: element, isIntersecting: false}]);
      expect(elementCallback.isEmpty()).to.be.true;

      await docObserver.notify([{target: element, isIntersecting: false}]);
      expect(await elementCallback.next()).to.be.false;

      // 1. Register childContainer.
      registerContainer(childContainer);
      expect(containerObservers.get(childContainer)).to.not.exist;
      expect(elementCallback.isEmpty()).to.be.true;

      // 2. Make child container undisplayed.
      await viewportObserver.notify([
        {target: childContainer, isIntersecting: false},
      ]);
      await docObserver.notify([
        {target: childContainer, isIntersecting: false},
      ]);
      expect(containerObservers.get(childContainer)).to.not.exist;
      expect(await elementCallback.next()).to.be.false;

      // 3. Register parent container.
      registerContainer(container);
      expect(containerObservers.get(container)).to.not.exist;
      expect(elementCallback.isEmpty()).to.be.true;

      // 4. Make parent container displayed, but child is still undisplayed.
      await docObserver.notify([{target: container, isIntersecting: true}]);
      expect(containerObservers.get(container)).to.exist;
      expect(elementCallback.isEmpty()).to.be.true;

      // 5. Intersect the child container inside the parent container.
      await containerObservers
        .get(container)
        .notify([{target: childContainer, isIntersecting: true}]);
      expect(containerObservers.get(childContainer)).to.exist;
      expect(elementCallback.isEmpty()).to.be.true;

      // 6. Intesect the element inside the child container.
      await containerObservers
        .get(childContainer)
        .notify([{target: element, isIntersecting: true}]);
      expect(await elementCallback.next()).to.be.true;
    });

    it('should not interrupt observations for the unrelated targets', async () => {
      const elementCallback = createCallbackCaller();
      observeDisplay(topElement, elementCallback);

      // 1. Register a container, but not observations on it yet.
      registerContainer(container);
      expect(elementCallback.isEmpty()).to.be.true;

      await viewportObserver.notify([
        {target: topElement, isIntersecting: false},
      ]);
      await docObserver.notify([{target: topElement, isIntersecting: false}]);
      expect(await elementCallback.next()).to.be.false;

      // 2. Provide observations for the container.
      await docObserver.notify([{target: container, isIntersecting: true}]);
      expect(containerObservers.get(container)).to.exist;
      expect(elementCallback.isEmpty()).to.be.true;
    });
  });
});
