import {getHtml} from '#core/dom/get-html';

const template = `<div id="wrapper">
  <div test="test" class="tmp">Lorem ipsum</div>
  dolor sit amet
  <img class="-amp-class-name" src="https://random-source.com/img.jpeg">
  <amp-analytics>
    <script type="application/json">
      {"key": "value"}
    </script>
  </amp-analytics>
</div>
`;

describes.sandboxed('DOM - getHtml', {}, () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    element.innerHTML = template;
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should correctly works with empty second parameter', () => {
    const result = getHtml(window, '#wrapper', []);
    const expected = '<div> <div>Lorem ipsum</div> dolor sit amet </div>';
    expect(result).to.equal(expected);
  });

  it('should correctly works with attributes array', () => {
    const result = getHtml(window, '#wrapper', ['class', 'id']);
    const expected =
      '<div id="wrapper"> ' +
      '<div class="tmp">Lorem ipsum</div> dolor sit amet </div>';
    expect(result).to.equal(expected);
  });

  it('should correctly works with attributes array', () => {
    const result = getHtml(window, '.tmp', ['class', 'id']);
    expect(result).to.equal('<div class="tmp">Lorem ipsum</div>');
  });

  it('should works only with attributes from allowlist', () => {
    const result = getHtml(window, '.tmp', ['class', 'test']);
    expect(result).to.equal('<div class="tmp">Lorem ipsum</div>');
  });

  it('should correctly work with wrong selector', () => {
    const result = getHtml(window, '.no-such-class', ['class', 'id']);
    expect(result).to.equal('');
  });
});
