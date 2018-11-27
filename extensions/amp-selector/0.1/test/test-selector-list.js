/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {AmpEvents} from '../../../../src/amp-events';
import {AmpList} from '../../../amp-list/0.1/amp-list';
import {AmpMustache} from '../../../amp-mustache/0.1/amp-mustache';
import {AmpSelector} from '../amp-selector';
import {Deferred} from '../../../../src/utils/promise';
import {Services} from '../../../../src/services';
import {createCustomEvent} from '../../../../src/event-helper';
import {poll} from '../../../../testing/iframe';

// TODO(kevinkassimo): These tests appear to be failing at HEAD.
describes.realWin('amp-selector amp-list interaction', {
  amp: {
    extensions: ['amp-list', 'amp-selector', 'amp-mustache'],
  },
}, function(env) {
  let sandbox;
  let win, doc, ampdoc;
  let parent;
  let selector;
  let listElement;
  let list;
  let templateElement;
  let updateDeferred;

  let layoutPromise;
  let refreshDeferred;

  beforeEach(() => {
    win = env.win;
    win.AMP.registerTemplate('amp-mustache', AmpMustache);
    sandbox = env.sandbox;

    doc = win.document;
    ampdoc = env.ampdoc;

    updateDeferred = new Deferred();

    parent = doc.createElement('div');
    doc.body.appendChild(parent);
    parent.addEventListener(AmpEvents.DOM_UPDATE, () => {
      updateDeferred.resolve();
    });
    const selectorElement = doc.createElement('amp-selector');
    selectorElement.getAmpDoc = () => ampdoc;

    Services.resourcesForDoc(ampdoc).add(selectorElement);

    AmpSelector.prototype.init_ = sandbox.spy(AmpSelector.prototype, 'init_');
    const origMaybeRefreshOnUpdate =
        AmpSelector.prototype.maybeRefreshOnUpdate_;
    AmpSelector.prototype.maybeRefreshOnUpdate_ = function() {
      origMaybeRefreshOnUpdate.call(this);
      if (refreshDeferred) {
        refreshDeferred.resolve();
      }
    };
    selector = new AmpSelector(selectorElement);
    selectorElement.connectedCallback();
    parent.appendChild(selector.element);
    selector.buildCallback();

    listElement = doc.createElement('amp-list');
    listElement.setAttribute('src', '/list.json');
    listElement.setAttribute('layout', 'responsive');
    listElement.setAttribute('width', '100');
    listElement.setAttribute('height', '100');
    listElement.getAmpDoc = () => ampdoc;
    listElement.getFallback = () => null;
    listElement.toggleLoading = () => null;
    listElement.togglePlaceholder = () => null;
    listElement.getResources = () => win.services.resources.obj;

    Services.resourcesForDoc(ampdoc).add(listElement);

    templateElement = doc.createElement('template');
    templateElement.setAttribute('type', 'amp-mustache');
    templateElement.innerHTML = '<div option="{{value}}">{{text}}</div>';
    listElement.appendChild(templateElement);

    selectorElement.appendChild(listElement);

    AmpList.prototype.mutateElement = function(cb) { cb(); };
    list = new AmpList(listElement);
    list.fetch_ = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({items: [
            {value: 0, text: 'ZERO'},
            {value: 1, text: 'ONE'},
          ]});
        }, 100);
      });
    };

    list.buildCallback();
    layoutPromise = list.layoutCallback();
  });

  afterEach(() => {
    AmpSelector.prototype.init_.restore();
    refreshDeferred = null;
  });

  it('should load selector options correctly with template', function() {
    return layoutPromise.then(() => {
      return poll('wait for options to construct', () => {
        // TODO: Integration tests really should not be inspecting ivars, or
        // anything other than DOM-observable properties and attributes.
        return selector.getElementsForTesting().length > 0;
      }, () => {}, 1000);
    }).then(() => {
      const options = selector.getElementsForTesting();
      expect(options.length).to.equal(2);
      expect(options[0].getAttribute('option')).to.equal('0');
      expect(options[1].getAttribute('option')).to.equal('1');
    });
  });

  it('should not call init again if no actual option is changed', function() {
    let options;
    let initCount;
    return layoutPromise.then(() => {
      return poll('wait for options to construct', () => {
        // TODO: Integration tests really should not be inspecting ivars, or
        // anything other than DOM-observable properties and attributes.
        return selector.getElementsForTesting().length > 0;
      }, () => {}, 1000);
    })
        .then(() => {
          options = selector.getElementsForTesting();
          initCount = AmpSelector.prototype.init_.callCount;

          refreshDeferred = new Deferred();
          const DOMUpdateEvent = createCustomEvent(
              win,
              AmpEvents.DOM_UPDATE,
              /* detail */ null,
              {bubbles: true});
          listElement.dispatchEvent(DOMUpdateEvent);
          return refreshDeferred.promise;
        })
        .then(() => {
          expect(options).to.equal(selector.getElementsForTesting());
          expect(AmpSelector.prototype.init_.callCount).to.equal(initCount);
        });
  });
});
