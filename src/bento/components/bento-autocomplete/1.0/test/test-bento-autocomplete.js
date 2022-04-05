import {expect} from 'chai';

import {BaseElement as BentoAutocomplete} from '#bento/components/bento-autocomplete/1.0/base-element';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {user} from '#utils/log';

describes.realWin('bento-autocomplete:1.0', {amp: false}, (env) => {
  let win;
  let html;
  let warnSpy;
  let errorSpy;

  beforeEach(() => {
    win = env.win;
    html = htmlFor(win.document);
    warnSpy = env.sandbox.stub(user(), 'warn');
    errorSpy = env.sandbox.stub(user(), 'error');
    defineBentoElement('bento-autocomplete', BentoAutocomplete, win);
  });

  async function mountElement(element) {
    win.document.body.appendChild(element);
    await element.getApi();
    return element;
  }

  it('warns if there is no script tag or src', async () => {
    await mountElement(html`
      <bento-autocomplete filter="none">
        <input type="text" />
      </bento-autocomplete>
    `);
    expect(warnSpy).calledWithMatch('bento-autocomplete', /script/i);
  });

  it('gets the items from a script tag', async () => {
    const element = await mountElement(html`
      <bento-autocomplete>
        <input type="text" />
        <script type="application/json">
          {"items": ["one", "two", "three"]}
        </script>
      </bento-autocomplete>
    `);
    const results = element.shadowRoot.querySelectorAll('[role="option"]');

    expect(results.length).to.equal(3);
    expect(results[0].getAttribute('data-value')).to.equal('one');
    expect(results[1].getAttribute('data-value')).to.equal('two');
    expect(results[2].getAttribute('data-value')).to.equal('three');
  });

  it('warns if the items property does not match the script', async () => {
    await mountElement(html`
      <bento-autocomplete items="customItems">
        <input type="text" />
        <script type="application/json">
          {"items": ["one", "two", "three"]}
        </script>
      </bento-autocomplete>
    `);

    expect(warnSpy).calledWithMatch(
      'bento-autocomplete',
      /Expected key/i,
      'customItems'
    );
  });

  it('gets custom items', async () => {
    const element = await mountElement(html`
      <bento-autocomplete items="customItems">
        <input type="text" />
        <script type="application/json">
          {"customItems": ["one", "two", "three"]}
        </script>
      </bento-autocomplete>
    `);
    const results = element.shadowRoot.querySelectorAll('[role="option"]');

    expect(results.length).to.equal(3);
    expect(results[0].getAttribute('data-value')).to.equal('one');
    expect(results[1].getAttribute('data-value')).to.equal('two');
    expect(results[2].getAttribute('data-value')).to.equal('three');
  });
});
