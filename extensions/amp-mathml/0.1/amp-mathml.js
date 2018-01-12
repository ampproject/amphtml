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

import {Layout} from '../../../src/layout';
import {cssstyle} from 'cssstyle';
import {mathjaxNode} from 'mathjax-node';

export class AmpMathml extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.myText_ = 'hello world!!';

    /** @private {!Element} */
    this.container_ = this.win.document.createElement('div');
  }

  /** @override */
  buildCallback() {
    const formula = this.element.getAttribute( 'formula' );
    if(! formula || '' === formula){
      return;
    }
    console.log( mathjaxNode.typeset );
    mathjaxNode.typeset( {
      math: this.element.getAttribute( 'formula' ),
      format: "MathML",
      mml: true,
      svg: true,
    }, function ( data ) {
      console.log( data );
      if ( !data.errors ) {
        this.element.appendChild( data.svg );
      }
    } );

    this.container_.textContent = this.myText_ + this.element.getAttribute( 'formula' );
    this.element.appendChild( this.container_ );
    this.applyFillContent( this.container_, /* replacedContent */ true );
   }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }
}


AMP.registerElement('amp-mathml', AmpMathml);
