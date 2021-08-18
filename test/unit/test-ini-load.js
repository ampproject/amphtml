import {Deferred} from '#core/data-structures/promise';
import {removeItem} from '#core/types/array';

import {Services} from '#service';

import {
  whenContentIniLoadInOb,
  whenContentIniLoadMeasure,
} from '../../src/ini-load';

describes.realWin('whenContentIniLoad', {amp: true}, (env) => {
  let win, doc;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
  });

  function resource(win, tagName, id, overlaps = true, displayed = true) {
    const deferred = new Deferred();
    return {
      element: {
        tagName: tagName.toUpperCase(),
        id,
        whenLoaded: () => deferred.promise,
      },
      load: () => {
        deferred.resolve();
      },
      loadedOnce: () => deferred.promise,
      isDisplayed: () => displayed,
      overlaps: () => overlaps,
      isFixed: () => false,
      prerenderAllowed: () => true,
      hasBeenMeasured: () => true,
      hasOwner: () => false,
      hostWin: win,
    };
  }

  describe('whenContentIniLoadMeasure', () => {
    it('should find and await all visible content elements in given rect', async () => {
      let content1;
      let content2;

      const context = doc.createElement('div');
      doc.body.appendChild(context);
      const resources = Services.resourcesForDoc(ampdoc);
      env.sandbox.stub(resources, 'get').returns([
        (content1 = resource(win, 'amp-img', '1')),
        (content2 = resource(win, 'amp-video', '2')),
        resource(win, 'amp-img', '3', false), // resource outside rect
        resource(win, 'amp-img', '4', true, false), // hidden resource
        resource(win, 'amp-ad', '5'), // denylisted resource
      ]);

      let contentIniLoadComplete = false;
      whenContentIniLoadMeasure(ampdoc, win, {}).then(() => {
        contentIniLoadComplete = true;
      });

      ampdoc.signals().signal('ready-scan');
      await new Promise(setTimeout);

      content1.load();
      await new Promise(setTimeout);
      expect(contentIniLoadComplete).to.be.false;

      content2.load();
      await new Promise(setTimeout);
      expect(contentIniLoadComplete).to.be.true;
    });
  });

  describe('whenContentIniLoadInOb', () => {
    let content1;
    let content2;
    let observer;
    let getResourcesStub;

    beforeEach(() => {
      const resources = Services.resourcesForDoc(ampdoc);
      getResourcesStub = env.sandbox.stub(resources, 'get');
      getResourcesStub.returns([
        (content1 = resource(win, 'amp-img', '1')),
        (content2 = resource(win, 'amp-video', '2')),
        resource(win, 'amp-img', '3'),
        resource(win, 'amp-img', '4'),
        resource(win, 'amp-ad', '5'),
      ]);

      class FakeIntersectionObserver {
        constructor(callback, options) {
          this.callback = callback;
          this.options = options;
          this.elements = [];
          this.disconnected = false;
        }

        disconnect() {
          this.disconnected = true;
        }

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
          return Promise.resolve().then(() => {
            callback(entries, this);
          });
        }
      }

      observer = null;
      env.sandbox
        .stub(win, 'IntersectionObserver')
        .value(function (callback, options) {
          observer = new FakeIntersectionObserver(callback, options);
          return observer;
        });
    });

    it('should find and await all visible content elements', async () => {
      let contentIniLoadComplete = false;
      whenContentIniLoadInOb(ampdoc).then(() => {
        contentIniLoadComplete = true;
      });

      ampdoc.signals().signal('ready-scan');
      await new Promise(setTimeout);

      expect(observer).to.exist;
      expect(observer.options.root).to.equal(doc);
      expect(observer.options.threshold).to.equal(0.01);

      await observer.notify([
        {target: content1.element, isIntersecting: true},
        {target: content2.element, isIntersecting: true},
      ]);
      await new Promise(setTimeout);
      expect(contentIniLoadComplete).to.be.false;

      content1.load();
      await new Promise(setTimeout);
      expect(contentIniLoadComplete).to.be.false;

      content2.load();
      await new Promise(setTimeout);
      expect(contentIniLoadComplete).to.be.true;
      expect(observer.disconnected).to.be.true;
    });

    it('should find and await some visible content elements', async () => {
      let contentIniLoadComplete = false;
      whenContentIniLoadInOb(ampdoc).then(() => {
        contentIniLoadComplete = true;
      });

      ampdoc.signals().signal('ready-scan');
      await new Promise(setTimeout);

      expect(observer).to.exist;
      expect(observer.options.root).to.equal(doc);
      expect(observer.options.threshold).to.equal(0.01);

      await observer.notify([
        {target: content1.element, isIntersecting: true},
        {target: content2.element, isIntersecting: false},
      ]);
      await new Promise(setTimeout);
      expect(contentIniLoadComplete).to.be.false;

      content1.load();
      await new Promise(setTimeout);
      expect(contentIniLoadComplete).to.be.true;
      expect(observer.disconnected).to.be.true;
    });

    it('should complete without any elements', async () => {
      getResourcesStub.returns([]);

      let contentIniLoadComplete = false;
      whenContentIniLoadInOb(ampdoc).then(() => {
        contentIniLoadComplete = true;
      });

      ampdoc.signals().signal('ready-scan');
      await new Promise(setTimeout);

      expect(observer).to.not.exist;
      expect(contentIniLoadComplete).to.be.true;
    });
  });
});
