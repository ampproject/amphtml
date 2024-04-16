import {createDocument as createWorkerDomDoc} from '@ampproject/worker-dom/dist/server-lib.mjs';

import {getBuilders} from '#compiler/builders';

import {createElementWithAttributes} from '#core/dom';

import {getDeterministicOuterHTML} from '#testing/helpers';

describes.fakeWin('getBuilders', {}, (env) => {
  let doc;
  beforeEach(() => (doc = env.win.document));

  it('should return an empty list for empty component list', () => {
    const components = [];
    expect(getBuilders(components)).to.eql({});
  });

  it('should return eligible builtins when provided them as components', () => {
    const components = [{component: 'amp-layout', version: 'v0'}];
    const builders = getBuilders(components);
    expect(builders).have.all.keys(['amp-layout']);
  });

  it('eligible component with ineligible version is not used', () => {
    const components = [{component: 'amp-fit-text', version: '1.0'}];
    const builders = getBuilders(components);
    expect(builders).to.eql({});
  });

  it('should return eligible components', () => {
    const components = [
      {component: 'amp-fit-text', version: '0.1'},
      {component: 'amp-layout', version: 'v0'},
    ];
    const builders = getBuilders(components);
    expect(builders).have.all.keys(['amp-layout', 'amp-fit-text']);
  });

  describe('buildDom wrapper', () => {
    function buildDom() {}
    const versionedBuilderMap = {'v0': {noop: buildDom}};
    const versions = [{component: 'noop', version: 'v0'}];
    const builders = getBuilders(versions, versionedBuilderMap);

    it('should add i-amphtml-ssr', () => {
      const elem = doc.createElement('div');
      builders.noop(elem);
      expect(elem.hasAttribute('i-amphtml-ssr')).true;
    });

    it('should apply static layout', () => {
      const elem = createElementWithAttributes(doc, 'div', {
        height: 100,
        width: 100,
      });
      builders.noop(elem);
      expect(elem.getAttribute('i-amphtml-layout')).equal('fixed');
    });

    it('wrapper should behave same in browser as in WorkerDOM', () => {
      const browserDiv = createElementWithAttributes(doc, 'div', {
        height: 100,
        width: 100,
      });
      const workerDomDiv = createElementWithAttributes(
        createWorkerDomDoc(),
        'div',
        {
          height: 100,
          width: 100,
        }
      );

      builders.noop(browserDiv);
      builders.noop(workerDomDiv);

      const browserHtml = getDeterministicOuterHTML(browserDiv);
      const workerHtml = getDeterministicOuterHTML(workerDomDiv);
      expect(workerHtml).equal(browserHtml);
    });
  });
});
