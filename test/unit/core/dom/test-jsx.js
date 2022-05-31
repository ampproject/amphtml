import {dispatchCustomEvent} from '#core/dom/index';
import * as Preact from '#core/dom/jsx';

// We test invalid uses, so we disable the lint rule.
/* eslint-disable local/core-dom-jsx */

const {createElement} = Preact;

describes.sandboxed('#core/dom/jsx', {}, (env) => {
  it('renders without attributes', () => {
    const element = <div />;
    expect(element.outerHTML).to.equal('<div></div>');
  });

  it('renders attributes', () => {
    const element = <div data-foo="bar" data-count={0} />;
    expect(element.outerHTML).to.equal(
      '<div data-foo="bar" data-count="0"></div>'
    );
  });

  it('boolean `true` implies empty attribute', () => {
    const element = <video autoplay={true} />;
    expect(element.outerHTML).to.equal('<video autoplay=""></video>');
  });

  it('boolean `false` implies no attribute', () => {
    const element = <video autoplay={false} />;
    expect(element.outerHTML).to.equal('<video></video>');
  });

  it('nullish implies no attribute', () => {
    const element = <video autoplay={null} />;
    expect(element.outerHTML).to.equal('<video></video>');
  });

  it('includes string child', () => {
    const element = <div>foo</div>;
    expect(element.outerHTML).to.equal('<div>foo</div>');
  });

  it('includes string children', () => {
    const element = <div>{['foo', 'bar']}</div>;
    expect(element.outerHTML).to.equal('<div>foobar</div>');
  });

  it('includes DOM node child', () => {
    const element = (
      <div>
        <span>{['foo']}</span>
      </div>
    );
    expect(element.outerHTML).to.equal('<div><span>foo</span></div>');
  });

  it('includes DOM node children', () => {
    const element = (
      <div>
        <a href="#">
          <span>{['click']}</span>
        </a>
      </div>
    );
    expect(element.outerHTML).to.equal(
      '<div><a href="#"><span>click</span></a></div>'
    );
  });

  it('includes children var args', () => {
    const element = createElement(
      'ul',
      null,
      <li>one</li>,
      <li class="even">two</li>,
      <li>three</li>
    );
    expect(element.outerHTML).to.equal(
      '<ul><li>one</li><li class="even">two</li><li>three</li></ul>'
    );
  });

  it('ignores nullish and false children', () => {
    const element = (
      <div>
        {null}
        {undefined}
        {false}
      </div>
    );
    expect(element.outerHTML).to.equal('<div></div>');
  });

  it('ignores nested nullish and false children', () => {
    const element = (
      <div>
        {null}
        {[false, [undefined]]}
      </div>
    );
    expect(element.outerHTML).to.equal('<div></div>');
  });

  it('renders child of value `0`', () => {
    const element = <div>{0}</div>;
    expect(element.outerHTML).to.equal('<div>0</div>');
  });

  it('renders functions', () => {
    function Component({children, 'class': className}) {
      return <div class={`component ${className}`}>{children}</div>;
    }
    const element = (
      <Component class="composed">
        <p>foo</p>
      </Component>
    );
    expect(element.outerHTML).to.equal(
      '<div class="component composed"><p>foo</p></div>'
    );
  });

  it('attaches event handlers from attributes', () => {
    const onFooBar = env.sandbox.spy();
    const element = <div onFooBar={onFooBar} />;
    expect(element).to.not.have.attribute('onfoobar');
    expect(onFooBar).to.not.have.been.called;
    dispatchCustomEvent(element, 'foobar');
    expect(onFooBar).to.have.been.calledOnce;
  });

  it('non-function `on` attribute is not treated like an event handler function', () => {
    const element = <button on="tap:lightbox.open" onClick="foo()" />;
    expect(element.outerHTML).to.equal(
      '<button on="tap:lightbox.open" onclick="foo()"></button>'
    );
  });

  it('text content is safe', () => {
    const element = <div>{'<script dangerous>'}</div>;
    expect(element.outerHTML).to.equal('<div>&lt;script dangerous&gt;</div>');
  });

  it('attributes are safe', () => {
    const element = <div data-dangerous={'"><script src="foo.js'} />;
    expect(element.outerHTML).to.equal(
      '<div data-dangerous="&quot;><script src=&quot;foo.js"></div>'
    );
  });

  it('renders with SVG namespace with props.xmlns', () => {
    // Using `createElement` directly since `xmlns` is added during
    // transformation by babel-plugin-dom-jsx-svg-namespace
    const xmlns = 'http://www.w3.org/2000/svg';
    const withProp = createElement('svg', {xmlns});
    expect(withProp.namespaceURI).to.equal(xmlns);
    const withoutProp = createElement('svg');
    expect(withoutProp.namespaceURI).to.not.equal(xmlns);
  });

  it('renders with SVG namespace with props.xmlns (compiled)', () => {
    // This works because <svg> is transformed by
    // babel-plugin-dom-jsx-svg-namespace
    const xmlns = 'http://www.w3.org/2000/svg';
    const withProp = <svg />;
    expect(withProp.namespaceURI).to.equal(xmlns);
    const withoutProp = <div />;
    expect(withoutProp.namespaceURI).to.not.equal(xmlns);
  });

  describe('unsupported JSX features', () => {
    it('does not support Fragments', () => {
      allowConsoleError(() => {
        expect(() => <></>).to.throw();
      });
    });

    it('does not support objects as attribute values', () => {
      // Using `createElement` directly since objects in `style` JSXAttributes
      // are otherwise transformed by babel-plugin-jsx-style-object
      const element = createElement('div', {
        style: {width: 400},
        class: {foo: true, bar: false},
      });
      expect(element.outerHTML).to.equal(
        '<div style="[object Object]" class="[object Object]"></div>'
      );
    });

    it('supports object as style attribute value (compiled)', () => {
      // This works because it's transformed by babel-plugin-jsx-style-object
      const element = <div style={{width: 400, background: null}} />;
      expect(element.outerHTML).to.equal('<div style="width:400px;"></div>');
    });

    it('does not support dangerouslySetInnerHTML', () => {
      const element = <div dangerouslySetInnerHTML={{__html: '<script>'}} />;
      expect(element.outerHTML).to.equal(
        '<div dangerouslysetinnerhtml="[object Object]"></div>'
      );
    });
  });
});
