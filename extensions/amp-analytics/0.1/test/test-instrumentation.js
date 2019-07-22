/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {CustomEventTracker} from '../events';

import {InstrumentationService} from '../instrumentation.js';

describes.realWin('InstrumentationService', {amp: 1}, env => {
  let win;
  let ampdoc;
  let service;
  let root;
  let analyticsElement;
  let target;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    service = new InstrumentationService(ampdoc);
    root = service.ampdocRoot_;

    analyticsElement = win.document.createElement('amp-analytics');
    win.document.body.appendChild(analyticsElement);

    target = win.document.createElement('div');
    win.document.body.appendChild(target);
  });

  it('should create and dispose the ampdoc root', () => {
    expect(root).to.be.ok;
    expect(root.ampdoc).to.equal(ampdoc);
    expect(root.parent).to.be.null;

    const stub = sandbox.stub(root, 'dispose');
    service.dispose();
    expect(stub).to.be.calledOnce;
  });

  it('should trigger a custom event on the ampdoc root', () => {
    const tracker = root.getTracker('custom', CustomEventTracker);
    const triggerStub = sandbox.stub(tracker, 'trigger');
    service.triggerEventForTarget(target, 'test-event', {foo: 'bar'});
    expect(triggerStub).to.be.calledOnce;

    const event = triggerStub.args[0][0];
    expect(event.target).to.equal(target);
    expect(event.type).to.equal('test-event');
    expect(event.vars).to.deep.equal({foo: 'bar'});
  });

  it('should backfill target for the old triggerEvent', () => {
    // TODO(dvoytenko): remove in preference of triggerEventForTarget.
    const tracker = root.getTracker('custom', CustomEventTracker);
    const triggerStub = sandbox.stub(tracker, 'trigger');
    service.triggerEventForTarget(ampdoc, 'test-event', {foo: 'bar'});
    expect(triggerStub).to.be.calledOnce;

    const event = triggerStub.args[0][0];
    expect(event.target).to.equal(ampdoc);
    expect(event.type).to.equal('test-event');
    expect(event.vars).to.deep.equal({foo: 'bar'});
  });
});

describes.realWin(
  'InstrumentationService in FIE',
  {
    amp: {ampdoc: 'fie'},
  },
  env => {
    let win;
    let embed;
    let ampdoc;
    let service;
    let root;
    let analyticsElement;
    let target;

    beforeEach(() => {
      win = env.win;
      embed = env.embed;
      ampdoc = env.ampdoc;
      service = new InstrumentationService(ampdoc);
      root = service.ampdocRoot_;

      analyticsElement = win.document.createElement('amp-analytics');
      win.document.body.appendChild(analyticsElement);

      target = win.document.createElement('div');
      win.document.body.appendChild(target);
    });

    it('should create and reuse embed root', () => {
      expect(root.ampdoc).to.equal(ampdoc);
      expect(root.parent).to.be.null;

      const group1 = service.createAnalyticsGroup(analyticsElement);
      const embedRoot = group1.root_;
      expect(embedRoot).to.not.equal(root);
      expect(embedRoot.parent).to.equal(root);
      expect(embedRoot.ampdoc).to.equal(ampdoc);
      expect(embedRoot.embed).to.equal(embed);

      // Reuse the previously created instance.
      const analyticsElement2 = win.document.createElement('amp-analytics');
      win.document.body.appendChild(analyticsElement2);
      const group2 = service.createAnalyticsGroup(analyticsElement2);
      expect(group2.root_).to.equal(embedRoot);
    });
  }
);
