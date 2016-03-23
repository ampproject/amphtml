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

/* jslint esnext:true */

import {CSS} from '../../../build/amp-timeline-0.1.css';
import {isLayoutSizeDefined} from '../../../src/layout';


// Currently using Masonry as installed through npm
// TODO: Remove Masonry dependency with custom layout engine?
const Masonry = require('masonry-layout');

/**
 * The masonry instance
 */
let msnry;


/**
 * Handle Masonry layout
 */
function onLayout( laidOutItems ) {  
    setLayoutDirection(laidOutItems);

    // dispatch the height change
    this.attemptChangeHeight( msnry.element.offsetTop + msnry.element.offsetHeight );
}



function setLayoutDirection(laidOutItems) {
  laidOutItems.forEach(function(item, i) {
    var clz = 'item';
    if(item.element.style.left === '0px') {
      clz += ' left';
    }
    item.element.className = clz;
    return item;
  });
  return laidOutItems;
}


// const assert = AMP.assert;


/**
 * The implementation of `amp-list` component. See {@link ../amp-list.md} for
 * the spec.
 */
export class AmpTimeline extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    console.log('amp-timeline: isLayoutSupported');
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {

  }

 /** @override */
  layoutCallback() {

    var grid = document.querySelector('.timeline');
    msnry = new Masonry( grid );
    msnry.on( 'layoutComplete', onLayout.bind(this) );

    setLayoutDirection( msnry.items );

    return Promise.resolve();

  }


}

AMP.registerElement('amp-timeline', AmpTimeline, CSS);
