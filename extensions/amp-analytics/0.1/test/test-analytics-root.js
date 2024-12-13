import {AmpDocShadow} from '#service/ampdoc-impl';

import {user} from '#utils/log';

import * as IniLoad from '../../../../src/ini-load';
import {AmpdocAnalyticsRoot, EmbedAnalyticsRoot} from '../analytics-root';
import {AnalyticsEventType, CustomEventTracker} from '../events';
import {ScrollManager} from '../scroll-manager';
import {
  VisibilityManagerForDoc,
  VisibilityManagerForEmbed,
} from '../visibility-manager';

describes.realWin('AmpdocAnalyticsRoot', {amp: 1}, (env) => {
  let win;
  let ampdoc;
  let viewport;
  let root;
  let body, target, child, other;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    viewport = win.__AMP_SERVICES.viewport.obj;
    root = new AmpdocAnalyticsRoot(ampdoc);
    body = win.document.body;

    target = win.document.createElement('target');
    target.id = 'target';
    target.className = 'target';
    body.appendChild(target);

    child = win.document.createElement('child');
    child.id = 'child';
    child.className = 'child';
    target.appendChild(child);

    other = win.document.createElement('div');
    other.id = 'other';
    other.className = 'other';
    body.appendChild(other);
  });

  it('should initialize correctly', () => {
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.getType()).to.equal('ampdoc');
    expect(root.getHostElement()).to.be.null;
    expect(root.getRoot()).to.equal(win.document);
    expect(root.getRootElement()).to.equal(win.document.documentElement);
    expect(root.contains(target)).to.be.true;
    expect(root.getElementById('target')).to.equal(target);
  });

  it('should add tracker, reuse and dispose', () => {
    const tracker = root.getTracker(
      AnalyticsEventType.CUSTOM,
      CustomEventTracker
    );
    expect(tracker).to.be.instanceOf(CustomEventTracker);
    expect(tracker.root).to.equal(root);

    // Reused.
    expect(
      root.getTracker(AnalyticsEventType.CUSTOM, CustomEventTracker)
    ).to.equal(tracker);
    expect(root.getTrackerOptional(AnalyticsEventType.CUSTOM)).to.equal(
      tracker
    );

    // Dispose.
    const stub = env.sandbox.stub(tracker, 'dispose');
    root.dispose();
    expect(stub).to.be.calledOnce;
    expect(root.getTrackerOptional(AnalyticsEventType.CUSTOM)).to.be.null;
  });

  it('should init with ampdoc signals', () => {
    expect(root.signals()).to.equal(ampdoc.signals());
  });

  it('should resolve ini-load signal', () => {
    ampdoc.signals().signal('ready-scan');
    return root.whenIniLoaded();
  });

  it('should provide the correct rect for ini-load for main doc', () => {
    const spy = env.sandbox.spy(IniLoad, 'whenContentIniLoad');
    root.whenIniLoaded();
    expect(spy).to.be.calledWith(
      ampdoc,
      win,
      env.sandbox.match({
        top: 0,
        left: 0,
        width: win.innerWidth,
        height: win.innerHeight,
      })
    );
  });

  it('should provide the correct rect for ini-load for inabox', () => {
    win.__AMP_MODE = {runtime: 'inabox'};
    env.sandbox.stub(viewport, 'getLayoutRect').callsFake((element) => {
      if (element == win.document.documentElement) {
        return {left: 10, top: 11, width: 100, height: 200};
      }
    });
    const spy = env.sandbox.spy(IniLoad, 'whenContentIniLoad');

    root.whenIniLoaded();
    expect(spy).to.be.calledWith(
      ampdoc,
      win,
      env.sandbox.match({
        left: 10,
        top: 11,
        width: 100,
        height: 200,
      })
    );
  });

  it('should create visibility root', () => {
    const visibilityManager = root.getVisibilityManager();
    expect(visibilityManager).to.be.instanceOf(VisibilityManagerForDoc);
    expect(visibilityManager.ampdoc).to.equal(ampdoc);
    expect(visibilityManager.parent).to.be.null;
    // Ensure the instance is reused.
    expect(root.getVisibilityManager()).to.equal(visibilityManager);
  });

  it('should create scroll manager', () => {
    const scrollManager = root.getScrollManager();
    expect(scrollManager).to.be.instanceOf(ScrollManager);
    // Ensure the instance is reused.
    expect(root.getScrollManager()).to.equal(scrollManager);
  });

  describe('getElement', () => {
    let allTestInstances;
    let getTestPromise;
    let addTestInstance;

    beforeEach(() => {
      getTestPromise = (promise, result) => {
        return promise
          .then((element) => {
            expect(result).to.not.be.null;
            expect(element).to.equal(result);
          })
          .catch((error) => {
            expect(error).to.match(new RegExp(result));
          });
      };

      allTestInstances = [];

      addTestInstance = (promise, result) => {
        allTestInstances.push(getTestPromise(promise, result));
      };
    });

    afterEach(() => {
      return Promise.all(allTestInstances);
    });

    it('should find :root', () => {
      const rootElement = win.document.documentElement;
      addTestInstance(root.getElement(body, ':root'), rootElement);
      addTestInstance(root.getElement(target, ':root'), rootElement);
      addTestInstance(root.getElement(target, ':root', ':scope'), rootElement);
      addTestInstance(
        root.getElement(target, ':root', ':closest'),
        rootElement
      );
    });

    it('should find :host, but always null', () => {
      addTestInstance(
        root.getElement(body, ':host'),
        'Element ":host" not found'
      );
      addTestInstance(
        root.getElement(target, ':host'),
        'Element ":host" not found'
      );
      addTestInstance(
        root.getElement(target, ':host', ':scope'),
        'Element ":host" not found'
      );
      addTestInstance(
        root.getElement(target, ':host', ':closest'),
        'Element ":host" not found'
      );
    });

    it('should find element by ID', () => {
      addTestInstance(root.getElement(body, '#target'), target);
      addTestInstance(root.getElement(body, '#child'), child);
      addTestInstance(root.getElement(target, '#target'), target);
      addTestInstance(root.getElement(child, '#target'), target);
      addTestInstance(root.getElement(other, '#target'), target);

      addTestInstance(root.getElement(body, '#target', 'scope'), target);
      addTestInstance(root.getElement(other, '#target', 'scope'), null);
      addTestInstance(root.getElement(target, '#target', 'scope'), null);

      addTestInstance(root.getElement(target, '#target', 'closest'), target);
      addTestInstance(root.getElement(child, '#target', 'closest'), target);
      addTestInstance(root.getElement(body, '#target', 'closest'), null);
      addTestInstance(root.getElement(other, '#target', 'closest'), null);
    });

    it('should find element by class', () => {
      addTestInstance(root.getElement(body, '.target'), target);
      addTestInstance(root.getElement(body, '.child'), child);
      addTestInstance(root.getElement(target, '.target'), target);
      addTestInstance(root.getElement(child, '.target'), target);
      addTestInstance(root.getElement(other, '.target'), target);

      addTestInstance(root.getElement(body, '.target', 'scope'), target);
      addTestInstance(root.getElement(other, '.target', 'scope'), null);
      addTestInstance(root.getElement(target, '.target', 'scope'), null);

      addTestInstance(root.getElement(target, '.target', 'closest'), target);
      addTestInstance(root.getElement(child, '.target', 'closest'), target);
      addTestInstance(root.getElement(body, '.target', 'closest'), null);
      addTestInstance(root.getElement(other, '.target', 'closest'), null);
    });

    it('should find element by tag name', () => {
      addTestInstance(root.getElement(body, 'target'), target);
      addTestInstance(root.getElement(body, 'child'), child);
      addTestInstance(root.getElement(target, 'target'), target);
      addTestInstance(root.getElement(child, 'target'), target);

      addTestInstance(root.getElement(target, 'target', 'closest'), target);
      addTestInstance(root.getElement(child, 'target', 'closest'), target);
      addTestInstance(root.getElement(body, 'target', 'closest'), null);
      addTestInstance(root.getElement(other, 'target', 'closest'), null);
    });

    it('should find element by selector', () => {
      addTestInstance(root.getElement(target, '#target.target'), target);
    });

    it('should ensure that the element is contained by the root', () => {
      addTestInstance(root.getElement(body, '#child'), child);
      addTestInstance(root.getElement(body, '#target'), target);
      addTestInstance(root.getElement(body, '.target'), target);
      addTestInstance(root.getElement(body, 'target'), target);
      addTestInstance(root.getElement(child, 'target', 'closest'), target);
      addTestInstance(root.getElement(child, '#other'), other);

      // Root on `target` element.
      const ampdoc1 = new AmpDocShadow(win, 'https://amce.org/', target);
      env.sandbox.stub(ampdoc1, 'whenReady').callsFake(() => {
        return Promise.resolve();
      });
      const root1 = new AmpdocAnalyticsRoot(ampdoc1);
      addTestInstance(root1.getElement(child, 'child', 'closest'), child);
      addTestInstance(root1.getElement(child, 'target', 'closest'), target);
      addTestInstance(root1.getElement(body, '#target'), null);
      addTestInstance(root1.getElement(body, '.target'), null);
      addTestInstance(root1.getElement(body, 'target'), null);
      addTestInstance(root1.getElement(body, '#other'), null);

      // // Root on `child` element.
      const ampdoc2 = new AmpDocShadow(win, 'https://amce.org/', child);
      env.sandbox.stub(ampdoc2, 'whenReady').callsFake(() => {
        return Promise.resolve();
      });
      const root2 = new AmpdocAnalyticsRoot(ampdoc2);
      addTestInstance(root2.getElement(child, 'child', 'closest'), child);
      addTestInstance(root2.getElement(child, 'target', 'closest'), null);
      addTestInstance(root2.getElement(body, '#target'), null);
      addTestInstance(root2.getElement(body, '.target'), null);
      addTestInstance(root2.getElement(body, 'target'), null);
      addTestInstance(root2.getElement(body, '#other'), null);

      // // Root on `other` element.
      const ampdoc3 = new AmpDocShadow(win, 'https://amce.org/', other);
      env.sandbox.stub(ampdoc3, 'whenReady').callsFake(() => {
        return Promise.resolve();
      });
      const root3 = new AmpdocAnalyticsRoot(ampdoc3);
      addTestInstance(root3.getElement(other, '#other', 'closest'), other);
      addTestInstance(root3.getElement(child, 'target', 'closest'), null);
      addTestInstance(root3.getElement(body, '#target'), null);
    });

    it('should find an AMP element for AMP search', async () => {
      child.classList.add('i-amphtml-element');
      const element = await root.getAmpElement(body, '#child');
      expect(element).to.equal(child);
    });

    it('should handle missing selector for AMP search', async () => {
      await root.getAmpElement(body, '#unknown').catch((error) => {
        expect(error).to.match(/Element "#unknown" not found/);
      });
    });

    it('should fail if the found element is not AMP for AMP search', async () => {
      child.classList.remove('i-amphtml-element');
      await root.getAmpElement(body, '#child').catch((error) => {
        expect(error).to.match(/required to be an AMP element/);
      });
    });

    describe('get elements', () => {
      let child2;
      let child3;

      beforeEach(() => {
        child2 = win.document.createElement('child');
        child3 = win.document.createElement('child');
        body.appendChild(child2);
        body.appendChild(child3);
        child.classList.add('i-amphtml-element');
        child2.classList.add('i-amphtml-element');
        child3.classList.add('i-amphtml-element');

        child.setAttribute('data-vars-id', 'child1');
        child2.setAttribute('data-vars-id', 'child2');
        child3.setAttribute('data-vars-id', 'child3');
      });

      it('should find element and elements by selector', async () => {
        child.classList.add('myClass');
        child2.classList.add('myClass');
        child3.classList.add('notMyClass');
        expect(await root.getElements(body, ['.myClass'], null)).to.deep.equal([
          child,
          child2,
        ]);
        // Check that non-array selector works
        expect(await root.getElements(body, '.notMyClass', null)).to.deep.equal(
          [child3]
        );
      });

      it('should on default only find elements with data-vars-*', async () => {
        const spy = env.sandbox.spy(user(), 'warn');

        child.classList.add('myClass');
        child2.classList.add('myClass');
        child3.classList.add('myClass');

        child3.removeAttribute('data-vars-id');
        const children = await root.getElements(body, ['.myClass']);
        expect(spy).callCount(1);
        expect(spy).to.have.been.calledWith(
          'amp-analytics/analytics-root',
          '%s element(s) ommited from selector "%s" because no data-vars-* attribute was found.',
          1,
          '.myClass'
        );
        expect(children).to.deep.equal([child, child2]);
      });

      it('should not find elements with data-vars-* if useDataVars is false', async () => {
        const getElementSpy = env.sandbox.spy(root, 'getDataVarsElements_');
        child.classList.add('myClass');
        child2.classList.add('myClass');
        expect(
          await root.getElements(body, ['.myClass'], null, false)
        ).to.deep.equal([child, child2]);
        expect(getElementSpy).to.be.callCount(0);
      });

      it('should remove duplicate elements found', async () => {
        child.id = 'myId';
        child.classList.add('myClass');
        expect(
          await root.getElements(body, ['.myClass', '#myId'], null)
        ).to.deep.equal([child]);
      });

      it('should ignore special selectors', async () => {
        child.classList.add('myClass');
        expectAsyncConsoleError(/Element ":host" not found/, 1);
        await expect(
          root.getElements(body, [':host'], null)
        ).to.be.rejectedWith(/Element ":host" not found​​​/);
      });

      it('should handle missing selector for AMP search', async () => {
        expectAsyncConsoleError(/Element "#unknown" not found/, 1);
        await expect(
          root.getElements(body, ['#unknown'], null)
        ).to.be.rejectedWith(/Element "#unknown" not found​​​/);
      });

      it('should handle invalid selector', async () => {
        expectAsyncConsoleError(/Invalid query selector 12345/, 1);
        await expect(root.getElements(body, [12345], null)).to.be.rejectedWith(
          /Invalid query selector 12345​​​/
        );
      });

      it('should find both AMP and non AMP elements within array selector', async () => {
        child.classList.remove('i-amphtml-element');
        child.classList.add('myClass');
        child2.classList.add('myClass');
        expect(await root.getElements(body, ['.myClass'], null)).to.deep.equal([
          child,
          child2,
        ]);
      });

      it('should find non AMP element with single selector', async () => {
        child.classList.remove('i-amphtml-element');
        child.removeAttribute('data-vars-id');
        child.classList.add('myClass');
        expect(await root.getElements(body, '.myClass', null)).to.deep.equal([
          child,
        ]);
      });

      it('should fail if selection method is found', async () => {
        try {
          await root.getElements(body, ['#child'], 'scope');
        } catch (e) {
          expect(e).to.match(
            /Cannot have selectionMethod scope defined with an array selector/
          );
        }
      });
    });
  });

  describe('createSelectiveListener', () => {
    function matches(context, target, selector, selectionMethod) {
      const listener = env.sandbox.spy();
      const selective = root.createSelectiveListener(
        listener,
        context,
        selector,
        selectionMethod
      );
      selective({target});
      if (listener.callCount == 1) {
        return listener.args[0][0];
      }
      return null;
    }

    it('should never match host', () => {
      expect(matches(body, target, ':host')).to.be.null;
      expect(matches(target, target, ':host')).to.be.null;
    });

    it('should match root', () => {
      const {documentElement} = win.document;
      expect(matches(body, documentElement, '*')).to.equal(documentElement);
      expect(matches(body, documentElement, ':root')).to.equal(documentElement);
      expect(matches(body, documentElement, ':root', 'closest')).to.equal(
        documentElement
      );
      expect(matches(body, documentElement, ':root', 'scope')).to.equal(
        documentElement
      );
    });

    it('should match direct target', () => {
      expect(matches(body, target, '*')).to.equal(target);
      expect(matches(body, target, '#target')).to.equal(target);
      expect(matches(body, target, '.target')).to.equal(target);
      expect(matches(body, target, 'target')).to.equal(target);
      expect(matches(body, target, '#target.target')).to.equal(target);

      expect(matches(target, target, '*')).to.equal(target);
      expect(matches(target, target, '#target')).to.equal(target);
      expect(matches(target, target, '.target')).to.equal(target);
      expect(matches(target, target, 'target')).to.equal(target);
      expect(matches(target, target, '#target.target')).to.equal(target);
    });

    it('should match target via child', () => {
      expect(matches(body, child, '*')).to.equal(child);
      expect(matches(body, child, '#target')).to.equal(target);
      expect(matches(body, child, '.target')).to.equal(target);
      expect(matches(body, child, 'target')).to.equal(target);
      expect(matches(body, child, '#target.target')).to.equal(target);
    });

    it('should match scoped', () => {
      expect(matches(body, target, '*', 'scope')).to.equal(target);
      expect(matches(body, target, '#target', 'scope')).to.equal(target);
      expect(matches(body, target, '.target', 'scope')).to.equal(target);
      expect(matches(body, target, 'target', 'scope')).to.equal(target);
      expect(matches(body, target, '#target.target', 'scope')).to.equal(target);

      expect(matches(target, target, '*', 'scope')).to.equal(target);
      expect(matches(target, target, '#target', 'scope')).to.equal(target);
      expect(matches(target, target, '.target', 'scope')).to.equal(target);
      expect(matches(target, target, 'target', 'scope')).to.equal(target);
      expect(matches(target, target, '#target.target', 'scope')).to.equal(
        target
      );

      expect(matches(child, target, '#target', 'scope')).to.be.null;
      expect(matches(child, target, '.target', 'scope')).to.be.null;
      expect(matches(child, target, 'target', 'scope')).to.be.null;
      expect(matches(child, target, '#target.target', 'scope')).to.be.null;
    });

    it('should match closest', () => {
      expect(matches(child, child, '*', 'closest')).to.equal(child);
      expect(matches(target, child, '*', 'closest')).to.equal(target);

      expect(matches(child, child, '#target', 'closest')).to.equal(target);
      expect(matches(child, child, '.target', 'closest')).to.equal(target);
      expect(matches(child, child, 'target', 'closest')).to.equal(target);
      expect(matches(child, child, '#target.target', 'closest')).to.equal(
        target
      );

      expect(matches(body, target, '*', 'closest')).to.equal(body);
      expect(matches(body, target, '#target', 'closest')).to.be.null;
      expect(matches(body, target, '.target', 'closest')).to.be.null;
      expect(matches(body, target, 'target', 'closest')).to.be.null;
      expect(matches(body, target, '#target.target', 'closest')).to.be.null;
    });

    it('should NOT match nodes not in root', () => {
      expect(matches(body, target, '*')).to.equal(target);
      env.sandbox.stub(root, 'contains').callsFake(() => false);
      expect(matches(body, target, '*')).to.be.null;
    });
  });
});

describes.realWin(
  'EmbedAnalyticsRoot',
  {
    amp: {ampdoc: 'fie'},
  },
  (env) => {
    let win;
    let embed;
    let ampdoc;
    let parentAmpdoc, parentRoot;
    let root;
    let body, target, child, other;

    beforeEach(() => {
      win = env.win;
      embed = env.embed;
      ampdoc = env.ampdoc;
      embed.host = ampdoc.win.document.createElement('amp-embed-host');
      parentAmpdoc = env.parentAmpdoc;
      parentRoot = new AmpdocAnalyticsRoot(parentAmpdoc);
      root = new EmbedAnalyticsRoot(ampdoc, embed);
      body = win.document.body;

      target = win.document.createElement('target');
      target.id = 'target';
      target.className = 'target';
      body.appendChild(target);

      child = win.document.createElement('child');
      child.id = 'child';
      child.className = 'child';
      target.appendChild(child);

      other = win.document.createElement('div');
      other.id = 'other';
      other.className = 'other';
      body.appendChild(other);
    });

    it('should initialize correctly', () => {
      expect(root.ampdoc).to.equal(ampdoc);
      expect(root.getType()).to.equal('embed');
      expect(root.getHostElement()).to.be.equal(embed.iframe);
      expect(root.getRoot()).to.equal(win.document);
      expect(root.getRootElement()).to.equal(win.document.documentElement);
      expect(root.contains(target)).to.be.true;
      expect(root.getElementById('target')).to.equal(target);
    });

    it('should add tracker, reuse and dispose', () => {
      const tracker = root.getTracker(
        AnalyticsEventType.CUSTOM,
        CustomEventTracker
      );
      expect(tracker).to.be.instanceOf(CustomEventTracker);
      expect(tracker.root).to.equal(root);

      // Reused.
      expect(
        root.getTracker(AnalyticsEventType.CUSTOM, CustomEventTracker)
      ).to.equal(tracker);
      expect(root.getTrackerOptional(AnalyticsEventType.CUSTOM)).to.equal(
        tracker
      );

      // Dispose.
      const stub = env.sandbox.stub(tracker, 'dispose');
      root.dispose();
      expect(stub).to.be.calledOnce;
      expect(root.getTrackerOptional(AnalyticsEventType.CUSTOM)).to.be.null;
    });

    it('should create and reuse trackers, but not if not in allowlist', () => {
      const allowlist = {
        'custom': CustomEventTracker,
      };
      const customTracker = root.getTrackerForAllowlist(
        AnalyticsEventType.CUSTOM,
        allowlist
      );
      expect(customTracker).to.be.instanceOf(CustomEventTracker);
      expect(customTracker.root).to.equal(root);

      const noneTracker = root.getTrackerForAllowlist('none', allowlist);
      expect(noneTracker).to.be.null;

      expect(
        root.getTrackerForAllowlist(AnalyticsEventType.CUSTOM, allowlist)
      ).to.equal(customTracker);
      expect(
        root.getTracker(AnalyticsEventType.CUSTOM, CustomEventTracker)
      ).to.equal(customTracker);
    });

    it('should init with embed signals', () => {
      expect(root.signals()).to.equal(embed.signals());
    });

    it('should resolve ini-load signal', () => {
      const stub = env.sandbox
        .stub(embed, 'whenIniLoaded')
        .callsFake(() => Promise.resolve());
      return root.whenIniLoaded().then(() => {
        expect(stub).to.be.calledOnce;
      });
    });

    it('should create visibility root', () => {
      const visibilityManager = root.getVisibilityManager();
      expect(visibilityManager).to.be.instanceOf(VisibilityManagerForEmbed);
      // TODO(#22733): switch from `parentAmpdoc` to `ampdoc` once ampdoc-fie
      // is cleaned up.
      expect(visibilityManager.ampdoc).to.equal(parentAmpdoc);
      expect(visibilityManager.embed).to.equal(embed);
      expect(visibilityManager.parent).to.equal(
        parentRoot.getVisibilityManager()
      );
      // Ensure the instance is reused.
      expect(root.getVisibilityManager()).to.equal(visibilityManager);
    });

    describe('getElement', () => {
      let getElementTestInstances;
      let addTestInstance;
      beforeEach(() => {
        getElementTestInstances = {
          'promises': [],
          'results': [],
        };
        addTestInstance = (promise, result) => {
          getElementTestInstances.promises.push(promise);
          getElementTestInstances.results.push(result);
        };
      });

      afterEach(() => {
        // Tests happen here.
        return Promise.all(getElementTestInstances.promises).then((values) => {
          for (let i = 0; i < values.length; i++) {
            expect(values[i]).to.equal(getElementTestInstances.results[i]);
          }
        });
      });

      it('should find :root', () => {
        const rootElement = win.document.documentElement;
        addTestInstance(root.getElement(body, ':root'), rootElement);
        addTestInstance(root.getElement(target, ':root'), rootElement);
        addTestInstance(
          root.getElement(target, ':root', ':scope'),
          rootElement
        );
        addTestInstance(
          root.getElement(target, ':root', ':closest'),
          rootElement
        );
      });

      it('should find :host', () => {
        addTestInstance(root.getElement(body, ':host'), embed.iframe);
        addTestInstance(root.getElement(target, ':host'), embed.iframe);
        addTestInstance(
          root.getElement(target, ':host', ':scope'),
          embed.iframe
        );
        addTestInstance(
          root.getElement(target, ':host', ':closest'),
          embed.iframe
        );
      });

      it('should find element by ID', () => {
        addTestInstance(root.getElement(body, '#target'), target);
        addTestInstance(root.getElement(body, '#child'), child);
        addTestInstance(root.getElement(target, '#target'), target);
        addTestInstance(root.getElement(child, '#target'), target);
        addTestInstance(root.getElement(other, '#target'), target);
      });

      it('should find element by class', () => {
        addTestInstance(root.getElement(body, '.target'), target);
        addTestInstance(root.getElement(body, '.child'), child);
        addTestInstance(root.getElement(target, '.target'), target);
        addTestInstance(root.getElement(child, '.target'), target);
        addTestInstance(root.getElement(other, '.target'), target);
      });
    });

    describe('get elements', () => {
      let child2;
      let child3;

      beforeEach(() => {
        child2 = win.document.createElement('child');
        child3 = win.document.createElement('child');
        body.appendChild(child2);
        body.appendChild(child3);

        child.classList.add('myClass');
        child2.classList.add('myClass');
        child3.classList.add('notMyClass');

        child.classList.add('i-amphtml-element');
        child2.classList.add('i-amphtml-element');
        child3.classList.add('i-amphtml-element');

        child.setAttribute('data-vars-id', '123');
        child2.setAttribute('data-vars-id', '456');
        child3.setAttribute('data-vars-id', '789');
      });

      afterEach(() => {
        child.classList.add('i-amphtml-element');
      });

      it('should find all elements by selector', async () => {
        const elements = await root.getElements(body, ['.myClass'], null);

        expect(elements).to.deep.equals([child, child2]);
        // Check that non-selector version works
        expect(
          await root.getElements(body, '.notMyClass', null)
        ).to.deep.equals([child3]);
      });

      it('should not find elements from parent doc', async () => {
        const parentChild = env.parentWin.document.createElement('child');
        env.parentWin.document.body.appendChild(parentChild);
        parentChild.classList.add('myClass');
        parentChild.classList.add('i-amphtml-element');
        parentChild.setAttribute('data-vars-id', 'abc');

        const elements = await root.getElements(body, ['.myClass'], null);
        expect(elements).to.deep.equals([child, child2]);
      });

      it('should only find elements with data-vars-*', async () => {
        const spy = env.sandbox.spy(user(), 'warn');

        child3.classList.add('myClass');
        child3.removeAttribute('data-vars-id');

        const children = await root.getElements(body, ['.myClass']);
        expect(spy).callCount(1);
        expect(spy).to.have.been.calledWith(
          'amp-analytics/analytics-root',
          '%s element(s) ommited from selector "%s" because no data-vars-* attribute was found.',
          1,
          '.myClass'
        );
        expect(children).to.deep.equal([child, child2]);
      });

      it('should not find elements with data-vars-* if useDataVars is false', async () => {
        const getElementSpy = env.sandbox.spy(root, 'getDataVarsElements_');
        child.classList.add('myClass');
        child2.classList.add('myClass');
        expect(
          await root.getElements(body, ['.myClass'], null, false)
        ).to.deep.equal([child, child2]);
        expect(getElementSpy).to.be.callCount(0);
      });

      it('should remove duplicate elements found', async () => {
        child.id = 'myId';
        child2.id = 'myId';
        child.classList.add('myClass');
        child2.classList.add('myClass');
        // Each selector should find both elements, but only report once
        expect(
          await root.getElements(body, ['.myClass', '#myId'], null)
        ).to.deep.equal([child, child2]);
      });

      it('should handle missing selector for AMP search', async () => {
        expectAsyncConsoleError(/Element "#unknown" not found/, 1);
        await expect(
          root.getElements(body, ['#unknown'], null)
        ).to.be.rejectedWith(/Element "#unknown" not found​​​/);
      });

      it('should find both AMP and non AMP elements', async () => {
        child.classList.remove('i-amphtml-element');
        child.setAttribute('data-vars-id', '123');
        expect(await root.getElements(body, ['.myClass'], null)).to.deep.equal([
          child,
          child2,
        ]);
      });

      it('should find non AMP element with single selector', async () => {
        child.classList.remove('i-amphtml-element');
        expect(await root.getElements(body, '.myClass', null)).to.deep.equal([
          child,
        ]);
      });
    });

    describe('createSelectiveListener', () => {
      function matches(context, target, selector, selectionMethod) {
        const listener = env.sandbox.spy();
        const selective = root.createSelectiveListener(
          listener,
          context,
          selector,
          selectionMethod
        );
        selective({target});
        if (listener.callCount == 1) {
          return listener.args[0][0];
        }
        return null;
      }

      it('should never match host', () => {
        expect(matches(body, target, ':host')).to.be.null;
        expect(matches(target, target, ':host')).to.be.null;
      });

      it('should match root', () => {
        const {documentElement} = win.document;
        expect(matches(body, documentElement, '*')).to.equal(documentElement);
        expect(matches(body, documentElement, ':root')).to.equal(
          documentElement
        );
        expect(matches(body, documentElement, ':root', 'closest')).to.equal(
          documentElement
        );
        expect(matches(body, documentElement, ':root', 'scope')).to.equal(
          documentElement
        );
      });

      it('should match direct target', () => {
        expect(matches(body, target, '*')).to.equal(target);
        expect(matches(body, target, '#target')).to.equal(target);
        expect(matches(body, target, '.target')).to.equal(target);
        expect(matches(body, target, 'target')).to.equal(target);
        expect(matches(body, target, '#target.target')).to.equal(target);
      });

      it('should match target via child', () => {
        expect(matches(body, child, '*')).to.equal(child);
        expect(matches(body, child, '#target')).to.equal(target);
        expect(matches(body, child, '.target')).to.equal(target);
        expect(matches(body, child, 'target')).to.equal(target);
        expect(matches(body, child, '#target.target')).to.equal(target);
      });

      it('should NOT match nodes not in root', () => {
        expect(matches(body, target, '*')).to.equal(target);
        env.sandbox.stub(root, 'contains').callsFake(() => false);
        expect(matches(body, target, '*')).to.be.null;
      });
    });
  }
);
