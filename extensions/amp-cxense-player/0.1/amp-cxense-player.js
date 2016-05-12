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
import {CSS} from '../../../build/amp-cxense-player-0.1.css';
import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {appendParamStringToUrl, parseUrl} from '../../../src/url';
import {dashToCamelCase} from '../../../src/string';
import {setStyles} from '../../../src/style';
const extend = require('extend');

const cxDefaults = {
  apiHost: 'https://api.widget.cx',
  embedHost: 'https://embed.widget.cx',
  distEmbedApp: '/app/player/m4/dist/',
  debugEmbedApp: '/app/player/m4/debug/',
  attrs: {
        // can't access the window.top.location.href from the iframe.
    share: {
      enable: false,
    },
  },
};

class AmpCxense extends AMP.BaseElement {

    /** @override */
    preconnectCallback(onLayout) {
      this.preconnect.url(cxDefaults.apiHost, onLayout);
      this.preconnect.prefetch(
            cxDefaults.embedHost + cxDefaults.distEmbedApp, 'iframe'
        );
    }

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
      this.element.classList.add('amp-cxense-player');

      if (!this.getPlaceholder()) {
        this.buildWidgetPlaceholder_();
      }
    }

    /** @override */
    layoutCallback() {
      const self = this;

        /** @private @const {Element} */
      this.iframe_ = this.element.ownerDocument.createElement('iframe');

      this.iframe_.setAttribute('frameborder', '0');
      this.iframe_.setAttribute('allowfullscreen', 'true');
      this.iframe_.width = this.element.getAttribute('width');
      this.iframe_.height = this.element.getAttribute('height');
      this.iframe_.src = this.getIframeSrc_();
      setStyles(this.iframe_, {display: 'none'});

      this.element.appendChild(this.iframe_);
      this.listenForPostMessages_();

      return loadPromise(this.iframe_).then(ret => {
        if (self.placeholder_) {
          setStyles(this.placeholder_, {display: 'none'});
        }
        setStyles(self.iframe_, {display: ''});
        self.applyFillContent(self.iframe_);
        return ret;
      });
    }

    /** @override */
    pauseCallback() {
      this.postMessage_({type: 'mpf.video.pause'});
      return true;
    }

    /** @override */
    unlayoutCallback() {
      this.iframe_.setAttribute('src', 'about:blank');
      this.iframe_.parentNode.removeChild(this.iframe_);
      return true;
    }

    /** @private */
    listenForPostMessages_() {
      const hostRegExp = new RegExp(
            '^' + parseUrl(cxDefaults.embedHost).hostname
        );

      this.getWin().addEventListener('message', e => {
        if (e && e.data) {
          let message = {data: {}};
          try {
            message = JSON.parse(e.data);
          } catch (e) {}

          if (!message.type
                    || !message.data.location
                    || !hostRegExp.test(message.data.location.hostname)
                ) {
            return;
          }
                // console.log("messge from iframe", message);
                // todo: could implement a dispatch function here - not needed for now.
                // this.dispatch_('')
        }
      }, false);
    }

    /** @private */
    getIframeSrc_() {
      const attrs = this.getExpandedDataAttributes_();
      return appendParamStringToUrl(
            cxDefaults.embedHost
            + (attrs.debug
                    ? cxDefaults.debugEmbedApp
                    : cxDefaults.distEmbedApp
            ),
            queryString(this.getCollapsedDataAttributes_(attrs))
        );
    }

    /** @private */
    getExpandedDataAttributes_(element) {
      element = element || this.element;
      return extend(true,
            {},
            cxDefaults.attrs,
            expandKeys(attrHash(element, 'data'))
        );
    }

    /** @private */
    getCollapsedDataAttributes_(hash) {
      hash = hash || this.getExpandedDataAttributes_();
      const newHash = {};
      recurseObject(hash, function(keypath, value) {
        newHash[keypath] = value;
      });
      return newHash;
    }

    /** @private */
    postMessage_(data) {
      data = extend(true, {
        location: location,
        width: this.getWin().offsetWidth,
        height: this.getWin().offsetHeight,
      }, data || {});

      return this.iframe_.contentWindow.postMessage(
            JSON.stringify(data), cxDefaults.embedHost
        );
    }

    /** @private */
    buildWidgetPlaceholder_() {
      const doc = this.getDoc_();

      this.placeholder_ = doc.createElement('div');
      this.placeholder_.className = 'amp-cxense-player-placeholder';

      const spinner = doc.createElement('div');
      spinner.className = 'amp-cxense-player-loader';
      spinner.appendChild(doc.createElement('div'));
      spinner.appendChild(doc.createElement('div'));
      spinner.appendChild(doc.createElement('div'));

      this.placeholder_.appendChild(spinner);
      this.element.appendChild(this.placeholder_);
      this.applyFillContent(this.placeholder_);
    }

    /** @private */
    getDoc_() {
      return this.getWin().document;
    }
}

AMP.registerElement('amp-cxense-player', AmpCxense, CSS);

function attrHash(el, prefix) {
  const ret = {};
  const attrs = el.attributes;
  const p = prefix || '';
  forEach(attrs, function(i, node) {
    if (node.nodeName.indexOf(p + '-') == 0) {
      const name = dashToCamelCase(node.nodeName.slice(p.length + 1));
      ret[name] = resolveType(node.nodeValue);
    }
  });
  return ret;
}

function forEach(arr, callback) {
  const a = arr || [];
  let i;
  const l = a.length;
  let ret;
  if (a instanceof Array || a.length >= 0) {
    for (i = 0;i < l;i++) {
      ret = callback(i,a[i]);
      if (ret == false) {
        break;
      }
    }
  }
    else if (a instanceof Object) {
      for (i in a) {
        if (!a.hasOwnProperty(i)) {
          continue;
        }
        ret = callback(i,a[i]);
        if (ret == false) {
          break;
        }
      }
    }
}

function queryString(obj) {
  const parts = [];
  if (!obj) {
    return '';
  }
  forEach(obj, function(key, val) {
    if (val != null) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
    }
  });
  return parts.join('&');
}

// expands an object with dot notation keys into a multi-level tree
function expandKeys(obj) {
  const ret = {};
  forEach(obj, function(key, val) {
    expandKey(key, val, ret);
  });
  return ret;
}

// expands a dot notation key into the given object
function expandKey(key, value, parent) {
  const parts = key.split('.');
  if (!parent) {
    parent = {};
  }
  let node = parent;
  let k;
  while (k = parts.shift()) {
    if (parts.length == 0) {
      node[k] = value;
    } else if (typeof node[k] == 'object') {
      node = node[k];
    } else {
      node = node[k] = {};
    }
  }
  return parent;
}

function recurseObject(object, onKeypathFn, keypathPrefix) {
  for (const property in object) {
    if (object.hasOwnProperty(property)) {
      if (typeof object[property] === 'object') {
        recurseObject(object[property],
                    onKeypathFn,
                    keypathPrefix ? keypathPrefix + '.' + property : property
                );
      } else {
        onKeypathFn(
                    keypathPrefix ? keypathPrefix + '.' + property : property,
                    object[property]
                );
      }
    }
  }
}

function resolveType(token) {
    // guesses and resolves type of a string
  if (typeof token != 'string') {
    return token;
  }

  if (token.length < 15 && token.match(/^(0|-?(0\.|[1-9]\d*\.?)\d*)$/)) {
        // don't match long ints where we would lose precision
        // don't match numeric strings with leading zeros that are not decimals or "0"
    token = parseFloat(token);
  }
    else if (token.match(/^true|false$/i)) {
      token = Boolean(token.match(/true/i));
    }
    else if (token === 'undefined') {
      token = undefined;
    }
    else if (token === 'null') {
      token = null;
    }
  return token;
};
