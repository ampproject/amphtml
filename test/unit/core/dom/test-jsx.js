import {dispatchCustomEvent} from '#core/dom/index';
import {Fragment, createElement as h} from '#core/dom/jsx';

describes.sandboxed('#core/dom/jsx', {}, (env) => {
  it('renders without attributes', () => {
    const element = h('div');
    expect(element.outerHTML).to.equal('<div></div>');
  });

  it('renders attributes', () => {
    const element = h('div', {'data-foo': 'bar', 'data-count': 0});
    expect(element.outerHTML).to.equal(
      '<div data-foo="bar" data-count="0"></div>'
    );
  });

  it('boolean `true` implies empty attribute', () => {
    const element = h('video', {autoplay: true});
    expect(element.outerHTML).to.equal('<video autoplay=""></video>');
  });

  it('boolean `false` implies no attribute', () => {
    const element = h('video', {autoplay: false});
    expect(element.outerHTML).to.equal('<video></video>');
  });

  it('nullish implies no attribute', () => {
    const element = h('video', {autoplay: null});
    expect(element.outerHTML).to.equal('<video></video>');
  });

  it('includes string child', () => {
    const element = h('div', null, 'foo');
    expect(element.outerHTML).to.equal('<div>foo</div>');
  });

  it('includes string children', () => {
    const element = h('div', null, ['foo']);
    expect(element.outerHTML).to.equal('<div>foo</div>');
  });

  it('includes DOM node child', () => {
    const element = h('div', null, h('span', null, ['foo']));
    expect(element.outerHTML).to.equal('<div><span>foo</span></div>');
  });

  it('includes DOM node children', () => {
    const element = h('div', null, [
      h('a', {href: '#'}, h('span', null, ['click'])),
    ]);
    expect(element.outerHTML).to.equal(
      '<div><a href="#"><span>click</span></a></div>'
    );
  });

  it('includes children var args', () => {
    const element = h(
      'ul',
      null,
      h('li', null, 'one'),
      h('li', {class: 'even'}, 'two'),
      h('li', null, 'three')
    );
    expect(element.outerHTML).to.equal(
      '<ul><li>one</li><li class="even">two</li><li>three</li></ul>'
    );
  });

  it('ignores falsy children', () => {
    const element = h('div', null, [null, false]);
    expect(element.outerHTML).to.equal('<div></div>');
  });

  it('ignores nested falsy children', () => {
    const element = h('div', null, [null, [false, [null]]]);
    expect(element.outerHTML).to.equal('<div></div>');
  });

  it('renders child of value `0`', () => {
    const element = h('div', null, 0);
    expect(element.outerHTML).to.equal('<div>0</div>');
  });

  it('renders functions', () => {
    function Component({children, 'class': className}) {
      return h('div', {'class': `component ${className}`}, children);
    }
    const element = h(Component, {'class': 'composed'}, h('p', null, 'foo'));
    expect(element.outerHTML).to.equal(
      '<div class="component composed"><p>foo</p></div>'
    );
  });

  it('attaches event handlers from attributes', () => {
    const onFooBar = env.sandbox.spy();
    const element = h('div', {onFooBar});
    dispatchCustomEvent(element, 'foobar');
    expect(onFooBar).to.have.been.calledOnce;
  });

  it('text content is safe', () => {
    const element = h('div', null, '<script dangerous>');
    expect(element.outerHTML).to.equal('<div>&lt;script dangerous&gt;</div>');
  });

  it('attributes are safe', () => {
    const element = h('div', {'data-dangerous': '"><script src="foo.js'});
    expect(element.outerHTML).to.equal(
      '<div data-dangerous="&quot;><script src=&quot;foo.js"></div>'
    );
  });

  describe('unsupported JSX features', () => {
    it('does not support Fragments', () => {
      allowConsoleError(() => {
        expect(() => h(Fragment)).to.throw();
      });
    });

    it('does not support objects as attribute values', () => {
      const element = h('div', {
        style: {width: 400},
        class: {foo: true, bar: false},
      });
      expect(element.outerHTML).to.equal(
        '<div style="[object Object]" class="[object Object]"></div>'
      );
    });

    it('does not support dangerouslySetInnerHTML', () => {
      const element = h('div', {
        dangerouslySetInnerHTML: {__html: '<script>'},
      });
      expect(element.outerHTML).to.equal(
        '<div dangerouslysetinnerhtml="[object Object]"></div>'
      );
    });
  });
});
