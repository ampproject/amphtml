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

import {
  CircularBuffer,
  normalizeString,
  findSentences,
  TextScanner,
  posDomDelimiter,
  TextRange, TextPos,
  markTextRangeList
} from '../findtext';

describe('CircularBuffer', ()=>{
  it('add and get', ()=>{
    let buf = new CircularBuffer(5);
    for (let i = 0; i < 7; i++) {
      buf.add(i);
    }
    let elems = [];
    for (let i = 0; i < 10; i++) {
      elems.push(buf.get(i));
    }
    expect(elems).to.deep.equal([2, 3, 4, 5, 6, 2, 3, 4, 5, 6]);
  });
});

describe('normalizeString', ()=>{
  it('test examples', ()=>{
    expect(normalizeString('a b  c')).to.equal('abc');
    expect(normalizeString('abc.d')).to.equal('abcd');
    expect(normalizeString('a\u2019b')).to.equal('a\'b');
    expect(normalizeString('\u201chello\u201d')).to.equal('\"hello\"');
    expect(normalizeString('\u2022 hello')).to.equal('hello');
    expect(normalizeString('a,b.c')).to.equal('abc');
  });
});

describe('findSentences', ()=>{
  it('single node', ()=>{
    let root = document.createElement('div');
    root.innerHTML = 'hello world';
    var ranges = findSentences(root, ['el', 'or']);
    expect(ranges).to.not.be.null;
    let texts = [];
    for (let r of ranges) {
      var range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push(range.toString());
    }
    expect(texts).to.deep.equal(['el', 'or']);
  });

  it('multiple nodes', ()=>{
    let root = document.createElement('div');
    root.innerHTML = '<h4>header with <b>bold text</b></h4>\n<p>and additional text</p>';
    var ranges = findSentences(root, ['header with bold text', 'additional text']);
    expect(ranges).to.not.be.null;
    let texts = [];
    for (let r of ranges) {
      var range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push(range.toString());
    }
    expect(texts).to.deep.equal(['header with bold text', 'additional text']);
  });

  it('block node', ()=>{
    let root = document.createElement('div');
    root.innerHTML = '<p>Here’s an instruction:</p><ul><li>Do something.</li></ul>';
    var ranges = findSentences(root, ['Here\'s an instruction: Do something.']);
    expect(ranges).to.not.be.null;
    let texts = [];
    for (let r of ranges) {
      var range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push(range.toString());
    }
    expect(texts).to.deep.equal(['Here’s an instruction:Do something']);
  });

  it('special chars', ()=>{
    let root = document.createElement('div');
    root.innerHTML = '<p>“double ‘single quoted’ quoted text,<p>';
    var ranges = findSentences(root, ['"double \'single quoted\' quoted']);
    expect(ranges).to.not.be.null;
    let texts = [];
    for (let r of ranges) {
      var range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push(range.toString());
    }
    expect(texts).to.deep.equal(['“double ‘single quoted’ quoted']);
  });
});

describes.fakeWin('TextScanner', {}, ()=>{
  let root = null;
  beforeEach(()=>{
    // root should be appended to body to compute the style.
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('single text', ()=>{
    root.innerHTML = 'ab cd  ef\n\ng';
    let chars = [];
    let scanner = new TextScanner(root);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      expect(pos.node).to.be.an.instanceof(Text);
      chars.push(pos.node.wholeText[pos.offset]);
    }
    expect(chars.join('')).to.equal('ab cd ef\ng');
  });

  it('space suffix and prefix', ()=>{
    root.innerHTML = ' ab cd  '

    let chars = [];
    let scanner = new TextScanner(root);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      expect(pos.node).to.be.an.instanceof(Text);
      chars.push(pos.node.wholeText[pos.offset]);
    }
    expect(chars.join('')).to.equal('ab cd');
  });

  it('inline', ()=>{
    root.innerHTML = 'a<b>b</b>cd <i>ef</i>';
    document.body.appendChild(root);

    let chars = [];
    let scanner = new TextScanner(root, false);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      expect(pos.node).to.be.an.instanceof(Text);
      chars.push(pos.node.wholeText[pos.offset]);
    }
    expect(chars.join('')).to.equal('abcd ef');
  });

  it('item list', ()=>{
    root.innerHTML = '<ul><li>a</li><li>b</li></ul>';

    let chars = [];
    let scanner = new TextScanner(root, false);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      if (pos == posDomDelimiter) {
        chars.push('_');
        continue;
      }
      chars.push(pos.node.wholeText[pos.offset]);
    }
    expect(chars.join('')).to.equal('a_b');
  });

  it('block', ()=>{
    root.innerHTML = '<ul><li>a</li><li>b</li></ul>';

    let chars = [];
    let scanner = new TextScanner(root, false);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      if (pos == posDomDelimiter) {
        chars.push('_');
        continue;
      }
      chars.push(pos.char);
    }
    expect(chars.join('')).to.equal('a_b');
  });

  it('script', ()=>{
    root.innerHTML = '<p>hello</p><script>alert("js");</script>';

    let chars = [];
    let scanner = new TextScanner(root, false);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      expect(pos.node).to.be.an.instanceof(Text);
      chars.push(pos.char);
    }
    expect(chars.join('')).to.equal('hello');
  });

  it('special chars', ()=>{
    root.innerHTML = '\'"';

    let chars = [];
    let scanner = new TextScanner(root, false);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      expect(pos.node).to.be.an.instanceof(Text);
      chars.push(pos.char);
    }
    expect(chars.join('')).to.equal('\'"');
  });
});

describe('markTextRangeList', ()=>{
  it('single node', ()=>{
    let root = document.createElement('div');
    let text = document.createTextNode('0123456789');
    root.appendChild(text);
    markTextRangeList([
      new TextRange(new TextPos(text, 1), new TextPos(text, 3)),
      new TextRange(new TextPos(text, 5), new TextPos(text, 7))
    ]);
    expect(root.innerHTML).to.equal('0<span>12</span>34<span>56</span>789');
  });

  it('multi nodes', ()=>{
    let root = document.createElement('div');
    root.innerHTML = '<b>abc</b><div>def</div><i>ghi</i>';
    let b = root.querySelector('b');
    let i = root.querySelector('i');
    markTextRangeList([
      new TextRange(new TextPos(b.firstChild, 1), new TextPos(i.firstChild, 1))
    ]);
    expect(root.innerHTML).to.equal('<b>a<span>bc</span></b><div><span>def</span></div><i><span>g</span>hi</i>');
  });

  it('concat ranges', ()=>{
    let root = document.createElement('div');
    let text = document.createTextNode('0123456789');
    root.appendChild(text);
    markTextRangeList([
      new TextRange(new TextPos(text, 1), new TextPos(text, 3)),
      new TextRange(new TextPos(text, 3), new TextPos(text, 5))
    ]);
    expect(root.innerHTML).to.equal('0<span>1234</span>56789');
  });
});
