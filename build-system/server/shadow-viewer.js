/* eslint-disable local/html-template */

const {html} = require('./app-index/html');

const SCRIPT = `
/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict'; {
  customElements.define('amp-viewer',
    class AmpViewerElement extends HTMLElement {

      constructor() {
        super();

        if (!window.AMP_SHADOW) {
          window.AMP_SHADOW = true;
          this._installScript(
            'https://cdn.ampproject.org/shadow-v0.js');
        }

        this._amp = null;
        this._src = '';
        this._host = null;
      }

      static get observedAttributes() {
        return ['src'];
      }

      set src(src) {
        if (this._src === src) {
          return;
        }

        this._src = src;
        this._clear();
        if (!src) {
          this.removeAttribute('src');
        } else {
          this.setAttribute('src', src);
          this._loadDocument(src);
        }
      }

      get src() {
        return this._src;
      }

      attributeChangedCallback(name, old, value) {
        if (old !== value) this.src = value;
      }

      _setVisibilityState(state) {
        if (this._amp) {
          this._amp._setVisibilityState(state);
        }
      }

      _clear() {
        if (this._amp) {
          this._amp.close();
          this._amp = null;
        }
        if (this._host) {
          this.removeChild(this._host);
          this._host = null;
        }
      }

      _loadDocument(src) {
        this._fetchDocument(src, function (doc) {
          (window.AMP = window.AMP || []).push(function (AMP) {
            this._host = window.document.createElement('div');
            this._host.classList.add('amp-doc-host');
            this.appendChild(this._host);
            this._amp = AMP.attachShadowDoc(this._host, doc,
              src);
          }.bind(this));
        }.bind(this));
      }

      _installScript(src) {
        var ownerDoc = this.ownerDocument;
        var el = ownerDoc.createElement('script');
        el.setAttribute('src', src);
        ownerDoc.head.appendChild(el);
      }

      _fetchDocument(src, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', src, true);
        xhr.responseType = 'document';
        xhr.setRequestHeader('Accept', 'text/html');
        xhr.onreadystatechange = function () {
          if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
            return;
          }
          if (xhr.status < 100 || xhr.status > 599) {
            xhr.onreadystatechange = null;
            throw new Error(\`Unknown HTTP status \${xhr.status}\`);
            return;
          }
          if (xhr.readyState == /* COMPLETE */ 4) {
            if (xhr.responseXML) {
              callback(xhr.responseXML);
            } else {
              throw new Error('No xhr.responseXML');
            }
          }
        };
        xhr.onerror = function () {
          throw new Error('Network failure')
        };
        xhr.onabort = function () {
          throw new Error('Request aborted')
        };
        xhr.send();
      }
    });
};
`;

const renderShadowViewer = ({baseHref, src}) => html`
  <!doctype html>
  <html>
    <head>
      <base href="${baseHref}" />
      <title>Shadow Viewer</title>
      <script>
        ${SCRIPT};
      </script>
    </head>
    <body style="padding: 0; margin: 0">
      <amp-viewer src="${src}"></amp-viewer>
    </body>
  </html>
`;

module.exports = {renderShadowViewer};
