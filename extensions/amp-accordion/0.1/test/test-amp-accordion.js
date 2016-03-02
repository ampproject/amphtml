/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {Timer} from '../../../../src/timer';
import {adopt} from '../../../../src/runtime';
import {createIframePromise} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';
require('../../../../build/all/v0/amp-accordion-0.1.max');

adopt(window);

describe('amp-accordion', () => {
  const timer = new Timer(window);
  function getAmpAccordion() {
    return createIframePromise().then(iframe => {
      toggleExperiment(iframe.win, 'amp-accordion', true);
      const ampAccordion = iframe.doc.createElement('amp-accordion');
      for (let i = 0; i < 3; i++) {
        const section = iframe.doc.createElement('section');
        section.innerHTML = '<h2>Section ' + i + '</h2><div>Loreum ipsum</div>';
        ampAccordion.appendChild(section);
        if (i == 1) {
          section.setAttribute('expanded', '');
        }
      }
      return iframe.addElement(ampAccordion).then(() => {
        return Promise.resolve({
          iframe: iframe,
          ampAccordion: ampAccordion,
        });
      });
    });
  }

  it('should expand when header of a collapsed section is clicked', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      let clickEvent;
      if (iframe.doc.createEvent) {
        clickEvent = iframe.doc.createEvent('MouseEvent');
        clickEvent.initMouseEvent('click', true, true, iframe.win, 1);
      } else {
        clickEvent = iframe.doc.createEventObject();
        clickEvent.type = 'click';
      }
      const headerElements =
          iframe.doc.querySelectorAll('section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      headerElements[0].dispatchEvent(clickEvent);
      return timer.promise(50).then(() => {
        expect(headerElements[0].parentNode.hasAttribute('expanded'))
            .to.be.true;
      });
    });
  });
  it('should collapse when header of an expanded section is clicked', () => {
    return getAmpAccordion().then(obj => {
      const iframe = obj.iframe;
      let clickEvent;
      if (iframe.doc.createEvent) {
        clickEvent = iframe.doc.createEvent('MouseEvent');
        clickEvent.initMouseEvent('click', true, true, iframe.win, 1);
      } else {
        clickEvent = iframe.doc.createEventObject();
        clickEvent.type = 'click';
      }
      const headerElements =
          iframe.doc.querySelectorAll('section > *:first-child');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      headerElements[1].dispatchEvent(clickEvent);
      return timer.promise(50).then(() => {
        expect(headerElements[1].parentNode.hasAttribute('expanded'))
            .to.be.false;
      });
    });
  });
});
