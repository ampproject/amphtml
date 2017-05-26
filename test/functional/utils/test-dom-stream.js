/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {DomStream} from '../../../src/utils/dom-stream';


describes.fakeWin('DomStream', {}, env => {
  let parser;
  let targetDoc;
  let target;
  let domStream;

  beforeEach(() => {
    parser = document.implementation.createHTMLDocument('');
    parser.open();
    parser.write('<body>');
    targetDoc = env.win.document;
    target = targetDoc.createElement('target');
    targetDoc.body.appendChild(target);
    domStream = new DomStream(parser.body, target);
  });

  function chunk(s, expected) {
    if (s == '<<EOF>>') {
      parser.close();
      domStream.done();
    } else {
      parser.write(s);
      domStream.flush();
    }
    /* DO NOT SUBMIT
    console.log('QQQ: chunk: ', s);
    console.log('-- parser: ', parser.body.innerHTML);
    console.log('-- target: ', target.innerHTML);
    console.log('-- expect: ', expected);
    */
    expect(target.innerHTML).to.equal(expected);
  }

  function eof(expected) {
    chunk('<<EOF>>', expected);
  }

  it('should follow simple start/end', () => {
    chunk('', '');
    chunk('<div>', '');
    chunk('</div>', '');
    eof('<div></div>');
  });

  it('should follow simple start/end with head whitespace', () => {
    chunk(' ', '');
    chunk('<div>', ' ');
    chunk('</div>', ' ');
    eof(' <div></div>');
  });

  it('should process flat siblings', () => {
    let p = '';

    chunk('<div>', p);
    chunk('div1', p);
    chunk('</div>', p);

    p = '<div>div1</div>';
    chunk('<div>', p);

    chunk('div2', p);
    chunk('</div>', p);

    p = '<div>div1</div><div>div2</div>';
    eof(p);
  });

  it('should process flat siblings with text', () => {
    let p = '';

    chunk('ABC', p);

    p = 'ABC';
    chunk('<div>', p);
    chunk('div2', p);
    chunk('</div>', p);

    p = 'ABC<div>div2</div>';
    eof(p);
  });

  it('should process multiple siblings in a chunk', () => {
    let p = '';

    chunk('<div>div1</div>', p);

    p = '<div>div1</div><div>div2</div><div>div3</div>';
    chunk('<div>div2</div><div>div3</div><div>', p);

    chunk('div4</div>', p);

    p = '<div>div1</div><div>div2</div><div>div3</div><div>div4</div>';
    eof(p);
  });

  it('should split 2nd level', () => {
    let p = '';

    chunk('<parent>', p);

    chunk('<l1>', p);
    chunk('1', p);
    chunk('</l1>', p);

    p = '<parent><l1>1</l1></parent>';
    chunk('<l2>', p);
    expect(domStream.depth_).to.equal(1);

    chunk('2', p);
    chunk('</l2>', p);
    chunk('</parent>', p);
    expect(domStream.depth_).to.equal(1);

    p = '<parent><l1>1</l1><l2>2</l2></parent>';
    eof(p);
  });

  it('should NOT split forbidden nodes', () => {
    let p = '';

    chunk('<ul>', p);

    chunk('<li>', p);
    chunk('div1', p);
    chunk('</li>', p);

    p = '';
    chunk('<li>', p);
    chunk('div2', p);
    chunk('</li>', p);

    chunk('</ul>', p);

    p = '<ul><li>div1</li><li>div2</li></ul>';
    eof(p);
  });

  it('should split 3rd level', () => {
    let p = '';

    chunk('<parent>', p);

    chunk('<l1>', p);
    chunk('<l11>1.1</l11>', p);

    p = '<parent><l1><l11>1.1</l11></l1></parent>';
    chunk('<l12>1.2</l12>', p);
    expect(domStream.depth_).to.equal(2);
    chunk('</l1>', p);
    expect(domStream.depth_).to.equal(2);

    p = '<parent><l1><l11>1.1</l11><l12>1.2</l12></l1></parent>';
    chunk('<l2>2</l2>', p);
    expect(domStream.depth_).to.equal(1);
    chunk('</parent>', p);
    expect(domStream.depth_).to.equal(1);

    p = '<parent><l1><l11>1.1</l11><l12>1.2</l12></l1><l2>2</l2></parent>';
    eof(p);
  });

  it('should NOT split above maximum split level', () => {
    domStream.maxDepth_ = 2;
    let p = '';

    chunk('<parent>', p);

    chunk('<l1>', p);
    chunk('<l11>1.1</l11>', p);
    chunk('<l12>1.2</l12>', p);
    chunk('</l1>', p);

    p = '<parent><l1><l11>1.1</l11><l12>1.2</l12></l1></parent>';
    chunk('<l2>2</l2>', p);
    chunk('</parent>', p);

    p = '<parent><l1><l11>1.1</l11><l12>1.2</l12></l1><l2>2</l2></parent>';
    eof(p);
  });

  it('should only split nodes once per flush', () => {
    let p = '';

    chunk('<parent>', p);

    chunk('<l1>', p);
    chunk('<l11>1.1</l11>', p);

    p = '<parent><l1><l11>1.1</l11></l1></parent>';
    chunk('<l12><l121>1.2.1</l121><l122>1.2.2</l122></l12>', p);

    p = '<parent><l1><l11>1.1</l11><l12><l121>1.2.1</l121></l12></l1></parent>';
    chunk('</l1>', p);

    p = '<parent><l1><l11>1.1</l11>' +
        '<l12><l121>1.2.1</l121><l122>1.2.2</l122></l12></l1></parent>';
    chunk('<l2>2</l2>', p);
    chunk('</parent>', p);

    p = '<parent><l1><l11>1.1</l11><l12><l121>1.2.1</l121>' +
        '<l122>1.2.2</l122></l12></l1><l2>2</l2></parent>';
    eof(p);
  });
});
