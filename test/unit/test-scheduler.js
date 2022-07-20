import * as fakeTimers from '@sinonjs/fake-timers';

import {createElementWithAttributes} from '#core/dom';
import {LayoutPriority_Enum} from '#core/dom/layout';

import {READY_SCAN_SIGNAL} from '#service/resources-interface';
import {Scheduler} from '#service/scheduler';

import {installIntersectionObserverStub} from '#testing/intersection-observer-stub';

describes.realWin('Scheduler', {amp: true}, (env) => {
  let win, doc, ampdoc;
  let setAmpdocReady;
  let clock;
  let intersectionObserverStub;
  let scheduler;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;

    let ampdocReady = false;
    let ampdocReadyResolver;
    const ampdocReadyPromise = new Promise((resolve) => {
      ampdocReadyResolver = resolve;
    });
    setAmpdocReady = () => {
      ampdocReady = true;
      ampdocReadyResolver();
      return ampdocReadyPromise.then(() => {});
    };
    env.sandbox.stub(ampdoc, 'whenReady').returns(ampdocReadyPromise);
    env.sandbox.stub(ampdoc, 'isReady').callsFake(() => ampdocReady);

    delete win.requestIdleCallback;
    clock = fakeTimers.withGlobal(win).install();
    win.requestIdleCallback = (callback) => {
      win.setTimeout(callback, 100);
    };

    intersectionObserverStub = installIntersectionObserverStub(
      env.sandbox,
      win
    );

    scheduler = new Scheduler(ampdoc);
  });

  afterEach(() => {
    clock.uninstall();
  });

  function createAmpElement(options = {}) {
    const element = createElementWithAttributes(doc, 'amp-el', {
      id: options.id || '',
    });
    element.deferredMount = () => options.deferredMount || false;
    element.prerenderAllowed = () => options.prerenderAllowed || false;
    element.previewAllowed = () => options.previewAllowed || false;
    element.getBuildPriority = () =>
      options.buildPriority || LayoutPriority_Enum.CONTENT;
    element.mountInternal = env.sandbox.stub();
    return element;
  }

  describe('schedule', () => {
    it('should schedule a deferredMount element', () => {
      const element = createAmpElement({deferredMount: true});
      scheduler.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.true;

      scheduler.unschedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
    });

    it('should use the correct observer parameters', () => {
      const element = createAmpElement({deferredMount: true});
      scheduler.schedule(element);

      expect(
        intersectionObserverStub.isObserved(element, {
          root: doc,
          rootMargin: '250% 31.25%',
          thresholds: [0],
        })
      ).to.be.true;
    });

    it('should schedule a non-deferredMount element', () => {
      const element = createAmpElement({deferredMount: false});
      scheduler.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
    });

    it('should unschedule when built', async () => {
      const element = createAmpElement({deferredMount: true});
      scheduler.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.true;

      await setAmpdocReady();
      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: true,
      });
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
    });

    it('should NOT signal READY_SCAN_SIGNAL until document is ready', async () => {
      ampdoc.signals().reset(READY_SCAN_SIGNAL);
      const element = createAmpElement({deferredMount: false});
      scheduler.schedule(element);
      expect(ampdoc.signals().get(READY_SCAN_SIGNAL)).to.be.null;

      clock.tick(50);
      expect(ampdoc.signals().get(READY_SCAN_SIGNAL)).to.be.null;
    });

    it('should signal READY_SCAN_SIGNAL after document ready', async () => {
      ampdoc.signals().reset(READY_SCAN_SIGNAL);
      await setAmpdocReady();
      clock.tick(50);
      expect(ampdoc.signals().get(READY_SCAN_SIGNAL)).to.exist;
    });
  });

  describe('wait for parsing', () => {
    it('should build when document ready', async () => {
      await setAmpdocReady();
      const element = createAmpElement({deferredMount: false});
      scheduler.schedule(element);
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should build when document becomes ready', async () => {
      const element = createAmpElement({deferredMount: false});
      scheduler.schedule(element);
      clock.tick(1);
      expect(element.mountInternal).to.be.not.called;

      await setAmpdocReady();
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should build asap when document ready', async () => {
      await setAmpdocReady();
      const element = createAmpElement({deferredMount: true});
      scheduler.scheduleAsap(element);
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should build asap when document becomes ready', async () => {
      const element = createAmpElement({deferredMount: true});
      scheduler.scheduleAsap(element);
      clock.tick(1);
      expect(element.mountInternal).to.be.not.called;

      await setAmpdocReady();
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should build when has next siblings', async () => {
      const element = createAmpElement({deferredMount: false});
      doc.body.appendChild(element);
      scheduler.schedule(element);
      clock.tick(1);
      expect(element.mountInternal).to.not.be.called;

      const element2 = createAmpElement({deferredMount: false});
      doc.body.appendChild(element2);
      scheduler.schedule(element2);
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
      expect(element2.mountInternal).to.not.be.called;
    });

    it('should build asap when has next siblings', async () => {
      const element = createAmpElement({deferredMount: false});
      doc.body.appendChild(element);
      scheduler.scheduleAsap(element);
      clock.tick(1);
      expect(element.mountInternal).to.not.be.called;

      const element2 = createAmpElement({deferredMount: false});
      doc.body.appendChild(element2);
      scheduler.scheduleAsap(element2);
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
      expect(element2.mountInternal).to.not.be.called;
    });

    it('should wait the deferred even when parsed', async () => {
      await setAmpdocReady();
      const element = createAmpElement({deferredMount: true});
      doc.body.appendChild(element);
      scheduler.schedule(element);
      clock.tick(1);
      expect(element.mountInternal).to.not.be.called;
    });
  });

  describe('wait for document visibility', () => {
    describe('visibility state: prerender', () => {
      beforeEach(async () => {
        ampdoc.overrideVisibilityState('prerender');
        await setAmpdocReady();
      });

      it('should build if prerenderAllowed', () => {
        const element = createAmpElement({
          deferredMount: false,
          prerenderAllowed: true,
        });
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should build asap if prerenderAllowed', () => {
        const element = createAmpElement({
          deferredMount: true,
          prerenderAllowed: true,
        });
        scheduler.scheduleAsap(element);
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should NOT build if not prerenderAllowed', () => {
        const element = createAmpElement({
          deferredMount: false,
          prerenderAllowed: false,
        });
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.be.not.called;
      });

      it('should NOT build asap if not prerenderAllowed', () => {
        const element = createAmpElement({
          deferredMount: true,
          prerenderAllowed: false,
        });
        scheduler.scheduleAsap(element);
        clock.tick(1);
        expect(element.mountInternal).to.be.not.called;
      });

      it('should build when becomes preview if previewAllowed', () => {
        const element = createAmpElement({
          prerenderAllowed: false,
          previewAllowed: true,
        });
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('preview');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should NOT build when becomes preview if not previewAllowed', () => {
        const element = createAmpElement({
          prerenderAllowed: false,
          previewAllowed: false,
        });
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('preview');
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;
      });

      it('should build when becomes visible', () => {
        const element = createAmpElement({prerenderAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('visible');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should build when becomes hidden', () => {
        const element = createAmpElement({prerenderAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('hidden');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should NOT build when becomes paused or inactive', () => {
        const element = createAmpElement({prerenderAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('paused');
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('inactive');
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;
      });

      it('should NOT build when scheduled in paused', () => {
        ampdoc.overrideVisibilityState('paused');

        const element = createAmpElement({prerenderAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('visible');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should NOT build when scheduled in inactive', () => {
        ampdoc.overrideVisibilityState('inactive');

        const element = createAmpElement({prerenderAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('visible');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });
    });

    describe('visibility state: preview', () => {
      beforeEach(async () => {
        ampdoc.overrideVisibilityState('preview');
        await setAmpdocReady();
      });

      it('should build if previewAllowed', () => {
        const element = createAmpElement({
          deferredMount: false,
          previewAllowed: true,
        });
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should build asap if previewAllowed', () => {
        const element = createAmpElement({
          deferredMount: true,
          previewAllowed: true,
        });
        scheduler.scheduleAsap(element);
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should NOT build if not previewAllowed', () => {
        const element = createAmpElement({
          deferredMount: false,
          previewAllowed: false,
        });
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.be.not.called;
      });

      it('should NOT build asap if not previewAllowed', () => {
        const element = createAmpElement({
          deferredMount: true,
          previewAllowed: false,
        });
        scheduler.scheduleAsap(element);
        clock.tick(1);
        expect(element.mountInternal).to.be.not.called;
      });

      it('should build when becomes prerender if prerenderAllowed', () => {
        const element = createAmpElement({
          prerenderAllowed: true,
          previewAllowed: false,
        });
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('prerender');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should NOT build when becomes prerender if not prerenderAllowed', () => {
        const element = createAmpElement({
          prerenderAllowed: false,
          previewAllowed: false,
        });
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('prerender');
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;
      });

      it('should build when becomes visible', () => {
        const element = createAmpElement({previewAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('visible');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should build when becomes hidden', () => {
        const element = createAmpElement({previewAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('hidden');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should NOT build when becomes paused or inactive', () => {
        const element = createAmpElement({previewAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('paused');
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('inactive');
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;
      });

      it('should NOT build when scheduled in paused', () => {
        ampdoc.overrideVisibilityState('paused');

        const element = createAmpElement({previewAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('visible');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });

      it('should NOT build when scheduled in inactive', () => {
        ampdoc.overrideVisibilityState('inactive');

        const element = createAmpElement({previewAllowed: false});
        scheduler.schedule(element);
        clock.tick(1);
        expect(element.mountInternal).to.not.be.called;

        ampdoc.overrideVisibilityState('visible');
        clock.tick(1);
        expect(element.mountInternal).to.be.calledOnce;
      });
    });
  });

  describe('wait for intersection', () => {
    beforeEach(async () => {
      await setAmpdocReady();
    });

    it('should wait for intersection when deferred', () => {
      const element = createAmpElement({deferredMount: true});
      scheduler.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.true;
      clock.tick(1);
      expect(element.mountInternal).to.not.be.called;

      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: false,
      });
      clock.tick(1);
      expect(element.mountInternal).to.not.be.called;

      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: true,
      });
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should not wait for intersection when not deferred', () => {
      const element = createAmpElement({deferredMount: false});
      scheduler.schedule(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should not wait for intersection when asap', () => {
      const element = createAmpElement({deferredMount: true});
      scheduler.scheduleAsap(element);
      expect(intersectionObserverStub.isObserved(element)).to.be.false;
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });
  });

  describe('priority', () => {
    beforeEach(async () => {
      await setAmpdocReady();
    });

    it('should run deferred CONTENT at high priority', () => {
      const element = createAmpElement({deferredMount: true});
      scheduler.schedule(element);
      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: true,
      });
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should run deferred METADATA at low priority', () => {
      const element = createAmpElement({
        deferredMount: true,
        buildPriority: LayoutPriority_Enum.METADATA,
      });
      scheduler.schedule(element);
      intersectionObserverStub.notifySync({
        target: element,
        isIntersecting: true,
      });
      clock.tick(1);
      expect(element.mountInternal).to.not.be.called;

      clock.tick(100);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should run non-deferred METADATA at low priority', () => {
      const element = createAmpElement({
        deferredMount: false,
        buildPriority: LayoutPriority_Enum.METADATA,
      });
      scheduler.schedule(element);
      clock.tick(1);
      expect(element.mountInternal).to.not.be.called;

      clock.tick(100);
      expect(element.mountInternal).to.be.calledOnce;
    });

    it('should run asap METADATA at high priority', () => {
      const element = createAmpElement({
        deferredMount: false,
        buildPriority: LayoutPriority_Enum.METADATA,
      });
      scheduler.scheduleAsap(element);
      clock.tick(1);
      expect(element.mountInternal).to.be.calledOnce;
    });
  });

  describe('container', () => {
    let container;
    let topElement;
    let containerScroller;
    let containerElement, containerElementChild;

    beforeEach(() => {
      container = createAmpElement({id: 'container', deferredMount: true});
      containerScroller = createElementWithAttributes(doc, 'div', {
        id: 'scroller',
      });

      topElement = createAmpElement({id: 'topElement', deferredMount: true});
      containerElement = createAmpElement({
        id: 'containerElement',
        deferredMount: true,
      });
      containerElementChild = createAmpElement({
        id: 'containerElementChild',
        deferredMount: true,
      });

      doc.body.appendChild(container);
      doc.body.appendChild(topElement);
      container.appendChild(containerScroller);
      containerScroller.appendChild(containerElement);
      containerElement.appendChild(containerElementChild);
    });

    it('should be observed by the document observer', () => {
      scheduler.schedule(topElement);
      scheduler.schedule(containerElement);
      scheduler.schedule(containerElementChild);

      // Observed on the document observer.
      expect(intersectionObserverStub.isObserved(topElement, {root: doc})).to.be
        .true;
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {root: doc})
      ).to.be.true;
    });

    it('should be observed and unobserved by the container observer', () => {
      scheduler.schedule(topElement);
      scheduler.schedule(containerElement);
      scheduler.schedule(containerElementChild);
      scheduler.schedule(container);

      // Set container.
      scheduler.setContainer(container);

      // Observed on the document observer.
      expect(intersectionObserverStub.isObserved(topElement, {root: doc})).to.be
        .true;
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {root: doc})
      ).to.be.true;

      // A contained element is observed by the container.
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {
          root: container,
        })
      ).to.be.true;
      // Not observed by the container because not contained by it.
      expect(intersectionObserverStub.isObserved(topElement, {root: container}))
        .to.be.false;

      // Should not observe the container itself on the container observer.
      expect(intersectionObserverStub.isObserved(container, {root: container}))
        .to.be.false;
      expect(intersectionObserverStub.isObserved(container, {root: doc})).to.be
        .true;

      // Remove container.
      scheduler.removeContainer(container);
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.false;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {
          root: container,
        })
      ).to.be.false;

      // Set container again.
      scheduler.setContainer(container);
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {
          root: container,
        })
      ).to.be.true;
    });

    it('should be observed with scroller when specified', () => {
      scheduler.schedule(topElement);
      scheduler.schedule(containerElement);
      scheduler.schedule(containerElementChild);
      scheduler.schedule(container);

      // Set container.
      scheduler.setContainer(container, containerScroller);

      // Observed on the document observer.
      expect(intersectionObserverStub.isObserved(topElement, {root: doc})).to.be
        .true;
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {root: doc})
      ).to.be.true;

      // A contained element is observed by the container.
      expect(
        intersectionObserverStub.isObserved(containerElement, {
          root: containerScroller,
        })
      ).to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {
          root: containerScroller,
        })
      ).to.be.true;
      // Not observed by the container because not contained by it.
      expect(
        intersectionObserverStub.isObserved(topElement, {
          root: containerScroller,
        })
      ).to.be.false;

      // No observers for the container itself.
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.false;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {
          root: container,
        })
      ).to.be.false;
      expect(intersectionObserverStub.isObserved(topElement, {root: container}))
        .to.be.false;

      // Should not observe the container itself on the container observer.
      expect(
        intersectionObserverStub.isObserved(container, {
          root: containerScroller,
        })
      ).to.be.false;
      expect(intersectionObserverStub.isObserved(container, {root: doc})).to.be
        .true;
    });

    it('should be observed by the container for elements added after it was set', () => {
      // Set container.
      scheduler.setContainer(container);

      // Schedule elements.
      scheduler.schedule(topElement);
      scheduler.schedule(containerElement);
      scheduler.schedule(containerElementChild);
      scheduler.schedule(container);

      // Observed on the document observer.
      expect(intersectionObserverStub.isObserved(topElement, {root: doc})).to.be
        .true;
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {root: doc})
      ).to.be.true;

      // A contained element is observed by the container.
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {
          root: container,
        })
      ).to.be.true;
      // Not observed by the container because not contained by it.
      expect(intersectionObserverStub.isObserved(topElement, {root: container}))
        .to.be.false;

      // Should not observe the container itself on the container observer.
      expect(intersectionObserverStub.isObserved(container, {root: container}))
        .to.be.false;
      expect(intersectionObserverStub.isObserved(container, {root: doc})).to.be
        .true;

      // Remove container.
      scheduler.removeContainer(container);
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.false;
      expect(
        intersectionObserverStub.isObserved(containerElementChild, {
          root: container,
        })
      ).to.be.false;
    });

    it('should be unobserved by all observers when unscheduled', () => {
      // Set container.
      scheduler.setContainer(container);

      // Schedule elements.
      scheduler.schedule(containerElement);
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.true;

      // Unschedule
      scheduler.unschedule(containerElement);
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.false;
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.false;
    });

    it('should mount if the document observer fires first', async () => {
      await setAmpdocReady();

      // Set container and schedule.
      scheduler.setContainer(container);
      scheduler.schedule(containerElement);
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.true;

      intersectionObserverStub.notifySync(
        {
          target: containerElement,
          isIntersecting: true,
        },
        {root: doc}
      );

      clock.tick(1);
      expect(containerElement.mountInternal).to.be.calledOnce;

      // Unscheduled from both.
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.false;
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.false;
    });

    it('should mount if the container observer fires first', async () => {
      await setAmpdocReady();

      // Set container and schedule.
      scheduler.setContainer(container);
      scheduler.schedule(containerElement);
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.true;
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.true;

      intersectionObserverStub.notifySync(
        {
          target: containerElement,
          isIntersecting: true,
        },
        {root: container}
      );

      clock.tick(1);
      expect(containerElement.mountInternal).to.be.calledOnce;
      expect(intersectionObserverStub.isObserved(containerElement, {root: doc}))
        .to.be.false;
      expect(
        intersectionObserverStub.isObserved(containerElement, {root: container})
      ).to.be.false;
    });

    it('should wait for the first intersecing observation', async () => {
      await setAmpdocReady();

      // Set container and schedule.
      scheduler.setContainer(container);
      scheduler.schedule(containerElement);

      intersectionObserverStub.notifySync(
        {
          target: containerElement,
          isIntersecting: false,
        },
        {root: doc}
      );
      clock.tick(1);
      expect(containerElement.mountInternal).to.not.be.called;

      intersectionObserverStub.notifySync(
        {
          target: containerElement,
          isIntersecting: false,
        },
        {root: container}
      );
      clock.tick(1);
      expect(containerElement.mountInternal).to.not.be.called;

      intersectionObserverStub.notifySync(
        {
          target: containerElement,
          isIntersecting: true,
        },
        {root: container}
      );

      clock.tick(1);
      expect(containerElement.mountInternal).to.be.calledOnce;
    });
  });
});
