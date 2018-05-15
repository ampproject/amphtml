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

import {clearOurFragment} from '../../addthis-utils/fragment';

describe('fragment', () => {
  it('clears AddThis fragments from an url', () => {
    let url =
        'http://www.example.com/2012-07-25?utm_campaign=linkedin-Share-Web#at_pco=cfd-1.0';
    expect(clearOurFragment(url)).to.equal(
        'http://www.example.com/2012-07-25?utm_campaign=linkedin-Share-Web');

    url = 'http://www.addthis.com/#.WNU1xGHp7QE.facebook;text';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/');

    url = 'http://www.addthis.com/#.WNU1xGHp7QE.facebook';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/');

    url = 'http://www.addthis.com/#.WNU1xGHp7QE;text';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/');

    url = 'http://www.addthis.com/#.WNU1xGHp7QE';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/');
  });

  it('does not clear a fragment that does not belong to AddThis', () => {
    let url = 'http://www.addthis.com/#top';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/#top');

    url = 'http://www.addthis.com/hello';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/hello');
  });
});
