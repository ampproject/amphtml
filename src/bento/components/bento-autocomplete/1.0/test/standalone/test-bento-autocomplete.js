import {BaseElement as BentoAutocomplete} from '#bento/components/bento-autocomplete/1.0/base-element';

import {htmlFor} from '#core/dom/static-template';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

describes.realWin('bento-autocomplete:1.0', {amp: false}, (env) => {
  let win;
  let html;
  let warnSpy;

  beforeEach(() => {
    win = env.win;
    html = htmlFor(win.document);
    warnSpy = env.sandbox.spy(win.console, 'warn');
    defineBentoElement('bento-autocomplete', BentoAutocomplete, win);
  });

  afterEach(() => {
    env.sandbox.restore();
  });

  async function mountElement(element) {
    win.document.body.appendChild(element);
    await element.getApi();
    return element;
  }

  async function waitForInputSetup(element) {
    const inputHasAttributes = () => {
      const input = element.querySelector('input');
      return input.getAttribute('aria-autocomplete') === 'both';
    };
    await waitFor(inputHasAttributes, 'input is set up');
  }

  it('warns if there is no script tag or src', async () => {
    await mountElement(html`
      <bento-autocomplete filter="none">
        <input type="text" />
      </bento-autocomplete>
    `);
    expect(warnSpy).calledWithMatch(/script/i);
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

    expect(warnSpy).calledWithMatch(/Expected key/i);
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

  it('renders items from a mustache template', async () => {
    const element = await mountElement(html`
      <bento-autocomplete filter-value="city">
        <input type="text" />
        <script type="application/json">
          {
            "items": [
              {"city": "Seattle", "state": "WA"},
              {"city": "New York", "state": "NY"},
              {"city": "Chicago", "state": "IL"}
            ]
          }
        </script>
        <template type="bento-mustache">
          <div class="city-item" data-value="{{city}}, {{state}}">
            {{city}}, {{state}}
          </div>
        </template>
      </bento-autocomplete>
    `);
    const results = element.shadowRoot.querySelectorAll('.city-item');

    expect(results.length).to.equal(3);
    expect(results[0].getAttribute('data-value')).to.equal('Seattle, WA');
    expect(results[1].getAttribute('data-value')).to.equal('New York, NY');
    expect(results[2].getAttribute('data-value')).to.equal('Chicago, IL');
  });

  it('updates the input value when selecting a template item', async () => {
    const element = await mountElement(html`
      <bento-autocomplete filter-value="city" min-chars="0">
        <input type="text" />
        <script type="application/json">
          {
            "items": [
              {"city": "Seattle", "state": "WA"},
              {"city": "New York", "state": "NY"},
              {"city": "Chicago", "state": "IL"}
            ]
          }
        </script>
        <template type="bento-mustache">
          <div class="city-item" data-value="{{city}}, {{state}}">
            {{city}}, {{state}}
          </div>
        </template>
      </bento-autocomplete>
    `);

    await waitForInputSetup(element);
    const input = element.querySelector('input');
    input.click();

    const results = element.shadowRoot.querySelectorAll('[role="option"]');
    results[0].dispatchEvent(new Event('mousedown'));

    expect(input.value).to.equal('Seattle, WA');
  });
});
