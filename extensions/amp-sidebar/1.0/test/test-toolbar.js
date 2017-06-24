
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
 import {timerFor} from '../../../../src/services';
 import {toggleExperiment} from '../../../../src/experiments';
 import * as sinon from 'sinon';
 import '../amp-sidebar';

 /** @const */
 const DEFAULT_TOOLBAR_MEDIA = '(min-width: 768px)';

 /** @const */
 const TOOLBAR_CLASS = 'i-amphtml-toolbar';


 adopt(window);

 describes.realWin('amp-sidebar 1.0 version - toolbar', {
   win: { /* window spec */
     location: '...',
     historyOff: false,
   },
   amp: { /* amp spec */
     runtimeOn: false,
     extensions: ['amp-sidebar:1.0'],
   },
 }, () => {
   describe('amp-sidebar - toolbar', () => {
     let sandbox;
     let timer;

     function getAmpSidebar(options) {
       options = options || {};
       return createIframePromise().then(iframe => {
         const ampSidebar = iframe.doc.createElement('amp-sidebar');
         if (options.toolbars) {
           // Stub our sidebar operations, doing this here as it will
           // Ease testing our media queries
           const impl = ampSidebar.implementation_;
           sandbox.stub(impl.vsync_,
               'mutate', callback => {
                 callback();
               });
           sandbox.stub(impl.vsync_,
               'mutatePromise', callback => {
                 callback();
                 return Promise.resolve();
               });
           // Create our individual toolbars
           options.toolbars.forEach(toolbar => {
             const navToolbar = iframe.doc.createElement('nav');
             if (toolbar.media) {
               navToolbar.setAttribute('toolbar', toolbar.media);
             } else {
               navToolbar.setAttribute('toolbar', DEFAULT_TOOLBAR_MEDIA);
             }
             if (toolbar.toolbarOnlyOnNav) {
               navToolbar.setAttribute('toolbar-only', 'true');
             }
             const toolbarList = iframe.doc.createElement('ul');
             for (let i = 0; i < 3; i++) {
               const li = iframe.doc.createElement('li');
               li.innerHTML = 'Toolbar item ' + i;
               toolbarList.appendChild(li);
             }
             navToolbar.appendChild(toolbarList);
             ampSidebar.appendChild(navToolbar);
           });
         }
         ampSidebar.setAttribute('id', 'sidebar1');
         ampSidebar.setAttribute('layout', 'nodisplay');
         return iframe.addElement(ampSidebar).then(() => {
           timer = timerFor(iframe.win);
           if (options.toolbars) {
             sandbox.stub(timer, 'delay', function(callback) {
               callback();
             });
           }
           return {iframe, ampSidebar};
         });
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
       toggleExperiment(window, 'amp-sidebar 1.0', true);
     });

     afterEach(() => {
       sandbox.restore();
     });

     it('toolbar header should be hidden for a \
     invalid window size for DEFAULT_TOOLBAR_MEDIA', () => {
       return getAmpSidebar({
         toolbars: [true],
       }).then(obj => {
         const sidebarElement = obj.ampSidebar;
         const toolbarElements = Array.prototype
                .slice.call(sidebarElement.ownerDocument
                .getElementsByClassName(TOOLBAR_CLASS), 0);
         resizeIframeToWidth(obj.iframe, '1px', () => {
           expect(toolbarElements.length).to.be.above(0);
           sidebarElement.implementation_.toolbars_.forEach(toolbar => {
             toolbar.onLayoutChange();
           });
           expect(toolbarElements[0].parentElement.style.display)
               .to.be.equal('none');
         });
       });
     });

     it('toolbar header should be shown for a \
     valid window size for DEFAULT_TOOLBAR_MEDIA', () => {
       return getAmpSidebar({
         toolbars: [true],
       }).then(obj => {
         const sidebarElement = obj.ampSidebar;
         const toolbarElements = Array.prototype
                .slice.call(sidebarElement.ownerDocument
                .getElementsByClassName(TOOLBAR_CLASS), 0);
         resizeIframeToWidth(obj.iframe, '4000px', () => {
           expect(toolbarElements.length).to.be.above(0);
           sidebarElement.implementation_.toolbars_.forEach(toolbar => {
             toolbar.onLayoutChange();
           });
           expect(toolbarElements[0].parentElement.style.display)
               .to.be.equal('');
         });
       });
     });

     it('should hide <nav toolbar> elements with toolbar-only, \
     inside the sidebar, but not inside the toolbar, for a valid \
     window size for DEFAULT_TOOLBAR_MEDIA', () => {
       return getAmpSidebar({
         toolbars: [{
           toolbarOnlyOnNav: true,
         }],
       }).then(obj => {
         const sidebarElement = obj.ampSidebar;
         const toolbars = sidebarElement.implementation_.toolbars_;
         resizeIframeToWidth(obj.iframe, '4000px', () => {
           toolbars.forEach(toolbar => {
             toolbar.onLayoutChange();
           });
           const toolbarNavElements = Array.prototype
                  .slice.call(sidebarElement.ownerDocument
                  .querySelectorAll('nav[toolbar]'), 0);
           const hiddenToolbarNavElements = Array.prototype
                  .slice.call(sidebarElement.ownerDocument
                  .querySelectorAll('nav[style]'), 0);
           expect(toolbarNavElements.length).to.be.equal(2);
           expect(hiddenToolbarNavElements.length).to.be.equal(1);
           expect(toolbars.length).to.be.equal(1);
         });
       });
     });

     it('toolbar should be in the hidden state \
     when it is not being displayed', () => {
       return getAmpSidebar({
         toolbars: [true],
       }).then(obj => {
         const toolbars = obj.ampSidebar.implementation_.toolbars_;
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
       return getAmpSidebar({
         toolbars: [true],
       }).then(obj => {
         const toolbars = obj.ampSidebar.implementation_.toolbars_;
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
       return getAmpSidebar({
         toolbars: [true],
       }).then(obj => {
         const toolbars = obj.ampSidebar.implementation_.toolbars_;
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
       return getAmpSidebar({
         toolbars: [true],
       }).then(obj => {
         const toolbars = obj.ampSidebar.implementation_.toolbars_;
         resizeIframeToWidth(obj.iframe, '1px', () => {
           toolbars.forEach(toolbar => {
             toolbar.onLayoutChange();
             expect(toolbar).to.exist;
           });
         });
       });
     });
   });
 });
