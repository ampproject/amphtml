/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {
  AmpDocShadow,
} from '../../../../src/service/ampdoc-impl';
import {
  AmpdocAnalyticsRoot,
  EmbedAnalyticsRoot,
} from '../analytics-root';
import {
  CustomEventTracker,
} from '../events';
import {
  VisibilityManagerForDoc,
  VisibilityManagerForEmbed,
} from '../visibility-manager';


describes.realWin('AmpdocAnalyticsRoot', {amp: 1}, env => {
  let win;
  let ampdoc;
  let resources, viewport;
  let root;
  let body, target, child, other;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    resources = win.services.resources.obj;
    viewport = win.services.viewport.obj;
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
    const tracker = root.getTracker('custom', CustomEventTracker);
    expect(tracker).to.be.instanceOf(CustomEventTracker);
    expect(tracker.root).to.equal(root);

    // Reused.
    expect(root.getTracker('custom', CustomEventTracker)).to.equal(tracker);
    expect(root.getTrackerOptional('custom')).to.equal(tracker);

    // Dispose.
    const stub = sandbox.stub(tracker, 'dispose');
    root.dispose();
    expect(stub).to.be.calledOnce;
    expect(root.getTrackerOptional('custom')).to.be.null;
  });

  it('should init with ampdoc signals', () => {
    expect(root.signals()).to.equal(ampdoc.signals());
  });

  it('should resolve ini-load signal', () => {
    ampdoc.signals().signal('ready-scan');
    return root.whenIniLoaded();
  });

  it('should provide the correct rect for ini-load for main doc', () => {
    const stub = sandbox.stub(resources, 'getResourcesInRect',
        () => Promise.resolve([]));
    root.whenIniLoaded();
    expect(stub).to.be.calledOnce;
    expect(stub.args[0][0]).to.equal(win);
    expect(stub.args[0][1]).to.contain({
      top: 0,
      left: 0,
      width: win.innerWidth,
      height: win.innerHeight,
    });
  });

  it('should provide the correct rect for ini-load for inabox', () => {
    win.AMP_MODE = {runtime: 'inabox'};
    sandbox.stub(viewport, 'getLayoutRect', element => {
      if (element == win.document.documentElement) {
        return {left: 10, top: 11, width: 100, height: 200};
      }
    });
    const stub = sandbox.stub(resources, 'getResourcesInRect',
        () => Promise.resolve([]));
    root.whenIniLoaded();
    expect(stub).to.be.calledOnce;
    expect(stub.args[0][0]).to.equal(win);
    expect(stub.args[0][1]).to.contain({
      left: 10,
      top: 11,
      width: 100,
      height: 200,
    });
  });

  it('should create visibility root', () => {
    const visibilityManager = root.getVisibilityManager();
    expect(visibilityManager).to.be.instanceOf(VisibilityManagerForDoc);
    expect(visibilityManager.ampdoc).to.equal(ampdoc);
    expect(visibilityManager.parent).to.be.null;
    // Ensure the instance is reused.
    expect(root.getVisibilityManager()).to.equal(visibilityManager);
  });


  describe('getElement', () => {

    let allTestInstances;
    let getTestPromise;
    let addTestInstance;

    beforeEach(() => {
      getTestPromise = (promise, result) => {
        return promise.then(element => {
          expect(result).to.not.be.null;
          expect(element).to.equal(result);
        }).catch(error => {
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
          root.getElement(target, ':root', ':closest'), rootElement);
    });

    it('should find :host, but always null', () => {
      addTestInstance(root.getElement(body, ':host'),
          'Element ":host" not found');
      addTestInstance(root.getElement(target, ':host'),
          'Element ":host" not found');
      addTestInstance(root.getElement(target, ':host', ':scope'),
          'Element ":host" not found');
      addTestInstance(root.getElement(target, ':host', ':closest'),
          'Element ":host" not found');
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
      sandbox.stub(ampdoc1, 'whenReady', () => {
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
      sandbox.stub(ampdoc2, 'whenReady', () => {
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
      sandbox.stub(ampdoc3, 'whenReady', () => {
        return Promise.resolve();
      });
      const root3 = new AmpdocAnalyticsRoot(ampdoc3);
      addTestInstance(root3.getElement(other, '#other', 'closest'), other);
      addTestInstance(root3.getElement(child, 'target', 'closest'), null);
      addTestInstance(root3.getElement(body, '#target'), null);
    });

    it('should find an AMP element for AMP search', () => {
      child.classList.add('i-amphtml-element');
      addTestInstance(root.getAmpElement(body, '#child'), child);
    });

    it('should allow not-found element for AMP search', () => {
      addTestInstance(root.getAmpElement(body, '#unknown'),
          'Element "#unknown" not found');
    });

    it('should fail if the found element is not AMP for AMP search', () => {
      child.classList.remove('i-amphtml-element');
      return root.getAmpElement(body, '#child').catch(error => {
        expect(error).to.match(/required to be an AMP element/);

      });
    });
  });


  describe('createSelectiveListener', () => {

    function matches(context, target, selector, selectionMethod) {
      const listener = sandbox.spy();
      const selective = root.createSelectiveListener(
          listener, context, selector, selectionMethod);
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
      const documentElement = win.document.documentElement;
      expect(matches(body, documentElement, '*')).to.equal(documentElement);
      expect(matches(body, documentElement, ':root'))
          .to.equal(documentElement);
      expect(matches(body, documentElement, ':root', 'closest'))
          .to.equal(documentElement);
      expect(matches(body, documentElement, ':root', 'scope'))
          .to.equal(documentElement);
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
      expect(matches(target, target, '#target.target', 'scope'))
          .to.equal(target);

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
      expect(matches(child, child, '#target.target', 'closest'))
          .to.equal(target);

      expect(matches(body, target, '*', 'closest')).to.equal(body);
      expect(matches(body, target, '#target', 'closest')).to.be.null;
      expect(matches(body, target, '.target', 'closest')).to.be.null;
      expect(matches(body, target, 'target', 'closest')).to.be.null;
      expect(matches(body, target, '#target.target', 'closest')).to.be.null;
    });

    it('should NOT match nodes not in root', () => {
      expect(matches(body, target, '*')).to.equal(target);
      sandbox.stub(root, 'contains', () => false);
      expect(matches(body, target, '*')).to.be.null;
    });
  });
});


describes.realWin('EmbedAnalyticsRoot', {
  amp: {ampdoc: 'fie'},
}, env => {
  let win;
  let embed;
  let ampdoc;
  let parentRoot;
  let root;
  let body, target, child, other;

  beforeEach(() => {
    win = env.win;
    embed = env.embed;
    ampdoc = env.ampdoc;
    embed.host = ampdoc.win.document.createElement('amp-embed-host');
    parentRoot = new AmpdocAnalyticsRoot(ampdoc);
    root = new EmbedAnalyticsRoot(ampdoc, embed, parentRoot);
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
    expect(root.parent).to.equal(parentRoot);
    expect(root.getHostElement()).to.be.equal(embed.iframe);
    expect(root.getRoot()).to.equal(win.document);
    expect(root.getRootElement()).to.equal(win.document.documentElement);
    expect(root.contains(target)).to.be.true;
    expect(root.getElementById('target')).to.equal(target);
  });

  it('should add tracker, reuse and dispose', () => {
    const tracker = root.getTracker('custom', CustomEventTracker);
    expect(tracker).to.be.instanceOf(CustomEventTracker);
    expect(tracker.root).to.equal(root);

    // Reused.
    expect(root.getTracker('custom', CustomEventTracker)).to.equal(tracker);
    expect(root.getTrackerOptional('custom')).to.equal(tracker);

    // Dispose.
    const stub = sandbox.stub(tracker, 'dispose');
    root.dispose();
    expect(stub).to.be.calledOnce;
    expect(root.getTrackerOptional('custom')).to.be.null;
  });

  it('should init with embed signals', () => {
    expect(root.signals()).to.equal(embed.signals());
  });

  it('should resolve ini-load signal', () => {
    const stub = sandbox.stub(embed, 'whenIniLoaded', () => Promise.resolve());
    return root.whenIniLoaded().then(() => {
      expect(stub).to.be.calledOnce;
    });
  });

  it('should create visibility root', () => {
    const visibilityManager = root.getVisibilityManager();
    expect(visibilityManager).to.be.instanceOf(VisibilityManagerForEmbed);
    expect(visibilityManager.ampdoc).to.equal(ampdoc);
    expect(visibilityManager.embed).to.equal(embed);
    expect(visibilityManager.parent)
        .to.equal(parentRoot.getVisibilityManager());
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
      return Promise.all(getElementTestInstances.promises).then(values => {
        for (let i = 0; i < values.length; i++) {
          expect(values[i]).to.equal(getElementTestInstances.results[i]);
        }
      });
    });

    it('should find :root', () => {
      const rootElement = win.document.documentElement;
      addTestInstance(root.getElement(body, ':root'), rootElement);
      addTestInstance(root.getElement(target, ':root'), rootElement);
      addTestInstance(root.getElement(target, ':root', ':scope'), rootElement);
      addTestInstance(
          root.getElement(target, ':root', ':closest'), rootElement);
    });

    it('should find :host', () => {
      addTestInstance(root.getElement(body, ':host'), embed.iframe);
      addTestInstance(root.getElement(target, ':host'), embed.iframe);
      addTestInstance(root.getElement(target, ':host', ':scope'), embed.iframe);
      addTestInstance(
          root.getElement(target, ':host', ':closest'), embed.iframe);
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


  describe('createSelectiveListener', () => {

    function matches(context, target, selector, selectionMethod) {
      const listener = sandbox.spy();
      const selective = root.createSelectiveListener(
          listener, context, selector, selectionMethod);
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
      const documentElement = win.document.documentElement;
      expect(matches(body, documentElement, '*')).to.equal(documentElement);
      expect(matches(body, documentElement, ':root'))
          .to.equal(documentElement);
      expect(matches(body, documentElement, ':root', 'closest'))
          .to.equal(documentElement);
      expect(matches(body, documentElement, ':root', 'scope'))
          .to.equal(documentElement);
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
      sandbox.stub(root, 'contains', () => false);
      expect(matches(body, target, '*')).to.be.null;
    });
  });
});
