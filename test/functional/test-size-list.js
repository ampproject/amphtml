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

import {SizeList, parseSizeList} from '../../src/size-list';


describe('SizeList parseSizeList', () => {

  it('should accept single option', () => {
    const res = parseSizeList(' \n 111px \n ');
    expect(res.sizes_.length).to.equal(1);
    expect(res.sizes_[0].mediaQuery).to.equal(undefined);
    expect(res.sizes_[0].size).to.equal('111px');
  });

  it('should accept multiple options', () => {
    const res = parseSizeList(' \n print 222px \n, 111px \n');
    expect(res.sizes_.length).to.equal(2);
    expect(res.sizes_[0].mediaQuery).to.equal('print');
    expect(res.sizes_[0].size).to.equal('222px');
    expect(res.sizes_[1].mediaQuery).to.equal(undefined);
    expect(res.sizes_[1].size).to.equal('111px');
  });

  it('should accept even more multiple options', () => {
    const res = parseSizeList(' \n screen 333px, print 222px \n, 111px \n');
    expect(res.sizes_.length).to.equal(3);
    expect(res.sizes_[0].mediaQuery).to.equal('screen');
    expect(res.sizes_[0].size).to.equal('333px');
    expect(res.sizes_[1].mediaQuery).to.equal('print');
    expect(res.sizes_[1].size).to.equal('222px');
    expect(res.sizes_[2].mediaQuery).to.equal(undefined);
    expect(res.sizes_[2].size).to.equal('111px');
  });

  it('should accept complicated media conditions', () => {
    const res = parseSizeList(
        ' \n screen and (min-width: 1000px) \t ' +
        ' and    (max-width: 2000px) 222px \n,' +
        ' 111px \n');
    expect(res.sizes_.length).to.equal(2);
    expect(res.sizes_[0].mediaQuery).to.equal(
        'screen and (min-width: 1000px) and (max-width: 2000px)');
    expect(res.sizes_[0].size).to.equal('222px');
    expect(res.sizes_[1].mediaQuery).to.equal(undefined);
    expect(res.sizes_[1].size).to.equal('111px');
  });

  it('should accept different length units', () => {
    const res = parseSizeList(' \n 111vw \n ');
    expect(res.sizes_.length).to.equal(1);
    expect(res.sizes_[0].mediaQuery).to.equal(undefined);
    expect(res.sizes_[0].size).to.equal('111vw');
  });

  it('should fail bad length', () => {
    expect(() => {
      parseSizeList(' \n 111 \n ');
    }).to.throw(/Invalid length value/);
  });
});


describe('SizeList construct', () => {

  it('should have at least one option', () => {
    expect(() => {
      new SizeList([]);
    }).to.throw(/SizeList must have at least one option/);
  });

  it('the last option must not have a query', () => {
    expect(() => {
      new SizeList([{mediaQuery: 'screen', size: '111px'}]);
    }).to.throw(/The last option must not have a media condition/);
    expect(() => {
      new SizeList([{mediaQuery: 'print', size: '222px'},
          {mediaQuery: 'screen', size: '111px'}]);
    }).to.throw(/The last option must not have a media condition/);
  });

  it('non-last options must have media query', () => {
    expect(() => {
      new SizeList([{size: '222px'}, {size: '111px'}]);
    }).to.throw(/All options except for the last must have a media condition/);
  });
});


describe('SizeList select', () => {
  it('should select default last option', () => {
    const sizeList = new SizeList([
        {mediaQuery: 'media1', size: '444px'},
        {mediaQuery: 'media2', size: '333px'},
        {mediaQuery: 'media3', size: '222px'},
        {size: '111px'}
    ]);
    expect(sizeList.select({matchMedia: () => {
      return {};
    }})).to.equal('111px');
  });

  it('should select a matching option', () => {
    const sizeList = new SizeList([
        {mediaQuery: 'media1', size: '444px'},
        {mediaQuery: 'media2', size: '333px'},
        {mediaQuery: 'media3', size: '222px'},
        {size: '111px'}
    ]);
    expect(sizeList.select({matchMedia: mq => {
      if (mq == 'media2') {
        return {matches: true};
      }
      return {};
    }})).to.equal('333px');
  });

  it('should select first matching option', () => {
    const sizeList = new SizeList([
        {mediaQuery: 'media1', size: '444px'},
        {mediaQuery: 'media2', size: '333px'},
        {mediaQuery: 'media3', size: '222px'},
        {size: '111px'}
    ]);
    expect(sizeList.select({matchMedia: mq => {
      if (mq == 'media1' || mq == 'media2') {
        return {matches: true};
      }
      return {};
    }})).to.equal('444px');
  });
});
