import {ActionTrust_Enum} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Deferred} from '#core/data-structures/promise';
import {createElementWithAttributes} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {resetExperimentTogglesForTesting, toggleExperiment} from '#experiments';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';
import {AmpDocService} from '#service/ampdoc-impl';

import {AmpScriptService} from '../../../amp-script/0.1/amp-script';
import {AmpList} from '../amp-list';

describes.repeated(
  'amp-list',
  {
    'with script[type=text/plain][template=amp-mustache]': {
      templateType: 'script',
    },
    'with template[type=amp-mustache]': {templateType: 'template'},
  },
  (name, variant) => {
    describes.realWin(
      '<amp-list>',
      {
        amp: {
          ampdoc: 'single',
          extensions: ['amp-list'],
        },
        runtimeOn: false,
      },
      (env) => {
        let win, doc, ampdoc;
        let element, list, listMock;
        let resource, resources;
        let setBindService;
        let ssrTemplateHelper;
        let templates;

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
          env.sandbox
            .stub(AmpDocService.prototype, 'getAmpDoc')
            .returns(ampdoc);

          resource = {
            resetPendingChangeSize: env.sandbox.stub(),
          };
          resources = {
            getResourceForElement: (e) => (e === element ? resource : null),
          };

          element = createAmpListElement();

          const {templateType} = variant;
          const template = doc.createElement(templateType);

          if (templateType == 'template') {
            template.content.appendChild(doc.createTextNode('{{template}}'));
          } else {
            template.setAttribute('type', 'text/plain');
            template.setAttribute('template', 'amp-mustache');
            template.innerText = '{{template}}';
          }

          element.appendChild(template);

          const {promise, resolve} = new Deferred();
          env.sandbox.stub(Services, 'bindForDocOrNull').returns(promise);
          setBindService = resolve;

          env.sandbox
            .stub(Services, 'ownersForDoc')
            .returns({scheduleUnlayout: env.sandbox.stub()});

          ssrTemplateHelper = {
            isEnabled: () => false,
            ssr: () => Promise.resolve(),
            applySsrOrCsrTemplate: env.sandbox.stub(),
          };

          list = createAmpList(element);

          element.style.height = '10px';
          doc.body.appendChild(element);
        });

        afterEach(() => {
          // There should only be one mock to verify.
          listMock.verify();
        });

        function createAmpListElement() {
          const element = doc.createElement('div');
          element.setAttribute('src', 'https://data.com/list.json');
          element.getAmpDoc = () => ampdoc;
          element.getFallback = () => null;
          element.getPlaceholder = () => null;
          element.getResources = () => resources;
          return element;
        }

        function createAmpList(element) {
          const list = new AmpList(element);
          list.buildCallback();
          list.ssrTemplateHelper_ = ssrTemplateHelper;
          listMock = env.sandbox.mock(list);
          return list;
        }

        const DEFAULT_LIST_OPTS = {
          expr: 'items',
          maxItems: 0,
          singleItem: false,
          refresh: false,
          resetOnRefresh: false,
        };
        const DEFAULT_ITEMS = [{title: 'Title1'}];
        const DEFAULT_FETCHED_DATA = {
          items: DEFAULT_ITEMS,
        };

        /**
         * @param {!Array|!Object} fetched
         * @param {!Array<!Element>} rendered
         * @param {Object=} opts
         * @return {!Promise}
         */
        function expectFetchAndRender(
          fetched,
          rendered,
          opts = DEFAULT_LIST_OPTS
        ) {
          expectFetch(fetched, rendered, opts);
          expectRender();
        }

        function expectFetch(fetched, rendered, opts = DEFAULT_LIST_OPTS) {
          // Mock the actual network request.
          listMock
            .expects('fetch_')
            .withExactArgs(!!opts.refresh)
            .returns(Promise.resolve(fetched))
            .atLeast(1);

          // If "reset-on-refresh" is set, show loading/placeholder before fetch.
          if (opts.resetOnRefresh) {
            listMock.expects('togglePlaceholder').withExactArgs(true).once();
            listMock
              .expects('toggleLoading')
              .withExactArgs(true, opts.resetOnRefresh)
              .once();
          }

          // Stub the rendering of the template.
          let itemsToRender = fetched[opts.expr];
          if (opts.singleItem) {
            expect(itemsToRender).to.be.a('object');
            itemsToRender = [fetched[opts.expr]];
          } else if (opts.maxItems > 0) {
            itemsToRender = fetched[opts.expr].slice(0, opts.maxItems);
          }
          ssrTemplateHelper.applySsrOrCsrTemplate
            .withArgs(element, itemsToRender)
            .returns(Promise.resolve(rendered));
        }

        function expectRender() {
          // Call mutate before measure during render.
          listMock
            .expects('mutateElement')
            .callsFake((m) => m())
            .atLeast(1);
          listMock
            .expects('measureElement')
            .callsFake((m) => m())
            .atLeast(1);

          // Hide loading/placeholder during render.
          listMock.expects('toggleLoading').withExactArgs(false).atLeast(1);
          listMock.expects('togglePlaceholder').withExactArgs(false).atLeast(1);
        }

        describe('without amp-bind', () => {
          beforeEach(() => {
            setBindService(null);
          });

          it('should fetch and render', () => {
            const itemElem = doc.createElement('div');
            const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA, [
              itemElem,
            ]);
            return list
              .layoutCallback()
              .then(() => rendered)
              .then(() => {
                expect(list.container_.contains(itemElem)).to.be.true;
              });
          });

          it('should reset pending change-size request after render', function* () {
            const itemElement = doc.createElement('div');
            const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA, [
              itemElement,
            ]);
            yield list.layoutCallback();
            yield rendered;
            expect(resource.resetPendingChangeSize).calledOnce;
          });

          it('should attemptChangeHeight placeholder, if present', () => {
            const itemElement = doc.createElement('div');
            const placeholder = doc.createElement('div');
            placeholder.style.height = '1337px';
            element.appendChild(placeholder);
            element.getPlaceholder = () => placeholder;

            expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

            listMock
              .expects('attemptChangeHeight')
              .withExactArgs(1337)
              .returns(Promise.resolve());

            return list.layoutCallback();
          });

          describe('initialized with [layout=container]', () => {
            function expectLockedRender() {
              // Call measureMutate before measure during render.
              listMock
                .expects('measureMutateElement')
                .callsFake((m, n) => {
                  m();
                  n();
                })
                .atLeast(1);
              listMock
                .expects('measureElement')
                .callsFake((m) => m())
                .atLeast(1);

              // Hide loading/placeholder during render.
              listMock.expects('toggleLoading').withExactArgs(false).atLeast(1);
              listMock
                .expects('togglePlaceholder')
                .withExactArgs(false)
                .atLeast(1);
            }

            it('should error without experiment', () => {
              allowConsoleError(() => {
                expect(() => list.isLayoutSupported('container')).to.throw(
                  'Experiment "amp-list-layout-container" is not turned on.'
                );
              });
            });

            describes.repeated(
              'enabled type',
              {
                'with experiment on': {type: 'experiment'},
                'in an AMP4Email document': {type: 'email'},
              },
              (name, variant) => {
                let itemElement;

                beforeEach(() => {
                  if (variant.type === 'experiment') {
                    toggleExperiment(win, 'amp-list-layout-container', true);
                  } else if (variant.type === 'email') {
                    doc.documentElement.setAttribute('amp4email', '');
                  }
                  itemElement = doc.createElement('div');
                  const placeholder = doc.createElement('div');
                  placeholder.style.height = '1337px';
                  element.appendChild(placeholder);
                  element.getPlaceholder = () => placeholder;
                });

                afterEach(() => {
                  if (variant.type === 'experiment') {
                    toggleExperiment(win, 'amp-list-layout-container', false);
                  }
                });

                it('should require placeholder', () => {
                  list.getPlaceholder = () => null;
                  if (variant.type === 'experiment') {
                    allowConsoleError(() => {
                      expect(() =>
                        list.isLayoutSupported('container')
                      ).to.throw(
                        /amp-list\[layout=container\] should have a placeholder/
                      );
                    });
                  } else {
                    expect(() =>
                      list.isLayoutSupported('container')
                    ).to.not.throw(
                      /amp-list\[layout=container\] should have a placeholder/
                    );
                  }
                });

                // TODO(#35361): disabled in #35360
                it.skip('should unlock height for layout=container with successful attemptChangeHeight', () => {
                  expect(list.isLayoutSupported('container')).to.be.true;
                  expect(list.enableManagedResizing_).to.be.true;
                  expectFetch(DEFAULT_FETCHED_DATA, [itemElement]);
                  expectLockedRender();
                  listMock
                    .expects('attemptChangeHeight')
                    .withExactArgs(1337)
                    .returns(Promise.resolve());
                  listMock
                    .expects('maybeResizeListToFitItems_')
                    .returns(Promise.resolve(true));
                  listMock.expects('unlockHeightInsideMutate_').once();
                  return list.layoutCallback();
                });

                // TODO(#35361): disabled in #35379
                it.skip('should not unlock height for layout=container for unsuccessful attemptChangeHeight', () => {
                  expect(list.isLayoutSupported('container')).to.be.true;
                  expect(list.enableManagedResizing_).to.be.true;
                  expectFetch(DEFAULT_FETCHED_DATA, [itemElement]);
                  expectLockedRender();
                  listMock
                    .expects('attemptChangeHeight')
                    .withExactArgs(1337)
                    .returns(Promise.reject(false));
                  listMock
                    .expects('maybeResizeListToFitItems_')
                    .returns(Promise.resolve(false));
                  listMock.expects('unlockHeightInsideMutate_').never();
                  return list.layoutCallback();
                });

                // TODO(#35361): disabled in #35360
                it.skip('should not unlock height for layout=container for null return', () => {
                  expect(list.isLayoutSupported('container')).to.be.true;
                  expect(list.enableManagedResizing_).to.be.true;
                  expectFetch(DEFAULT_FETCHED_DATA, [itemElement]);
                  expectLockedRender();
                  listMock
                    .expects('attemptChangeHeight')
                    .withExactArgs(1337)
                    .returns(Promise.resolve());
                  listMock
                    .expects('maybeResizeListToFitItems_')
                    .returns(Promise.resolve(null));
                  listMock.expects('unlockHeightInsideMutate_').never();
                  return list.layoutCallback();
                });
              }
            );
          });

          // TODO(#35361): disabled in #35360
          it.skip('should attemptChangeHeight rendered contents', () => {
            const itemElement = doc.createElement('div');
            itemElement.style.height = '1337px';

            expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

            listMock
              .expects('attemptChangeHeight')
              .withExactArgs(1337)
              .returns(Promise.resolve());

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(itemElement)).to.be.true;
            });
          });

          it('should fetch and render non-array if single-item is set', () => {
            const fetched = {'items': {title: 'Title1'}};
            const itemElement = doc.createElement('div');
            element.setAttribute('single-item', 'true');

            const rendered = expectFetchAndRender(fetched, [itemElement], {
              expr: 'items',
              singleItem: true,
            });

            return list
              .layoutCallback()
              .then(() => rendered)
              .then(() => {
                expect(list.container_.contains(itemElement)).to.be.true;
              });
          });

          it('should not include `role` attribute if single-item is set', () => {
            const fetched = {'items': {title: 'Title1'}};
            const itemElement = doc.createElement('div');

            // single-item attribute must be set before buildCallback(), so use
            // a new test AmpList instance.
            element = createAmpListElement();
            element.setAttribute('single-item', 'true');
            list = createAmpList(element);

            const rendered = expectFetchAndRender(fetched, [itemElement], {
              expr: 'items',
              singleItem: true,
            });

            return list
              .layoutCallback()
              .then(() => rendered)
              .then(() => {
                expect(list.container_.hasAttribute('role')).to.be.false;
                expect(list.container_.contains(itemElement)).to.be.true;
                expect(list.container_.children.length).to.equal(1);
                expect(list.container_.children[0].hasAttribute('role')).to.be
                  .false;
              });
          });

          it('should trim the results to max-items', () => {
            const fetched = {
              items: [{title: 'Title1'}, {title: 'Title2'}, {title: 'Title3'}],
            };
            const itemElement = doc.createElement('div');
            element.setAttribute('max-items', '2');

            expectFetchAndRender(fetched, [itemElement], {
              expr: 'items',
              maxItems: 2,
            });

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(itemElement)).to.be.true;
            });
          });

          it('should dispatch DOM_UPDATE event after render', () => {
            const spy = env.sandbox.spy(list.container_, 'dispatchEvent');

            const itemElement = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

            return list.layoutCallback().then(() => {
              expect(spy).to.have.been.calledOnce;
              expect(spy).calledWithMatch({
                type: AmpEvents_Enum.DOM_UPDATE,
                bubbles: true,
              });
            });
          });

          it('should resize with viewport', async () => {
            const resize = env.sandbox.spy(list, 'attemptToFit_');
            const itemElement = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);
            await list.layoutCallback();
            list.viewport_.resize_();
            expect(resize).to.be.calledOnce;
          });

          // TODO(choumx, #14772): Flaky.
          it.skip('should only process one result at a time for rendering', () => {
            const doRenderPassSpy = env.sandbox.spy(list, 'doRenderPass_');
            const scheduleRenderSpy = env.sandbox.spy(
              list.renderPass_,
              'schedule'
            );

            const items = [{title: 'foo'}];
            const foo = doc.createElement('div');
            expectFetchAndRender(items, [foo]);
            const layout = list.layoutCallback();

            // Execute another fetch-triggering action immediately (actually on
            // the next tick to avoid losing the layoutCallback() promise resolver).
            Promise.resolve().then(() => {
              element.setAttribute('src', 'https://new.com/list.json');
              list.mutatedAttributesCallback({
                'src': 'https://new.com/list.json',
              });
            });
            // TODO(#14772): this expectation is sometimes not met.
            listMock.expects('toggleLoading').withExactArgs(false).once();
            listMock.expects('togglePlaceholder').withExactArgs(false).once();

            return layout.then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              // Only one render pass should be invoked at a time.
              expect(doRenderPassSpy).to.be.calledOnce;
              // But the next render pass should be scheduled.
              expect(scheduleRenderSpy).to.be.calledTwice;
              expect(scheduleRenderSpy).to.be.calledWith(1);
            });
          });

          it('should refetch if refresh action is called', () => {
            const foo = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo], {
                refresh: true,
                expr: 'items',
              });

              return list.executeAction({
                method: 'refresh',
                satisfiesTrust: () => true,
              });
            });
          });

          it('should reset on refresh if `reset-on-refresh` is set', () => {
            element.setAttribute('reset-on-refresh', '');
            const foo = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              const opts = {refresh: true, resetOnRefresh: true, expr: 'items'};
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo], opts);

              return list.executeAction({
                method: 'refresh',
                satisfiesTrust: () => true,
              });
            });
          });

          it('fetch should resolve if `src` is empty', () => {
            const spy = env.sandbox.spy(list, 'fetchList_');
            element.setAttribute('src', '');
            return list.layoutCallback().then(() => {
              expect(spy).to.be.called;
            });
          });

          it('should fail to load b/c data array is absent', () => {
            expectAsyncConsoleError(/Response must contain an array/, 1);
            listMock.expects('fetch_').returns(Promise.resolve({})).once();
            listMock.expects('toggleLoading').withExactArgs(false).once();
            return expect(list.layoutCallback()).to.eventually.be.rejectedWith(
              /Response must contain an array/
            );
          });

          it('should fail to load b/c data single-item object is absent', () => {
            expectAsyncConsoleError(
              /Response must contain an array or object/,
              1
            );
            element.setAttribute('single-item', 'true');
            listMock.expects('fetch_').returns(Promise.resolve()).once();
            listMock.expects('toggleLoading').withExactArgs(false).once();
            return expect(list.layoutCallback()).to.eventually.be.rejectedWith(
              /Response must contain an array or object/
            );
          });

          it('should load and render with a different root', () => {
            const items = {different: [{title: 'Title1'}]};
            const itemElement = doc.createElement('div');
            element.setAttribute('items', 'different');
            expectFetchAndRender(items, [itemElement], {expr: 'different'});

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(itemElement)).to.be.true;
            });
          });

          it('should set accessibility roles', () => {
            const itemElement = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

            return list.layoutCallback().then(() => {
              expect(list.container_.getAttribute('role')).to.equal('list');
              expect(itemElement.getAttribute('role')).to.equal('listitem');
            });
          });

          it('should preserve accessibility roles', () => {
            element.setAttribute('role', 'list1');
            const itemElement = doc.createElement('div');
            itemElement.setAttribute('role', 'listitem1');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);

            return list.layoutCallback().then(() => {
              expect(list.element.getAttribute('role')).to.equal('list1');
              expect(itemElement.getAttribute('role')).to.equal('listitem1');
            });
          });

          it('should not override or set missing tabindex', () => {
            // A list item with a no tabindex value or tabbable child
            const nonTabbableItemElement = doc.createElement('div');

            // A list item with a pre-set tabindex value
            const tabbableItemElement = doc.createElement('div');
            tabbableItemElement.setAttribute('tabindex', '4');

            // A list item with a tabbable element (<a href>)
            const childTabbableItemElement = doc.createElement('div');
            const childTabbableItemChild = doc.createElement('a');
            childTabbableItemChild.setAttribute('href', 'https://google.com/');
            childTabbableItemElement.appendChild(childTabbableItemChild);

            expectFetchAndRender(DEFAULT_FETCHED_DATA, [
              nonTabbableItemElement,
              tabbableItemElement,
              childTabbableItemElement,
            ]);

            return list.layoutCallback().then(() => {
              expect(nonTabbableItemElement.getAttribute('tabindex')).to.be
                .null;
              expect(tabbableItemElement.getAttribute('tabindex')).to.equal(
                '4'
              );
              expect(childTabbableItemElement.getAttribute('tabindex')).to.be
                .null;
            });
          });

          it('should not show placeholder on fetch failure', function* () {
            // Stub fetch_() to fail.
            listMock.expects('fetch_').returns(Promise.reject()).once();
            listMock.expects('toggleLoading').withExactArgs(false).once();
            listMock.expects('togglePlaceholder').never();

            return list.layoutCallback();
          });

          it('should trigger "fetch-error" event on fetch failure', function* () {
            const actions = {trigger: env.sandbox.spy()};
            env.sandbox.stub(Services, 'actionServiceForDoc').returns(actions);

            // Stub fetch_() to fail.
            listMock.expects('fetch_').returns(Promise.reject()).once();
            listMock.expects('toggleLoading').withExactArgs(false).once();

            yield list.layoutCallback();

            expect(actions.trigger).to.be.calledWithExactly(
              list.element,
              'fetch-error',
              env.sandbox.match.any,
              ActionTrust_Enum.LOW
            );
          });

          describe('DOM diffing with [diffable]', () => {
            const newData = [{}];

            function createAmpImg(src) {
              const img = doc.createElement('amp-img');
              img.setAttribute('src', src);
              // The ignore attribute is normally set by amp-mustache.
              img.setAttribute('i-amphtml-ignore', '');
              img.setAttribute('layout', 'fixed');
              return img;
            }

            async function renderTwice(first, second) {
              const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA, [
                first,
              ]);
              await list.layoutCallback().then(() => rendered);

              ssrTemplateHelper.applySsrOrCsrTemplate
                .withArgs(element, newData)
                .returns(Promise.resolve([second]));
              await list.mutatedAttributesCallback({src: newData});
            }

            beforeEach(() => {
              element.setAttribute('diffable', '');
            });

            it('should keep unchanged elements', async () => {
              const div = doc.createElement('div');
              const newDiv = doc.createElement('div');
              newDiv.setAttribute('class', 'foo');

              await renderTwice(div, newDiv);

              expect(list.container_.contains(div)).to.be.true;
              expect(list.container_.contains(newDiv)).to.be.false;
              // Diff algorithm should copy [class] to original div.
              expect(div.getAttribute('class')).to.equal('foo');
            });

            it('should use i-amphtml-key as a replacement key', async () => {
              const div = doc.createElement('div');
              div.setAttribute('i-amphtml-key', '1');

              const newDiv = doc.createElement('div');
              newDiv.setAttribute('i-amphtml-key', '2');
              newDiv.setAttribute('class', 'foo');

              await renderTwice(div, newDiv);

              expect(list.container_.contains(div)).to.be.false;
              expect(list.container_.contains(newDiv)).to.be.true;
              expect(div.hasAttribute('class')).to.be.false;
            });

            it('should keep amp-img if [src] is the same', async () => {
              const img = createAmpImg('foo.jpg');
              img.setAttribute('style', 'width:10px');
              const newImg = createAmpImg('foo.jpg');
              newImg.setAttribute('class', 'foo');
              newImg.setAttribute('style', 'color:red');
              newImg.setAttribute('should-not', 'be-copied');

              await renderTwice(img, newImg);

              expect(list.container_.contains(img)).to.be.true;
              expect(list.container_.contains(newImg)).to.be.false;
              // Only [class] and [style] should be manually diffed.
              expect(img.classList.contains('foo')).to.be.true;
              expect(img.getAttribute('style')).to.equal(
                'width:10px;color:red'
              );
              // Other attributes will be lost.
              expect(img.hasAttribute('should-not')).to.be.false;
            });

            it('should replace amp-img if [src] changes', async () => {
              const img = createAmpImg('foo.jpg');
              const newImg = createAmpImg('bar.png');

              await renderTwice(img, newImg);

              expect(list.container_.contains(img)).to.be.false;
              expect(list.container_.contains(newImg)).to.be.true;
            });

            // TODO(#35361): disabled in #35360
            it.skip('should attemptChangeHeight initial content', async () => {
              const initialContent = doc.createElement('div');
              initialContent.setAttribute('role', 'list');
              initialContent.setAttribute('style', 'height: 123px');

              // Initial content must be set before buildCallback(), so use
              // a new test AmpList instance.
              element = createAmpListElement();
              element.setAttribute('diffable', '');
              element.style.height = '10px';
              element.appendChild(initialContent);
              doc.body.appendChild(element);

              list = createAmpList(element);
              // Expect attemptChangeHeight() twice: once to resize to initial
              // content, once to resize to rendered contents.
              listMock
                .expects('attemptChangeHeight')
                .withExactArgs(123)
                .returns(Promise.resolve())
                .twice();

              const itemElement = doc.createElement('div');
              itemElement.setAttribute('style', 'height: 123px');
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [itemElement]);
              await list.layoutCallback();
            });

            it('should diff against initial content', async () => {
              const img = createAmpImg('foo.jpg');
              img.setAttribute('class', 'i-amphtml-element');
              const newImg = createAmpImg('foo.jpg'); // Same src.
              newImg.setAttribute('class', 'bar');

              const initialContent = doc.createElement('div');
              initialContent.setAttribute('role', 'list');
              initialContent.appendChild(img);

              // Initial content must be set before buildCallback(), so use
              // a new test AmpList instance.
              element = createAmpListElement();
              element.setAttribute('diffable', '');
              element.appendChild(initialContent);
              list = createAmpList(element);

              const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA, [
                newImg,
              ]);
              await list.layoutCallback().then(() => rendered);

              expect(list.container_.contains(img)).to.be.true;
              expect(list.container_.contains(newImg)).to.be.false;
              // Internal class names should be preserved.
              expect(img.getAttribute('class')).to.equal(
                'i-amphtml-element bar'
              );
            });
          });

          describe('SSR templates', () => {
            beforeEach(() => {
              env.sandbox.stub(ssrTemplateHelper, 'isEnabled').returns(true);
            });

            it('should error if proxied fetch fails', () => {
              env.sandbox
                .stub(ssrTemplateHelper, 'ssr')
                .returns(Promise.reject(new Error('error')));

              listMock.expects('toggleLoading').withExactArgs(false).once();

              return expect(
                list.layoutCallback()
              ).to.eventually.be.rejectedWith(
                /XHR Failed fetching \(https:\/\/data.com\/\.\.\.\): error/
              );
            });

            it('should error if proxied fetch returns invalid data', () => {
              expectAsyncConsoleError(/received no response/, 1);
              env.sandbox
                .stub(ssrTemplateHelper, 'ssr')
                .returns(Promise.resolve(undefined));
              listMock.expects('toggleLoading').withExactArgs(false).once();
              return expect(
                list.layoutCallback()
              ).to.eventually.be.rejectedWith(/received no response/);
            });

            it('should error if proxied fetch returns non-2xx status (error) in the response', () => {
              expectAsyncConsoleError(/received no response/, 1);
              env.sandbox
                .stub(ssrTemplateHelper, 'ssr')
                .returns(Promise.resolve({init: {status: 400}}));
              listMock.expects('toggleLoading').withExactArgs(false).once();
              return expect(
                list.layoutCallback()
              ).to.eventually.be.rejectedWith(
                /fetching JSON data \(https:\/\/data.com\/\.\.\.\): HTTP error 400/
              );
            });

            it('should delegate template rendering to viewer', function* () {
              const rendered = doc.createElement('p');
              const html =
                '<div role="list" class="i-amphtml-fill-content ' +
                'i-amphtml-replaced-content">' +
                '<div role="item">foo</div>' +
                '</div>';
              const listContainer = document.createElement('div');
              listContainer.setAttribute('role', 'list');
              listContainer.setAttribute(
                'class',
                'i-amphtml-fill-content i-amphtml-replace-content'
              );
              const listItem = document.createElement('div');
              listItem.setAttribute('role', 'item');
              listContainer.appendChild(listItem);

              env.sandbox
                .stub(ssrTemplateHelper, 'ssr')
                .returns(Promise.resolve({html}));
              ssrTemplateHelper.applySsrOrCsrTemplate.returns(
                Promise.resolve(rendered)
              );

              listMock
                .expects('updateBindings_')
                .returns(Promise.resolve(listContainer))
                .once();
              const renderSpy = env.sandbox.spy();
              listMock
                .expects('render_')
                .withExactArgs(listContainer, false)
                .callsFake(() => {
                  renderSpy();
                  return Promise.resolve();
                })
                .once();

              const layoutSpy = env.sandbox.spy();
              yield list.layoutCallback().then(() => {
                layoutSpy();
              });
              // layoutCallback() should be chained to render_().
              expect(renderSpy).to.be.calledBefore(layoutSpy);

              const request = env.sandbox.match({
                xhrUrl:
                  'https://data.com/list.json?__amp_source_origin=about%3Asrcdoc',
                fetchOpt: env.sandbox.match({
                  headers: {Accept: 'application/json'},
                  method: 'GET',
                  responseType: 'application/json',
                }),
              });
              const attrs = env.sandbox.match({
                ampListAttributes: env.sandbox.match({
                  items: 'items',
                  maxItems: null,
                  singleItem: false,
                }),
              });
              expect(ssrTemplateHelper.ssr).to.be.calledOnce;
              expect(ssrTemplateHelper.ssr).to.be.calledWithExactly(
                element,
                request,
                null,
                attrs
              );
            });

            it('"amp-state:" uri should skip rendering and emit an error', () => {
              const ampStateEl = doc.createElement('amp-state');
              ampStateEl.setAttribute('id', 'okapis');
              const ampStateJson = doc.createElement('script');
              ampStateJson.setAttribute('type', 'application/json');
              ampStateEl.appendChild(ampStateJson);
              doc.body.appendChild(ampStateEl);
              list.element.setAttribute('src', 'amp-state:okapis');

              listMock.expects('scheduleRender_').never();

              const errorMsg = /cannot be used in SSR mode/;
              expectAsyncConsoleError(errorMsg);
              expect(list.layoutCallback()).eventually.rejectedWith(errorMsg);
            });

            it('"amp-script:" uri should skip rendering and emit an error', () => {
              list.element.setAttribute('src', 'amp-script:fetchData');

              listMock.expects('scheduleRender_').never();

              const errorMsg = /cannot be used in SSR mode/;
              expectAsyncConsoleError(errorMsg);
              expect(list.layoutCallback()).eventually.rejectedWith(errorMsg);
            });

            it('Bound [src] should skip rendering and emit an error', async () => {
              listMock.expects('scheduleRender_').never();
              allowConsoleError(async () => {
                await list.mutatedAttributesCallback({src: {}});
              });
            });
          });

          // TODO(aghassemi, #12476): Make this test work with sinon 4.0.
          describe.skip('with fallback', () => {
            beforeEach(() => {
              // Stub getFallback() with fake truthy value.
              listMock.expects('getFallback').returns(true);
              // Stub getVsync().mutate() to execute immediately.
              listMock
                .expects('getVsync')
                .returns({
                  measure: () => {},
                  mutate: (block) => block(),
                })
                .atLeast(1);
            });

            it('should hide fallback element on fetch success', () => {
              // Stub fetch and render to succeed.
              listMock.expects('fetch_').returns(Promise.resolve([])).once();
              templates.findAndRenderTemplate.returns(Promise.resolve([]));
              // Act as if a fallback is already displayed.
              env.sandbox.stub(list, 'fallbackDisplayed_').callsFake(true);

              listMock.expects('togglePlaceholder').never();
              listMock.expects('toggleFallback').withExactArgs(false).once();
              return list.layoutCallback().catch(() => {});
            });

            it('should hide placeholder and show fallback on fetch failure', () => {
              // Stub fetch_() to fail.
              listMock.expects('fetch_').returns(Promise.reject()).once();

              listMock.expects('togglePlaceholder').withExactArgs(false).once();
              listMock.expects('toggleFallback').withExactArgs(true).once();
              return list.layoutCallback().catch(() => {});
            });
          });

          describe('Using amp-script: protocol', () => {
            let ampScriptEl;
            beforeEach(() => {
              resetExperimentTogglesForTesting(win);

              env.sandbox
                .stub(Services, 'scriptForDocOrNull')
                .returns(Promise.resolve(new AmpScriptService(env.ampdoc)));
              ampScriptEl = document.createElement('amp-script');
              ampScriptEl.setAttribute('id', 'example');
              doc.body.appendChild(ampScriptEl);

              element = createAmpListElement();
              element.setAttribute('src', 'amp-script:example.fetchData');
              element.toggleLoading = () => {};
              list = createAmpList(element);
            });

            it('should throw an error if given an invalid format', async () => {
              const errorMsg = /URIs must be of the format/;

              element.setAttribute('src', 'amp-script:fetchData');
              expectAsyncConsoleError(errorMsg);
              expect(list.layoutCallback()).to.eventually.throw(errorMsg);

              element.setAttribute('src', 'amp-script:too.many.dots');
              expectAsyncConsoleError(errorMsg);
              expect(list.layoutCallback()).to.eventually.throw(errorMsg);

              element.setAttribute('src', 'amp-script:zeroLengthSecondArg.');
              expectAsyncConsoleError(errorMsg);
              expect(list.layoutCallback()).to.eventually.throw(errorMsg);
            });

            it('should throw if specified amp-script does not exist', () => {
              element.setAttribute('src', 'amp-script:doesnotexist.fn');

              const errorMsg = /could not find <amp-script> with/;
              expectAsyncConsoleError(errorMsg);
              expect(list.layoutCallback()).to.eventually.throw(errorMsg);
            });

            it('should fail if function call rejects', async () => {
              ampScriptEl.getImpl = () =>
                Promise.resolve({
                  callFunction: () =>
                    Promise.reject('Invalid function identifier.'),
                });

              listMock.expects('toggleLoading').withExactArgs(false).once();
              return expect(
                list.layoutCallback()
              ).to.eventually.be.rejectedWith(/Invalid function identifier/);
            });

            it('should render non-array if single-item is set', async () => {
              const callFunctionResult = {'items': {title: 'Title'}};
              element.setAttribute('single-item', 'true');
              ampScriptEl.getImpl = () =>
                Promise.resolve({
                  callFunction(fnId) {
                    if (fnId === 'fetchData') {
                      return Promise.resolve(callFunctionResult);
                    }
                    return Promise.reject(new Error(`Invalid fnId: ${fnId}`));
                  },
                });

              listMock
                .expects('scheduleRender_')
                .withExactArgs(
                  [{title: 'Title'}],
                  /*append*/ false,
                  callFunctionResult
                )
                .returns(Promise.resolve())
                .once();

              await list.layoutCallback();
            });

            it('should render a list from AmpScriptService provided data', async () => {
              ampScriptEl.getImpl = () =>
                Promise.resolve({
                  callFunction(fnId) {
                    if (fnId === 'fetchData') {
                      return Promise.resolve({items: [3, 2, 1]});
                    }
                    return Promise.reject(new Error(`Invalid fnId: ${fnId}`));
                  },
                });

              listMock
                .expects('scheduleRender_')
                .withExactArgs([3, 2, 1], /*append*/ false, {items: [3, 2, 1]})
                .returns(Promise.resolve())
                .once();

              await list.layoutCallback();
            });
          });
        }); // without amp-bind

        describe('with amp-bind', () => {
          let bind;

          beforeEach(() => {
            bind = {
              rescan: env.sandbox.stub().returns(Promise.resolve()),
              signals: () => {
                return {get: (unusedName) => false};
              },
              getState: () => ({}),
            };
            setBindService(bind);
          });

          it('should not fetch if [src] mutates with URL (before layout)', () => {
            // Not allowed before layout.
            listMock.expects('fetchList_').never();

            element.setAttribute('src', 'https://new.com/list.json');
            list.mutatedAttributesCallback({
              'src': 'https://new.com/list.json',
            });
            expect(element.getAttribute('src')).to.equal(
              'https://new.com/list.json'
            );
          });

          // Unlike [src] mutations with URLs, local data mutations should
          // always render immediately.
          it('should render if [src] mutates with data (before layout)', async () => {
            listMock.expects('scheduleRender_').once();

            element.setAttribute('src', 'https://new.com/list.json');
            await list.mutatedAttributesCallback({'src': [{title: 'Title1'}]});
            // `src` attribute should still be set to empty string.
            expect(element.getAttribute('src')).to.equal('');
          });

          it('should not render if [src] has changed since the fetch was initiated', async () => {
            const foo = doc.createElement('div');
            const bar = doc.createElement('div');

            // firstPromise won't resolve until the render triggered by secondPromise completes.
            let resolveFirstPromise;
            const firstPromise = new Promise((resolve) => {
              resolveFirstPromise = () => resolve({items: [foo]});
            });
            const secondPromise = Promise.resolve({items: [bar]});

            listMock
              .expects('fetch_')
              .onFirstCall()
              .returns(firstPromise)
              .onSecondCall()
              .returns(secondPromise)
              .twice();

            // Even though there are two fetches, the render associated with
            // the first one should be cancelled due to an outdated src.
            listMock
              .expects('scheduleRender_')
              .withArgs([bar])
              .returns(Promise.resolve())
              .once();

            element.setAttribute('src', 'https://foo.com/list.json');
            const layout1Promise = list.layoutCallback();

            element.setAttribute('src', 'https://bar.com/list.json');
            const layout2Promise = list.layoutCallback();
            layout2Promise.then(() => resolveFirstPromise());

            await Promise.all([layout1Promise, layout2Promise]);
          });

          it('should render if [src] mutates with data', () => {
            const foo = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              listMock.expects('fetchList_').never();
              // Expect hiding of placeholder/loading after render.
              listMock.expects('togglePlaceholder').withExactArgs(false).once();
              listMock.expects('toggleLoading').withExactArgs(false).once();

              element.setAttribute('src', 'https://new.com/list.json');
              list.mutatedAttributesCallback({'src': [{title: 'Title1'}]});
              expect(element.getAttribute('src')).to.equal('');
            });
          });

          it('should reset if `reset-on-refresh` is set (new URL)', () => {
            element.setAttribute('reset-on-refresh', '');
            const foo = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo], {
                resetOnRefresh: true,
              });
              element.setAttribute('src', 'https://new.com/list.json');
              list.mutatedAttributesCallback({
                'src': 'https://new.com/list.json',
              });
            });
          });

          it('should clear old bindings when resetting', () => {
            element.setAttribute('reset-on-refresh', '');
            const foo = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo], {
                resetOnRefresh: true,
              });
              element.setAttribute('src', 'https://new.com/list.json');
              list.mutatedAttributesCallback({
                'src': 'https://new.com/list.json',
              });

              expect(bind.rescan).to.be.calledOnce;
              expect(bind.rescan).to.be.calledWith([], env.sandbox.match.array);
            });
          });

          it('should not reset if `reset-on-refresh=""` (new data)', () => {
            element.setAttribute('reset-on-refresh', '');
            const foo = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              listMock.expects('fetchList_').never();
              // Expect hiding of placeholder/loading after render.
              listMock.expects('togglePlaceholder').withExactArgs(false).once();
              listMock.expects('toggleLoading').withExactArgs(false).once();

              element.setAttribute('src', 'https://new.com/list.json');
              list.mutatedAttributesCallback({'src': DEFAULT_ITEMS});
            });
          });

          it('should reset if `reset-on-refresh="always"` (new data)', () => {
            element.setAttribute('reset-on-refresh', 'always');
            const foo = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              listMock.expects('fetchList_').never();
              // Expect display of placeholder/loading before render.
              listMock.expects('togglePlaceholder').withExactArgs(true).once();
              listMock
                .expects('toggleLoading')
                .withExactArgs(true, true)
                .once();
              // Expect hiding of placeholder/loading after render.
              listMock.expects('togglePlaceholder').withExactArgs(false).once();
              listMock.expects('toggleLoading').withExactArgs(false).once();

              element.setAttribute('src', 'https://new.com/list.json');
              list.mutatedAttributesCallback({'src': DEFAULT_ITEMS});
            });
          });

          it('should refetch if [src] attribute changes (after layout)', () => {
            const foo = doc.createElement('div');
            expectFetchAndRender(DEFAULT_FETCHED_DATA, [foo]);

            return list.layoutCallback().then(() => {
              expect(list.container_.contains(foo)).to.be.true;

              // Allowed post-layout.
              listMock.expects('fetchList_').once();

              element.setAttribute('src', 'https://new.com/list.json');
              list.mutatedAttributesCallback({
                'src': 'https://new.com/list.json',
              });
            });
          });

          describe('no `binding` attribute', () => {
            it('should rescan()', async () => {
              const child = doc.createElement('div');
              child.setAttribute('i-amphtml-binding', '');
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [child]);
              await list.layoutCallback();
              expect(bind.rescan).to.have.been.calledOnce;
              expect(bind.rescan).calledWithExactly(
                [child],
                [list.container_],
                {update: true, fast: true}
              );
            });

            it('should not rescan() if new children have no bindings', async () => {
              const child = doc.createElement('div');
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [child]);
              await list.layoutCallback();
              expect(bind.rescan).to.not.be.called;
            });
          });

          describe('binding="always"', () => {
            beforeEach(() => {
              element.setAttribute('binding', 'always');
            });

            it('should rescan()', async () => {
              const child = doc.createElement('div');
              child.setAttribute('i-amphtml-binding', '');
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [child]);
              await list.layoutCallback();
              expect(bind.rescan).to.have.been.calledOnce;
              expect(bind.rescan).calledWithExactly(
                [child],
                [list.container_],
                {update: true, fast: true}
              );
            });
          });

          describe('binding="refresh"', () => {
            beforeEach(() => {
              element.setAttribute('binding', 'refresh');
            });

            it('should rescan() with {update: false} before FIRST_MUTATE', async () => {
              const child = doc.createElement('div');
              child.setAttribute('i-amphtml-binding', '');
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [child]);
              await list.layoutCallback();
              expect(bind.rescan).to.have.been.calledOnce;
              expect(bind.rescan).calledWithExactly([child], [], {
                update: false,
                fast: true,
              });
            });

            it('should rescan() with {update: true} after FIRST_MUTATE', async () => {
              bind.signals = () => {
                return {get: (name) => name === 'FIRST_MUTATE'};
              };
              const child = doc.createElement('div');
              child.setAttribute('i-amphtml-binding', '');
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [child]);
              await list.layoutCallback();
              expect(bind.rescan).to.have.been.calledOnce;
              expect(bind.rescan).calledWithExactly(
                [child],
                [list.container_],
                {
                  update: true,
                  fast: true,
                }
              );
            });
          });

          describe('binding="refresh-evaluate"', () => {
            beforeEach(() => {
              element.setAttribute('binding', 'refresh-evaluate');
            });

            it('should rescan() with {update: "evaluate"} before FIRST_MUTATE', async () => {
              const child = doc.createElement('div');
              child.setAttribute('i-amphtml-binding', '');
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [child]);
              await list.layoutCallback();
              expect(bind.rescan).to.have.been.calledOnce;
              expect(bind.rescan).calledWithExactly([child], [], {
                update: 'evaluate',
                fast: true,
              });
            });

            it('should rescan() with {update: true} after FIRST_MUTATE', async () => {
              bind.signals = () => {
                return {get: (name) => name === 'FIRST_MUTATE'};
              };
              const child = doc.createElement('div');
              child.setAttribute('i-amphtml-binding', '');
              expectFetchAndRender(DEFAULT_FETCHED_DATA, [child]);
              await list.layoutCallback();
              expect(bind.rescan).to.have.been.calledOnce;
              expect(bind.rescan).calledWithExactly(
                [child],
                [list.container_],
                {
                  update: true,
                  fast: true,
                }
              );
            });

            describe('rescan vs. diff race', () => {
              async function rescanVsDiffTest() {
                env.sandbox.spy(list, 'diff_');
                env.sandbox.spy(list, 'render_');

                // Diffing is skipped if there's no existing children to diff against.
                const oldChild = doc.createElement('p');
                oldChild.textContent = 'foo';
                list.container_.appendChild(oldChild);

                const newChild = doc.createElement('p');
                newChild.textContent = 'bar';
                // New children must have at least one binding to trigger rescan.
                newChild.setAttribute('i-amphtml-binding', '');
                const rendered = expectFetchAndRender(DEFAULT_FETCHED_DATA, [
                  newChild,
                ]);
                await list.layoutCallback().then(() => rendered);
              }

              it('without diffing, should rescan _before_ render', async () => {
                await rescanVsDiffTest();

                expect(list.diff_).to.not.have.been.called;
                expect(bind.rescan).to.have.been.calledOnce;

                // Without diffable, rescan should happen before rendering the new children.
                expect(bind.rescan).calledBefore(list.render_);
              });

              it('with diffing, should rescan _after_ render/diff', async () => {
                element.setAttribute('diffable', '');

                await rescanVsDiffTest();

                expect(list.diff_).to.have.been.calledOnce;
                expect(bind.rescan).to.have.been.calledOnce;

                // With diffable, rescanning must happen after rendering (diffing) the new children.
                expect(bind.rescan).calledAfter(list.render_);
                expect(bind.rescan).calledAfter(list.diff_);
              });
            });
          });

          describe('binding="no"', () => {
            beforeEach(() => {
              element.setAttribute('binding', 'no');
            });

            it('should not rescan()', async () => {
              const output = [doc.createElement('div')];
              expectFetchAndRender(DEFAULT_FETCHED_DATA, output);
              await list.layoutCallback();
              expect(bind.rescan).to.not.have.been.called;
            });
          });

          describe('Using amp-state: protocol', () => {
            beforeEach(() => {
              element = createAmpListElement();
              element.setAttribute('src', 'amp-state:okapis');
              element.toggleLoading = () => {};
              list = createAmpList(element);
            });

            it('should throw error if there is no associated amp-state el', async () => {
              bind.getStateAsync = () => Promise.reject();

              const errorMsg = /element with id 'okapis' was not found/;
              expectAsyncConsoleError(errorMsg);
              expect(list.layoutCallback()).to.eventually.throw(errorMsg);
            });

            it('should log an error if amp-bind was not included', async () => {
              Services.bindForDocOrNull.returns(Promise.resolve(null));

              const ampStateEl = doc.createElement('amp-state');
              ampStateEl.setAttribute('id', 'okapis');
              const ampStateJson = doc.createElement('script');
              ampStateJson.setAttribute('type', 'application/json');
              ampStateEl.appendChild(ampStateJson);
              doc.body.appendChild(ampStateEl);

              const errorMsg = /bind to be installed/;
              expectAsyncConsoleError(errorMsg);
              expect(list.layoutCallback()).eventually.rejectedWith(errorMsg);
            });

            it('should render a list using local data', async () => {
              bind.getStateAsync = () => Promise.resolve({items: [1, 2, 3]});

              const ampStateEl = doc.createElement('amp-state');
              ampStateEl.setAttribute('id', 'okapis');
              const ampStateJson = doc.createElement('script');
              ampStateJson.setAttribute('type', 'application/json');
              ampStateEl.appendChild(ampStateJson);
              doc.body.appendChild(ampStateEl);

              listMock
                .expects('scheduleRender_')
                .withExactArgs([1, 2, 3], /*append*/ false, {items: [1, 2, 3]})
                .returns(Promise.resolve())
                .once();

              await list.layoutCallback();
            });

            it('should render a list using async data', async () => {
              const {promise, resolve} = new Deferred();
              bind.getStateAsync = () => promise;

              const ampStateEl = doc.createElement('amp-state');
              ampStateEl.setAttribute('id', 'okapis');
              const ampStateJson = doc.createElement('script');
              ampStateJson.setAttribute('type', 'application/json');
              ampStateEl.appendChild(ampStateJson);
              doc.body.appendChild(ampStateEl);

              listMock
                .expects('scheduleRender_')
                .withExactArgs([1, 2, 3], /*append*/ false, {items: [1, 2, 3]})
                .returns(Promise.resolve())
                .once();

              const layoutPromise = list.layoutCallback();
              resolve({items: [1, 2, 3]});
              await layoutPromise;
            });
          });
        }); // with amp-bind
      }
    );
  }
);

describes.realWin(
  'amp-list component with runtime on',
  {
    amp: {
      extensions: ['amp-list'],
      runtimeOn: true,
    },
  },
  (env) => {
    it('should allow default actions in email documents', async () => {
      env.win.document.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, env.win.document);

      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);
      const element = createElementWithAttributes(
        env.win.document,
        'amp-list',
        {
          'width': '300',
          'height': '100',
          'src': 'https://data.com/list.json',
        }
      );
      env.win.document.body.appendChild(element);
      env.sandbox.spy(element, 'enqueAction');
      env.sandbox.stub(element, 'getDefaultActionAlias').returns({'items': []});
      await whenUpgradedToCustomElement(element);
      const impl = await element.getImpl(false);
      env.sandbox.stub(impl, 'fetchList_');

      ['changeToLayoutContainer', 'refresh'].forEach((method) => {
        action.execute(
          element,
          method,
          null,
          'source',
          'caller',
          'event',
          ActionTrust_Enum.HIGH
        );
        expect(element.enqueAction).to.be.calledWith(
          env.sandbox.match({
            actionEventType: '?',
            args: null,
            caller: 'caller',
            event: 'event',
            method,
            node: element,
            source: 'source',
            trust: ActionTrust_Enum.HIGH,
          })
        );
      });
    });
  }
);
