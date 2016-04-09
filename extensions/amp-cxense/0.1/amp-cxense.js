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

import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {timer} from '../../../src/timer';
import {user} from '../../../src/log';


class AmpCxense extends AMP.BaseElement {

    /** @override */
    preconnectCallback(onLayout) {
        this.preconnect.url('https://embed.widget.cx/amd.js', onLayout);
        this.preconnect.url('https://embed.ramp.com/amd.js', onLayout);
        this.preconnect.url('https://api.ramp.com', onLayout);
        this.preconnect.url('https://api.widget.cx', onLayout);
    }

    /** @override */
    isLayoutSupported(layout) {
        return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
        //todo: fetch amd.js
        // this._createChildTarget();
        this._injectEmbedScript();
    }

    /** @override */
    layoutCallback() {
        setTimeout(function() {
            // RAMP.Widgets.create(this.element);
        }, 3000);
        return timer.promise(100);
    }

    /** @override */
    pauseCallback() {

    }

    /** @private */
    _injectEmbedScript () {
        const script = this.element.ownerDocument.createElement('script');
        script.setAttribute("src", "https://embed.ramp.com/amd.js");
        this.element.ownerDocument.head.appendChild(script);
    }

    /** @private */
    _createChildTarget () {
        const target = this.element.ownerDocument.createElement('div');
        let id;
        let attr;
        let attributes = Array.prototype.slice.call(this.element.attributes);
        while(attr = attributes.pop()) {
            if (attr.nodeName == "id") {
                id = "" + attr.nodeValue;
            }
            target.setAttribute(attr.nodeName, attr.nodeValue);
        }
        id && this.element.setAttribute("id", id + "_conquered");
        this.element.appendChild(target);
    }
}

AMP.registerElement('amp-cxense', AmpCxense);
