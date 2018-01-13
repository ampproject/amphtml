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
import {isLayoutSizeDefined} from '../../../src/layout';
import {Layout} from '../../../src/layout';
import {cssstyle} from 'cssstyle';
import {getIframe} from '../../../src/3p-frame';
import { addParamsToUrl } from '../../../src/url';
import { getDataParamsFromAttributes, removeElement } from '../../../src/dom';
import { listenFor } from '../../../src/iframe-helper';

export class AmpMathml extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Element} */
    this.container_ = this.win.document.createElement('div');

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback () {
    this.preconnect.url('https://cdnjs.cloudflare.com');
  }
  /** @override */
  buildCallback() {
    const formula = this.element.getAttribute('formula');
    if ( !formula || '' === formula ) {
      return;
    }
    this._formula = formula;
  }

  getIframeHeader () {
    return "<script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-MML-AM_CHTML'></script>";
  }
  getIframeContents() {

    const formula = this.element.getAttribute( 'formula' );
    if ( !formula || '' === formula ) {
      return false;
    }

    let src = formula +
     ' <script type="text/javascript">' +
     '   ' +
     '   document.addEventListener( "DOMContentLoaded", function () {' +
     '     window.parent.postMessage( {' +
     '       sentinel: "amp",' +
     '       type: "embed-size",' +
     '       height: document.body.scrollHeight' +
     '     }, "*" );' +
     '   } );' +
     '   </script>';
    return src;
  }

  layoutCallback () {
    const iframe = getIframe( this.win, this.element, 'mathml' );
    this.applyFillContent( iframe );
    listenFor( iframe, 'embed-size', data => {
      this./*OK*/changeHeight( data[ 'height' ] );
    }, /* opt_is3P */true );
    const html =
      '<head>' + this.getIframeHeader() + '</head>' +
      '<body>' + this.getIframeContents() + '</body>';
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    con
    return this.loadPromise(iframe);
  }

  unlayoutCallback () {
    if ( this.iframe_ ) {
      removeElement( this.iframe_ );
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  isLayoutSupported (layout) {
    return isLayoutSizeDefined(layout);
  }

}


AMP.registerElement('amp-mathml', AmpMathml);
