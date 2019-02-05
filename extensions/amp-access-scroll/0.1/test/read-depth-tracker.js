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
import {AccessSource} from '../../../amp-access/0.1/amp-access-source';
import {ReadDepthTracker} from '../read-depth-tracker';

describes.realWin('ReadDepthTracker', {
  amp: {
    extensions: ['amp-access-scroll'],
  },
}, env => {
  let win;
  let doc;
  let ampdoc;
  let sandbox;
  let accessSource;
  let readDepthTracker;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    sandbox = env.sandbox;

    // Undefined initialization params for AccessSource
    let scheduleViewFn, onReauthorizeFn;
    accessSource = new AccessSource(
        ampdoc,
        {
          'authorization': 'https://acme.com/a',
          'pingback': 'https://acme.com/p',
          'login': {
            'login1': 'https://acme.com/l1',
            'login2': 'https://acme.com/l2',
          },
        },
        () => Promise.resolve('reader1'),
        scheduleViewFn,
        onReauthorizeFn,
        doc.documentElement
    );

    for (let i = 0; i < 5; i++) {
      const elem = doc.createElement('p');
      elem./*OK*/innerText = `Scroll amp test paragraph ${i}`;
      elem.id = `${i}`;
      doc.body.appendChild(elem);
    }

    readDepthTracker = new ReadDepthTracker(
        ampdoc,
        accessSource,
        'api.test.com'
    );

    // Stub viewport to fake paragraph positions
    sandbox.stub(readDepthTracker.viewport_,'getClientRectAsync')
        .callsFake(returnRectPosition);

    // Stub updateLastRead_ call to check content sent
    sandbox.stub(readDepthTracker, 'updateLastRead_');
  });

  function returnRectPosition(paragraph) {
    if (paragraph.id === '0') {
      return {bottom: -50};
    } else if (paragraph.id === '1') {
      return {bottom: -30};
    } else {
      return {bottom: 10};
    }
  }

  it('updates last read position to API with correct snippet', () => {
    readDepthTracker.findTopParagraph_()
        .then(() => {
          expect(readDepthTracker.updateLastRead_.calledOnce).to.be.true;
          expect(readDepthTracker.updateLastRead_.getCall(0).args[0])
              .to.equal('Scroll amp test paragraph 1');
        });
  });

  it('does not update last read position if position has not changed', () => {
    readDepthTracker.lastReadIndex_ = 1;

    readDepthTracker.findTopParagraph_()
        .then(() => {
          expect(readDepthTracker.updateLastRead_.calledOnce).to.be.false;
        });
  });
});
