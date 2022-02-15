import {createDocument as createWorkerDomDoc} from '@ampproject/worker-dom/dist/server-lib.mjs';

import {AmpLayout} from '#builtins/amp-layout/amp-layout';
import {buildDom} from '#builtins/amp-layout/build-dom';

import {createElementWithAttributes} from '#core/dom';
import {Layout_Enum} from '#core/dom/layout';

import {getDeterministicOuterHTML} from '#testing/helpers';

describes.realWin('amp-layout', {amp: true}, (env) => {
  async function getAmpLayout(attrs, innerHTML) {
    const {win} = env;
    const ampLayout = createElementWithAttributes(
      win.document,
      'amp-layout',
      attrs
    );
    ampLayout.innerHTML = innerHTML;
    win.document.body.appendChild(ampLayout);

    await ampLayout.buildInternal();
    await ampLayout.layoutCallback();

    return ampLayout;
  }

  it('should reparent all children under a container for when layout!=container', async () => {
    const children = '<span>hello</span><span>world</span>';
    const ampLayout = await getAmpLayout(
      {layout: Layout_Enum.FIXED, height: 100, width: 100},
      children
    );

    expect(ampLayout.childNodes).have.length(1);
    expect(ampLayout.childNodes[0].getAttribute('class')).includes(
      'i-amphtml-fill-content'
    );
    expect(ampLayout.childNodes[0].innerHTML).equal(children);
  });

  it('should noop when layout=container', async () => {
    const children = '<span>hello</span><span>world</span>';
    const ampLayout = await getAmpLayout({}, children);

    expect(ampLayout.childNodes).have.length(2);
    expect(ampLayout.innerHTML).equal(children);
  });

  it('buildDom and buildCallback should result in the same outerHTML', () => {
    const layout1 = createElementWithAttributes(
      env.win.document,
      'amp-layout',
      {
        width: 100,
        height: 100,
      }
    );
    const layout2 = layout1.cloneNode(/* deep */ true);

    new AmpLayout(layout1).buildCallback();
    buildDom(layout2);

    expect(layout1.outerHTML).to.equal(layout2.outerHTML);
  });

  it('buildDom should result in the same outerHTML in WorkerDOM and Browser', () => {
    const browserAmpLayout = createElementWithAttributes(
      env.win.document,
      'amp-layout',
      {
        width: 100,
        height: 100,
      }
    );
    const workerDomAmpLayout = createElementWithAttributes(
      createWorkerDomDoc(),
      'amp-layout',
      {
        width: 100,
        height: 100,
      }
    );

    buildDom(browserAmpLayout);
    buildDom(workerDomAmpLayout);

    const browserHtml = getDeterministicOuterHTML(browserAmpLayout);
    const workerDomHtml = getDeterministicOuterHTML(workerDomAmpLayout);
    expect(browserHtml).to.equal(workerDomHtml);
  });

  it('buildDom does not modify server rendered elements', () => {
    const layout = createElementWithAttributes(env.win.document, 'amp-layout');
    buildDom(layout);
    layout.setAttribute('i-amphtml-ssr', '');

    const before = layout.outerHTML;
    buildDom(layout);
    const after = layout.outerHTML;

    expect(before).to.equal(after);
  });
});
