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

import {CSS} from '../../../build/amp-linkeddb-showmore-0.1.css';
import {Layout} from '../../../src/layout';
export class AmpLinkeddbShowmore extends AMP.BaseElement {

    /** @override */
    buildCallback() {

    }

    /** @override */
    viewportCallback() {
        let hasClass = (ele, cls) => {
            if (!cls) {
                return false;
            }
            return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
        };

        let addClass = (ele, cls) => {
            if (cls.replace(/\s*/g, '')) {
                !hasClass(ele, cls) && (ele.className = ele
                    .className == '' ? cls : ele.className + ' ' + cls);
            }
        };

        let removeClass = (ele, cls) => {
            if (hasClass(ele, cls)) {
                let newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
                while (newClass.indexOf(' ' + cls + ' ') >= 0) {
                    newClass = newClass.replace(' ' + cls + ' ', ' ');
                }
                ele.className = newClass.replace(/^\s+|\s+$/g, '');
            }
        };
        if (document.querySelector('.msg-text').clientHeight <= 95) {
            addClass(document.querySelector('.view-more'), 'hide');
        } else {
            addClass(document.querySelector('.view-more-text'), 'limit-height');
        }
        document.querySelector('.view-more').addEventListener('click', function () {
            if (hasClass(document.querySelector('.view-more'), 'down')) {
                removeClass(document.querySelector('.view-more'), 'down');
                document.querySelector('.view-more').innerText = document
                    .querySelector('.view-more').getAttribute('data-up');
                document.querySelector('.view-more-text')
                    .className = 'limit-height view-more-text show';
            } else {
                document.querySelector('.view-more').className = 'view-more down';
                removeClass(document.querySelector('.view-more-text'), 'show');
                document.querySelector('.view-more').innerText = document
                    .querySelector('.view-more').getAttribute('data-down');
            }
        });
    }

    /** @override */
    isLayoutSupported(layout) {
        return layout == Layout.RESPONSIVE;
    }
}
AMP.extension('amp-linkeddb-showmore', '0.1', AMP => {
    AMP.registerElement('amp-linkeddb-showmore', AmpLinkeddbShowmore, CSS);
});
