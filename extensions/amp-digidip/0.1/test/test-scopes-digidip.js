/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-digidip';
import {getScopeElements} from '../helper';

describes.realWin('amp-digidip', {
  amp: {
    extensions: ['amp-digidip'],
  },
}, () => {

  let doc;


  beforeEach(() => {

    doc = new DOMParser()
        .parseFromString(
            '<div id=\'scope\'></div><div class=\'scope\'></div>' +
            '<div class=\'scope\'><div class=\'scope\'></div></div>',
            'text/html');

  });

  it('Shoud find html node when there are no scope options', () => {

    const scopes = getScopeElements(
        doc,
        {elementClickhandlerAttribute: '', elementClickhandler: ''}
    );

    expect(scopes[0].localName).to.equal('html');

  });

  it('Shoud find one scope node', () => {

    const scopes = getScopeElements(
        doc,
        {elementClickhandlerAttribute: 'id', elementClickhandler: 'scope'}
    );

    expect(Object.keys(scopes).length).to.equal(1);

  });

  it('Shoud find two scope nodes', () => {

    const scopes = getScopeElements(
        doc,
        {elementClickhandlerAttribute: 'class', elementClickhandler: 'scope'}
    );

    expect(Object.keys(scopes).length).to.equal(2);

  });


});
