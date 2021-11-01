import {expect} from 'chai';
import {renderAsElement} from '../simple-template';

describes.realWin('simple-template', {}, (env) => {
  it('renders tag', () => {
    const element = renderAsElement(env.win.document, {tag: 'div'});
    expect(element.outerHTML).to.equal('<div></div>');
  });

  it('renders attributes', () => {
    const element = renderAsElement(env.win.document, {
      tag: 'span',
      attrs: {'class': 'foo', 'aria-label': 'bar label'},
    });
    expect(element.outerHTML).to.equal(
      '<span class="foo" aria-label="bar label"></span>'
    );
  });

  it('renders children', () => {
    const element = renderAsElement(env.win.document, {
      tag: 'p',
      children: [
        {
          tag: 'span',
          children: ['Hello'],
        },
        ' ',
        {
          tag: 'strong',
          children: ['World'],
        },
      ],
    });
    expect(element.outerHTML).to.equal(
      '<p><span>Hello</span> <strong>World</strong></p>'
    );
  });

  it('renders children with attributes', () => {
    const element = renderAsElement(env.win.document, {
      tag: 'a',
      attrs: {href: '#'},
      children: [
        {
          tag: 'span',
          attrs: {class: 'foo'},
          children: ['Hello'],
        },
      ],
    });
    expect(element.outerHTML).to.equal(
      '<a href="#"><span class="foo">Hello</span></a>'
    );
  });

  it('ignores null children', () => {
    const element = renderAsElement(env.win.document, {
      tag: 'span',
      children: [null, 'bar'],
    });
    expect(element.outerHTML).to.equal('<span>bar</span>');
  });
});
