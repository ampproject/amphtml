/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '../amp-infinite-scroll';

describes.realWin(
  'amp-infinite-scroll',
  {
    amp: {
      extensions: ['amp-infinite-scroll'],
    },
  },
  env => {
    let win;
    let doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function createInfiniteScroll() {
      const element = doc.createElement('amp-infinite-scroll');
      element.setAttribute('next-page', 'http://something.com');
      element.setAttribute('layout', 'fixed');
      element.setAttribute('width', '500');
      element.setAttribute('height', '20');
      element.setAttribute('next-page', 'https://fakeapi.com/page/1');

      const placeholder = doc.createElement('div');
      placeholder.setAttribute('placeholder', 1);
      placeholder.textContent = 'Loading...';

      const fallback = doc.createElement('div');
      fallback.setAttribute('fallback', 1);
      fallback.textContent = 'Failed to load data';

      element.appendChild(placeholder);
      element.appendChild(fallback);
      doc.body.appendChild(element);

      const impl = element.implementation_;
      impl.mutateElement = callback => callback();
      return element
        .build()
        .then(() => element.layoutCallback())
        .then(() => element);
    }

    it('should render page fetched from api', async () => {
      const element = await createInfiniteScroll();
      const impl = element.implementation_;
      sandbox.stub(impl, 'fetchPage_').resolves({
        page: '<span id="via-infinite-scroll">added by infinite scroll</span>',
        nextPage: null,
      });
      await impl.fireLoad_();

      expect(doc.getElementById('via-infinite-scroll').textContent).to.equal(
        'added by infinite scroll'
      );
    });

    it('should render multiple pages', async () => {
      const element = await createInfiniteScroll();
      const impl = element.implementation_;
      const fetchPageStub = sandbox.stub(impl, 'fetchPage_');

      fetchPageStub.resolves({
        page: '<span id="via-infinite-scroll1"></span>',
        nextPage: 'https://fakeapi.com/page/2',
      });

      await impl.fireLoad_();

      fetchPageStub.resolves({
        page: '<spn id="via-infinite-scroll2"></span>',
        nextPage: null,
      });

      await impl.fireLoad_();

      expect(doc.getElementById('via-infinite-scroll1')).not.to.be.null;
      expect(doc.getElementById('via-infinite-scroll2')).not.to.be.null;
    });

    it('should stop rendering when nextPageCursor is not set', async () => {
      const element = await createInfiniteScroll();
      const impl = element.implementation_;
      impl.nextPageCursor_ = null;
      const fetchPageSpy = sandbox.spy(impl, 'fetchPage_');
      await impl.fireLoad_();
      expect(fetchPageSpy).not.to.be.called;
    });

    it('should show placeholder while loading', async () => {
      const element = await createInfiniteScroll();
      const impl = element.implementation_;
      const fetchPromise = Promise.resolve({data: 'test'});
      sandbox.stub(impl, 'fetchPage_').returns(fetchPromise);

      impl.fireLoad_();

      const placeholder = element.querySelector('[placeholder]');
      expect(placeholder.textContent).to.be.eq('Loading...');
      expect(win.getComputedStyle(placeholder).visibility).to.be.eq('visible');

      await fetchPromise;
      expect(win.getComputedStyle(placeholder).visibility).to.be.eq('hidden');
    });

    it('should show fallback when error', async () => {
      const element = await createInfiniteScroll();
      const impl = element.implementation_;
      sandbox.stub(impl, 'fetchPage_').rejects();

      impl.fireLoad_();

      const fallback = element.querySelector('[fallback]');
      expect(fallback.textContent).to.be.eq('Failed to load data');
      expect(win.getComputedStyle(fallback).visibility).to.be.eq('visible');
    });

    it('should call fireLoad_ when element is intersecting viewport', async () => {
      const element = await createInfiniteScroll();
      const impl = element.implementation_;
      const fireLoadStub = sandbox.stub(impl, 'fireLoad_');

      impl.intersectCallback_([{isIntersecting: true}]);
      expect(fireLoadStub).to.be.calledOnce;
    });
    it('should not call fireLoad_ when element is not on viewport', async () => {
      const element = await createInfiniteScroll();
      const impl = element.implementation_;
      const fireLoadStub = sandbox.stub(impl, 'fireLoad_');

      impl.intersectCallback_([
        {isIntersecting: false},
        {isIntersecting: false},
      ]);
      expect(fireLoadStub).not.to.be.called;
    });
  }
);
