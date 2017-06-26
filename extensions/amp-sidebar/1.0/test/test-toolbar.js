
/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

 import {adopt} from '../../../../src/runtime';
 import {createIframePromise} from '../../../../testing/iframe';
 import {timerFor, vsyncFor} from '../../../../src/services';
 import * as sinon from 'sinon';
 import {Toolbar} from '../toolbar';

 /** @const */
 const DEFAULT_TOOLBAR_MEDIA = '(min-width: 768px)';

 /** @const */
 const TOOLBAR_CLASS = 'i-amphtml-toolbar';


 adopt(window);

 describe('amp-sidebar - toolbar', () => {
   let sandbox;
   let timer;
   let vsync;

   function getToolbars(options) {
     options = options || {};
     return createIframePromise().then(iframe => {
       const toolbarContainerElement = iframe.doc.createElement('div');
       const toolbars = [];
       iframe.win.document.body.appendChild(toolbarContainerElement);
       vsync = vsyncFor(iframe.win);
       timer = timerFor(iframe.win);
       // Stub our toolbar operations, doing this here as it will
       // Ease testing our media queries
       sandbox.stub(vsync,
           'mutate', callback => {
             callback();
           });
       sandbox.stub(vsync,
           'mutatePromise', callback => {
             callback();
             return Promise.resolve();
           });
       sandbox.stub(timer, 'delay', function(callback) {
         callback();
       });

       // Create our individual toolbars
       options.forEach(toolbarObj => {
         const navToolbar = iframe.doc.createElement('nav');
         if (toolbarObj.media) {
           navToolbar.setAttribute('toolbar', toolbar.media);
         } else {
           navToolbar.setAttribute('toolbar', DEFAULT_TOOLBAR_MEDIA);
         }
         if (toolbarObj.toolbarOnlyOnNav) {
           navToolbar.setAttribute('toolbar-only', '');
         }
         const toolbarList = iframe.doc.createElement('ul');
         for (let i = 0; i < 3; i++) {
           const li = iframe.doc.createElement('li');
           li.innerHTML = 'Toolbar item ' + i;
           toolbarList.appendChild(li);
         }
         navToolbar.appendChild(toolbarList);
         toolbarContainerElement.appendChild(navToolbar);
         const toolbar = new Toolbar(navToolbar, iframe.win, vsync);
         toolbarContainerElement.appendChild(toolbar.build());
         toolbars.push(toolbar);
       });

       return {iframe, toolbarContainerElement, toolbars};
     });
   }

   function resizeIframeToWidth(iframeObject, width, callback) {
     iframeObject.iframe.setAttribute('width', width);
     // Force the browser to re-draw
     iframeObject.win.innerWidth;
     callback();
   }

   beforeEach(() => {
     sandbox = sinon.sandbox.create();
   });

   afterEach(() => {
     sandbox.restore();
   });

   it('toolbar header should be hidden for a \
   non-matching window size for DEFAULT_TOOLBAR_MEDIA', () => {
     return getToolbars([{}]).then(obj => {
       const toolbars = obj.toolbars;
       const toolbarElements = Array.prototype
              .slice.call(obj.toolbarContainerElement.ownerDocument
              .getElementsByClassName(TOOLBAR_CLASS), 0);
       resizeIframeToWidth(obj.iframe, '1px', () => {
         expect(toolbarElements.length).to.be.above(0);
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         expect(toolbarElements[0].parentElement.style.display)
             .to.be.equal('none');
       });
     });
   });

   it('toolbar header should be shown for a \
   matching window size for DEFAULT_TOOLBAR_MEDIA', () => {
     return getToolbars([{}]).then(obj => {
       const toolbars = obj.toolbars;
       const toolbarElements = Array.prototype
              .slice.call(obj.toolbarContainerElement
              .getElementsByClassName(TOOLBAR_CLASS), 0);
       resizeIframeToWidth(obj.iframe, '4000px', () => {
         expect(toolbarElements.length).to.be.above(0);
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         expect(toolbarElements[0].parentElement.style.display)
             .to.be.equal('');
       });
     });
   });

   it('should hide <nav toolbar> elements with toolbar-only, \
   inside the sidebar, but not inside the toolbar, for a matching \
   window size for DEFAULT_TOOLBAR_MEDIA', () => {
     return getToolbars([{
       toolbarOnlyOnNav: true,
     }]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '4000px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         const toolbarNavElements = Array.prototype
                .slice.call(obj.toolbarContainerElement.ownerDocument
                .querySelectorAll('nav[toolbar]'), 0);
         const hiddenToolbarNavElements = Array.prototype
                .slice.call(obj.toolbarContainerElement.ownerDocument
                .querySelectorAll('nav[style]'), 0);
         expect(toolbarNavElements.length).to.be.equal(2);
         expect(hiddenToolbarNavElements.length).to.be.equal(1);
         expect(toolbars.length).to.be.equal(1);
       });
     });
   });

   it('toolbar should be in the hidden state \
   when it is not being displayed', () => {
     return getToolbars([{}]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '1px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
           expect(toolbar.isToolbarShown_()).to.be.false;
         });
       });
     });
   });

   it('toolbar should be in the shown state \
   when it is being displayed', () => {
     return getToolbars([{}]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '4000px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
           expect(toolbar.isToolbarShown_()).to.be.true;
         });
       });
     });
   });

   it('toolbar should not be able to be shown \
   if already in the shown state', () => {
     return getToolbars([{}]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '4000px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
           expect(toolbar.attemptShow_()).to.be.undefined;
         });
       });
     });
   });

   it('toolbar should be able to be shown \
   if not in the shown state, and return a promise', () => {
     return getToolbars([{}]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '1px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
           expect(toolbar).to.exist;
         });
       });
     });
   });
 });
