import {Deferred} from '#core/data-structures/promise';
import {
  measureBorderBoxSize,
  measureContentSize,
  observeBorderBoxSize,
  observeContentSize,
  unobserveBorderBoxSize,
  unobserveContentSize,
} from '#core/dom/layout/size-observer';
import {removeItem} from '#core/types/array';

describes.realWin('DOM - layout - size-observer', {}, (env) => {
  let win, doc;
  let observer;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    element = doc.createElement('div');
    element.id = 'element1';
    doc.body.appendChild(element);

    class FakeResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.elements = [];
      }

      disconnect() {}

      observe(element) {
        if (this.elements.includes(element)) {
          throw new Error('already observed');
        }
        this.elements.push(element);
      }

      unobserve(element) {
        if (!this.elements.includes(element)) {
          throw new Error('not observed');
        }
        removeItem(this.elements, element);
      }

      notify(entries) {
        const {callback} = this;
        Promise.resolve().then(() => {
          callback(entries);
        });
      }
    }

    env.sandbox.stub(win, 'ResizeObserver').value(function (callback) {
      if (!observer) {
        observer = new FakeResizeObserver(callback);
      }
      return observer;
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

  describe('content size', () => {
    it('should measure content size', async () => {
      const promise = measureContentSize(element);
      observer.notify([
        {target: element, contentRect: {width: 101, height: 102}},
      ]);
      const {height, width} = await promise;
      expect(width).to.equal(101);
      expect(height).to.equal(102);
      expect(observer.elements).to.not.include(element);
    });

    it('should observe changes', async () => {
      const callbackCaller = createCallbackCaller();
      observeContentSize(element, callbackCaller);

      // First response.
      observer.notify([
        {target: element, contentRect: {width: 101, height: 102}},
      ]);
      const size1 = await callbackCaller.next();
      expect(size1.width).to.equal(101);
      expect(size1.height).to.equal(102);

      // Resize.
      observer.notify([
        {target: element, contentRect: {width: 201, height: 102}},
      ]);
      const size2 = await callbackCaller.next();
      expect(size2.width).to.equal(201);
      expect(size2.height).to.equal(102);
    });

    it('should only observe last change', async () => {
      const callbackCaller = createCallbackCaller();
      observeContentSize(element, callbackCaller);

      observer.notify([
        {target: element, contentRect: {width: 101, height: 102}},
        {target: element, contentRect: {width: 103, height: 102}},
      ]);
      const size1 = await callbackCaller.next();
      expect(size1.width).to.equal(103);
      expect(size1.height).to.equal(102);
      expect(callbackCaller.isEmpty()).to.be.true;
    });

    it('should observe multiple callbacks', async () => {
      // First callback.
      const callbackCaller1 = createCallbackCaller();
      observeContentSize(element, callbackCaller1);
      observer.notify([
        {target: element, contentRect: {width: 101, height: 102}},
      ]);
      const size1 = await callbackCaller1.next();
      expect(size1.width).to.equal(101);
      expect(size1.height).to.equal(102);

      // Second callback.
      const callbackCaller2 = createCallbackCaller();
      observeContentSize(element, callbackCaller2);
      const size2 = await callbackCaller2.next();
      expect(size2.width).to.equal(101);
      expect(size2.height).to.equal(102);
    });

    it('should unobserve multiple callbacks', async () => {
      const callbackCaller1 = createCallbackCaller();
      const callbackCaller2 = createCallbackCaller();
      observeContentSize(element, callbackCaller1);
      observeContentSize(element, callbackCaller2);
      expect(observer.elements).to.include(element);

      // Unobserve first callback.
      unobserveContentSize(element, callbackCaller2);
      expect(observer.elements).to.include(element);

      // Unobserve second callback.
      unobserveContentSize(element, callbackCaller1);
      expect(observer.elements).to.not.include(element);
    });
  });

  describe('border-box size', () => {
    it('should measure border size', async () => {
      const promise = measureBorderBoxSize(element);
      observer.notify([
        {target: element, borderBoxSize: [{inlineSize: 101, blockSize: 102}]},
      ]);
      const {blockSize, inlineSize} = await promise;
      expect(inlineSize).to.equal(101);
      expect(blockSize).to.equal(102);
      expect(observer.elements).to.not.include(element);
    });

    it('should fallback to offsetWidth and offsetHeight as a polyfill', async () => {
      env.sandbox.stub(element, 'offsetWidth').value(101);
      env.sandbox.stub(element, 'offsetHeight').value(102);
      const promise = measureBorderBoxSize(element);
      observer.notify([{target: element}]);
      const {blockSize, inlineSize} = await promise;
      expect(inlineSize).to.equal(101);
      expect(blockSize).to.equal(102);
      expect(observer.elements).to.not.include(element);
    });

    it('should fallback to offsetWidth and offsetHeight as a polyfill in vertical mode', async () => {
      element.style.writingMode = 'vertical-lr';
      env.sandbox.stub(element, 'offsetWidth').value(101);
      env.sandbox.stub(element, 'offsetHeight').value(102);
      const promise = measureBorderBoxSize(element);
      observer.notify([{target: element}]);
      const {blockSize, inlineSize} = await promise;
      expect(inlineSize).to.equal(102);
      expect(blockSize).to.equal(101);
      expect(observer.elements).to.not.include(element);
    });

    it('should not conflict with content size observers', async () => {
      const contentSizeCallbackCaller = createCallbackCaller();
      observeContentSize(element, contentSizeCallbackCaller);

      const borderBoxSizeCallbackCaller = createCallbackCaller();
      observeBorderBoxSize(element, borderBoxSizeCallbackCaller);

      expect(observer.elements).to.include(element);

      await observer.notify([
        {
          target: element,
          contentRect: {width: 101, height: 102},
          borderBoxSize: [{inlineSize: 201, blockSize: 202}],
        },
      ]);

      const contentSize = await contentSizeCallbackCaller.next();
      expect(contentSize.width).to.equal(101);
      expect(contentSize.height).to.equal(102);

      const borderBoxSize = await borderBoxSizeCallbackCaller.next();
      expect(borderBoxSize.inlineSize).to.equal(201);
      expect(borderBoxSize.blockSize).to.equal(202);

      unobserveContentSize(element, contentSizeCallbackCaller);
      expect(observer.elements).to.include(element);

      unobserveBorderBoxSize(element, borderBoxSizeCallbackCaller);
      expect(observer.elements).to.not.include(element);
    });

    it('should observe changes', async () => {
      const callbackCaller = createCallbackCaller();
      observeBorderBoxSize(element, callbackCaller);

      // First response.
      observer.notify([
        {target: element, borderBoxSize: [{inlineSize: 201, blockSize: 202}]},
      ]);
      const size1 = await callbackCaller.next();
      expect(size1.inlineSize).to.equal(201);
      expect(size1.blockSize).to.equal(202);

      // Resize.
      observer.notify([
        {target: element, borderBoxSize: [{inlineSize: 301, blockSize: 202}]},
      ]);
      const size2 = await callbackCaller.next();
      expect(size2.inlineSize).to.equal(301);
      expect(size2.blockSize).to.equal(202);
    });

    it('should observe multiple callbacks', async () => {
      // First callback.
      const callbackCaller1 = createCallbackCaller();
      observeBorderBoxSize(element, callbackCaller1);
      observer.notify([
        {target: element, borderBoxSize: [{inlineSize: 201, blockSize: 202}]},
      ]);
      const size1 = await callbackCaller1.next();
      expect(size1.inlineSize).to.equal(201);
      expect(size1.blockSize).to.equal(202);

      // Second callback.
      const callbackCaller2 = createCallbackCaller();
      observeBorderBoxSize(element, callbackCaller2);
      const size2 = await callbackCaller2.next();
      expect(size2.inlineSize).to.equal(201);
      expect(size2.blockSize).to.equal(202);
    });

    it('should unobserve multiple callbacks', async () => {
      const callbackCaller1 = createCallbackCaller();
      const callbackCaller2 = createCallbackCaller();
      observeBorderBoxSize(element, callbackCaller1);
      observeBorderBoxSize(element, callbackCaller2);
      expect(observer.elements).to.include(element);

      // Unobserve first callback.
      unobserveBorderBoxSize(element, callbackCaller2);
      expect(observer.elements).to.include(element);

      // Unobserve second callback.
      unobserveBorderBoxSize(element, callbackCaller1);
      expect(observer.elements).to.not.include(element);
    });
  });
});
