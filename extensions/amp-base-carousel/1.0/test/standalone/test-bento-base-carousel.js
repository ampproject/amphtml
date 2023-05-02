import {CSS} from '#build/bento-base-carousel-1.0.css';

import {BaseElement as BentoCarousel} from '#bento/components/bento-base-carousel/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {subscribe, unsubscribe} from '#core/context';
import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';
import {CanRender} from '#preact/contextprops';

describes.realWin('bento-base-carousel:1.0', {amp: false}, (env) => {
  let win;
  let html;
  let element;

  function readContextProp(element, prop) {
    return new Promise((resolve) => {
      const handler = (value) => {
        resolve(value);
        unsubscribe(element, [prop], handler);
      };
      subscribe(element, [prop], handler);
    });
  }

  beforeEach(async () => {
    win = env.win;
    html = htmlFor(win.document);
    element = html`
      <bento-base-carousel visible-count="1">
        <img src="/examples/bind/shirts/blue.jpg" />
        <img src="/examples/bind/shirts/brown.jpg" />
        <img src="/examples/bind/shirts/navy.jpg" />
        <img src="/examples/bind/shirts/wine.jpg" />
        <img src="/examples/bind/shirts/dark-green.jpg" />
      </bento-base-carousel>
    `;
    defineBentoElement('bento-base-carousel', BentoCarousel, win);
    adoptStyles(win, CSS);
    win.document.body.appendChild(element);
    await element.getApi();
  });

  it('should render slides', async () => {
    const slides = element.children;

    expect(slides.length).to.equal(5);
    expect(slides[0].getAttribute('src')).to.have.equal(
      '/examples/bind/shirts/blue.jpg'
    );
    expect(slides[1].getAttribute('src')).to.have.equal(
      '/examples/bind/shirts/brown.jpg'
    );
    expect(slides[2].getAttribute('src')).to.have.equal(
      '/examples/bind/shirts/navy.jpg'
    );
    expect(slides[3].getAttribute('src')).to.have.equal(
      '/examples/bind/shirts/wine.jpg'
    );
    expect(slides[4].getAttribute('src')).to.have.equal(
      '/examples/bind/shirts/dark-green.jpg'
    );

    expect(await readContextProp(slides[0], CanRender)).to.be.true;
    expect(await readContextProp(slides[1], CanRender)).to.be.false;
    expect(await readContextProp(slides[2], CanRender)).to.be.false;
    expect(await readContextProp(slides[3], CanRender)).to.be.false;
    expect(await readContextProp(slides[4], CanRender)).to.be.false;
  });
});
