import {
  CircularBuffer,
  TextScanner,
  canonicalizeString,
  findSentences,
  markTextRangeList,
  textPosChar,
} from '../findtext';

describes.sandboxed('CircularBuffer', {}, () => {
  it('add and get', () => {
    const buf = new CircularBuffer(5);
    for (let i = 0; i < 7; i++) {
      buf.push(i);
    }
    const elems = [];
    for (let i = 0; i < 10; i++) {
      elems.push(buf.get(i));
    }
    expect(elems).to.deep.equal([2, 3, 4, 5, 6, 2, 3, 4, 5, 6]);
  });
});

describes.sandboxed('canonicalizeString', {}, () => {
  it('test examples', () => {
    expect(canonicalizeString('a b  c')).to.equal('abc');
    expect(canonicalizeString('abc.d')).to.equal('abcd');
    expect(canonicalizeString('a\u2019b')).to.equal("a'b");
    expect(canonicalizeString('\u201chello\u201d')).to.equal('"hello"');
    expect(canonicalizeString('\u2022 hello')).to.equal('hello');
    expect(canonicalizeString('a,b.c')).to.equal('abc');
  });
});

describes.realWin('findSentences', {}, (env) => {
  let win, document;
  beforeEach(() => {
    win = env.win;
    document = win.document;
  });

  it('single node', () => {
    const root = document.createElement('div');
    root.innerHTML = 'hello world';
    const ranges = findSentences(win, root, ['el', 'or']);
    expect(ranges).to.not.be.null;
    const texts = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push(range.toString());
    }
    expect(texts).to.deep.equal(['el', 'or']);
  });

  it('multiple nodes', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<h4>header with <b>bold text</b></h4>\n<p>and additional text</p>';
    const ranges = findSentences(win, root, [
      'header with bold text',
      'additional text',
    ]);
    expect(ranges).to.not.be.null;
    const texts = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push(range.toString());
    }
    expect(texts).to.deep.equal(['header with bold text', 'additional text']);
  });

  it('block node', () => {
    const root = document.createElement('div');
    root.innerHTML =
      '<p>Here’s an instruction:</p><ul><li>Do something.</li></ul>';
    const ranges = findSentences(win, root, [
      "Here's an instruction: Do something.",
    ]);
    expect(ranges).to.not.be.null;
    const texts = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push(range.toString());
    }
    expect(texts).to.deep.equal(['Here’s an instruction:Do something']);
  });

  it('special chars', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>“double ‘single quoted’ quoted text,<p>';
    const ranges = findSentences(win, root, [
      "\"double 'single quoted' quoted",
    ]);
    expect(ranges).to.not.be.null;
    const texts = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push(range.toString());
    }
    expect(texts).to.deep.equal(['“double ‘single quoted’ quoted']);
  });

  it('dupFirstSentenceBeforeSecond', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>abc abc def hij<p>';
    const ranges = findSentences(win, root, ['abc', 'def', 'hij']);
    expect(ranges).to.not.be.null;
    const texts = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push({
        start: r.start.offset,
        end: r.end.offset,
        text: range.toString(),
      });
    }
    expect(texts).to.deep.equal([
      {start: 4, end: 7, text: 'abc'},
      {start: 8, end: 11, text: 'def'},
      {start: 12, end: 15, text: 'hij'},
    ]);
  });

  it('testFindSentences_dupFirstSentenceAfterSecond', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>abc def abc hij<p>';
    const ranges = findSentences(win, root, ['abc', 'def', 'hij']);
    expect(ranges).to.not.be.null;
    const texts = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push({
        start: r.start.offset,
        end: r.end.offset,
        text: range.toString(),
      });
    }
    expect(texts).to.deep.equal([
      {start: 0, end: 3, text: 'abc'},
      {start: 4, end: 7, text: 'def'},
      {start: 12, end: 15, text: 'hij'},
    ]);
  });

  it('testFindSentences_dupSecondSentence', () => {
    const root = document.createElement('div');
    // With the current algorithm, the second sentence matches to the latter
    // occurrence.
    root.innerHTML = '<p>abc def def hij<p>';
    const ranges = findSentences(win, root, ['abc', 'def', 'hij']);
    expect(ranges).to.not.be.null;
    const texts = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push({
        start: r.start.offset,
        end: r.end.offset,
        text: range.toString(),
      });
    }
    expect(texts).to.deep.equal([
      {start: 0, end: 3, text: 'abc'},
      {start: 8, end: 11, text: 'def'},
      {start: 12, end: 15, text: 'hij'},
    ]);
  });

  it('testFindSentences_emptyStringAfterCanonicalization', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>abc def hij<p>';
    const ranges = findSentences(win, root, ['abc', '...', 'hij']);
    expect(ranges).to.not.be.null;
    const texts = [];
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      const range = document.createRange();
      range.setStart(r.start.node, r.start.offset);
      range.setEnd(r.end.node, r.end.offset);
      texts.push({
        start: r.start.offset,
        end: r.end.offset,
        text: range.toString(),
      });
    }
    expect(texts).to.deep.equal([
      {start: 0, end: 3, text: 'abc'},
      {start: 8, end: 11, text: 'hij'},
    ]);
  });

  it('testFindSentences_emptySentences', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>abc def hij<p>';
    const ranges = findSentences(win, root, []);
    expect(ranges).to.be.null;
  });

  it('testFindSentences_emptySentencesAfterCanonicalization', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>abc def hij<p>';
    const ranges = findSentences(win, root, ['...']);
    expect(ranges).to.be.null;
  });
});

describes.realWin('TextScanner', {}, (env) => {
  let win, root;
  beforeEach(() => {
    win = env.win;
    // root should be appended to body to compute the style.
    root = win.document.createElement('div');
    win.document.body.appendChild(root);
  });

  it('single text', () => {
    root.innerHTML = 'ab cd  ef\n\ng';
    const chars = [];
    const scanner = new TextScanner(win, root);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      chars.push(pos.node.wholeText[pos.offset]);
    }
    expect(chars.join('')).to.equal('ab cd  ef\n\ng');
  });

  it('space suffix and prefix', () => {
    root.innerHTML = ' ab cd  ';

    const chars = [];
    const scanner = new TextScanner(win, root);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      chars.push(pos.node.wholeText[pos.offset]);
    }
    expect(chars.join('')).to.equal(' ab cd  ');
  });

  it('elements', () => {
    root.innerHTML =
      '<b>bold</b><i>italic</i><div>block</div>' +
      '<ul><li>nest0</li><li>nest1</li></ul>';

    const chars = [];
    const scanner = new TextScanner(win, root);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      chars.push(pos.node.wholeText[pos.offset]);
    }
    expect(chars.join('')).to.equal('bolditalicblocknest0nest1');
  });

  it('script', () => {
    root.innerHTML = '<p>hello</p><script>alert("js");</script>';

    const chars = [];
    const scanner = new TextScanner(win, root);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      chars.push(textPosChar(pos));
    }
    expect(chars.join('')).to.equal('hello');
  });

  it('special chars', () => {
    root.innerHTML = '\'"';

    const chars = [];
    const scanner = new TextScanner(win, root);
    for (let pos = scanner.next(); pos != null; pos = scanner.next()) {
      chars.push(textPosChar(pos));
    }
    expect(chars.join('')).to.equal('\'"');
  });
});

describes.realWin('markTextRangeList', {}, (env) => {
  let win, document;
  beforeEach(() => {
    win = env.win;
    document = win.document;
  });

  it('single node', () => {
    const root = document.createElement('div');
    const text = document.createTextNode('0123456789');
    root.appendChild(text);
    markTextRangeList(win, [
      {start: {node: text, offset: 1}, end: {node: text, offset: 3}},
      {start: {node: text, offset: 5}, end: {node: text, offset: 7}},
    ]);
    expect(root.innerHTML).to.equal('0<span>12</span>34<span>56</span>789');
  });

  it('multi nodes', () => {
    const root = document.createElement('div');
    root.innerHTML = '<b>abc</b><div>def</div><i>ghi</i>';
    const b = root.querySelector('b');
    const i = root.querySelector('i');
    markTextRangeList(win, [
      {
        start: {node: b.firstChild, offset: 1},
        end: {node: i.firstChild, offset: 1},
      },
    ]);
    ('<b>a<span>bc</span></b><div>def</div><i>ghi</i>');
    expect(root.innerHTML).to.equal(
      '<b>a<span>bc</span></b><div><span>def</span></div>' +
        '<i><span>g</span>hi</i>'
    );
  });

  it('concat ranges', () => {
    const root = document.createElement('div');
    const text = document.createTextNode('0123456789');
    root.appendChild(text);
    markTextRangeList(win, [
      {start: {node: text, offset: 1}, end: {node: text, offset: 3}},
      {start: {node: text, offset: 3}, end: {node: text, offset: 5}},
    ]);
    expect(root.innerHTML).to.equal('0<span>1234</span>56789');
  });
});
