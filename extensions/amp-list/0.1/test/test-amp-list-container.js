import {Services} from '#service';
import {AmpDocService} from '#service/ampdoc-impl';

import {
  measureElementStub,
  measureMutateElementStub,
  mutateElementStub,
} from '#testing/helpers/service';

import {AmpList} from '../amp-list';

describes.realWin(
  'amp-list layout container',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-list'],
    },
  },
  (env) => {
    let win;
    let doc;
    let ampdoc;
    let element, list;
    let templates;
    let lockHeightSpy, unlockHeightSpy;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;

      templates = {
        findAndSetHtmlForTemplate: env.sandbox.stub(),
        findAndRenderTemplate: env.sandbox.stub(),
        findAndRenderTemplateArray: env.sandbox.stub(),
      };
      env.sandbox.stub(Services, 'templatesForDoc').returns(templates);
      env.sandbox.stub(AmpDocService.prototype, 'getAmpDoc').returns(ampdoc);

      element = doc.createElement('amp-list');
      list = new AmpList(element);

      env.sandbox.stub(list, 'getAmpDoc').returns(ampdoc);
      env.sandbox.stub(list, 'getFallback').returns(null);

      env.sandbox.stub(list, 'mutateElement').callsFake(mutateElementStub);
      env.sandbox.stub(list, 'measureElement').callsFake(measureElementStub);
      env.sandbox
        .stub(list, 'measureMutateElement')
        .callsFake(measureMutateElementStub);
      element.setAttribute('src', '/list');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '50');
      element.setAttribute('height', '10');
      doc.body.appendChild(element);

      env.sandbox.stub(list, 'getOverflowElement').returns(null);
      env.sandbox.stub(list, 'fetchList_').returns(Promise.resolve());
      list.element.applySize = () => {};
      list.buildCallback();

      lockHeightSpy = env.sandbox.spy(list, 'lockHeightAndMutate_');
      unlockHeightSpy = env.sandbox.spy(list, 'unlockHeightInsideMutate_');
    });

    afterEach(() => {
      expect(lockHeightSpy).not.called;
      expect(unlockHeightSpy).not.called;
    });

    it('should change to layout container', async () => {
      await list.layoutCallback();
      await list.changeToLayoutContainer_();
      expect(element.style.height).to.equal('');
      expect(element.getAttribute('layout')).to.equal('container');
      expect(element.classList.contains('i-amphtml-layout-container')).to.be
        .true;
      const containerClasses = list.container_.classList;
      expect(containerClasses.contains('i-amphtml-fill-content')).to.be.false;
      expect(containerClasses.contains('i-amphtml-replaced-content')).to.be
        .false;
    });

    it('should trigger on bind', async () => {
      const changeSpy = env.sandbox.spy(list, 'changeToLayoutContainer_');
      await list.layoutCallback();
      await list.mutatedAttributesCallback({'is-layout-container': true});
      expect(changeSpy).to.be.calledOnce;
    });
  }
);
