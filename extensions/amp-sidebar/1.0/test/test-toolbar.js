
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
 import {Services} from '../../../../src/services';
 import {toArray} from '../../../../src/types';
 import * as sinon from 'sinon';
 import {Toolbar} from '../toolbar';

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
       vsync = Services.vsyncFor(iframe.win);
       timer = Services.timerFor(iframe.win);
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
           navToolbar.setAttribute('toolbar', '(min-width: 768px)');
         }
         if (toolbarObj.toolbarOnlyOnNav) {
           navToolbar.setAttribute('toolbar-only', '');
         }
         const toolbarTarget = iframe.doc.createElement('div');
         if (toolbarObj.toolbarTarget) {
           toolbarTarget.setAttribute('id', toolbarObj.toolbarTarget);
           navToolbar.setAttribute('toolbar-target', toolbarObj.toolbarTarget);
         } else if (toolbarObj.toolbarTargetError) {
           navToolbar.setAttribute('target', 'toolbar-target');
         } else {
           toolbarTarget.setAttribute('id', 'toolbar-target');
           navToolbar.setAttribute('toolbar-target', 'toolbar-target');
         }
         iframe.win.document.body.appendChild(toolbarTarget);
         const toolbarList = iframe.doc.createElement('ul');
         for (let i = 0; i < 3; i++) {
           const li = iframe.doc.createElement('li');
           li.innerHTML = 'Toolbar item ' + i;
           toolbarList.appendChild(li);
         }
         navToolbar.appendChild(toolbarList);
         toolbarContainerElement.appendChild(navToolbar);
         toolbars.push(new Toolbar(navToolbar, iframe.win, vsync));
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

   it('toolbar header should error if target element \
   could not be found as it is required.', () => {
     return getToolbars([{
       targetError: true,
     }]).then(() => {
       expect(false).to.be.equal(true, 'Toolbar \
       should not be created when the target element is not found');
     }).catch(() => {
       expect(true).to.be.ok;
     });
   });

   it('toolbar header should be hidden for a \
   non-matching window size for (min-width: 768px)', () => {
     return getToolbars([{}]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '1024px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         const toolbarElements =
                toArray(obj.toolbarContainerElement.ownerDocument
                .getElementsByClassName('i-amphtml-toolbar'));
         resizeIframeToWidth(obj.iframe, '1px', () => {
           toolbars.forEach(toolbar => {
             toolbar.onLayoutChange();
           });
           expect(toolbarElements.length).to.be.above(0);
           expect(toolbarElements[0].parentElement.style.display)
               .to.be.equal('none');
         });
       });
     });
   });

   it('toolbar header should be shown for a \
   matching window size for (min-width: 768px)', () => {
     return getToolbars([{}]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '4000px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         const toolbarElements =
                toArray(obj.toolbarContainerElement.ownerDocument
                .getElementsByClassName('i-amphtml-toolbar'));
         expect(toolbarElements.length).to.be.above(0);
         expect(toolbarElements[0].parentElement.style.display)
             .to.be.equal('');
       });
     });
   });

   it('toolbar should be placed into a target, with the \
   target attrbiute', () => {
     const targetId = 'toolbar-target';
     return getToolbars([{
       'toolbar-target': targetId,
     }]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '1024px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         const toolbarTargetElements =
                toArray(obj.iframe.win.document.body
                .querySelectorAll(`#${targetId} > nav[toolbar][target]`));
         expect(toolbars.length).to.be.equal(1);
         expect(toolbarTargetElements.length).to.be.equal(1);
       });
     });
   });

   it('toolbar should be placed into a target, and shown for a \
   matching window size for (min-width: 768px)', () => {
     const targetId = 'toolbar-target';
     return getToolbars([{
       'toolbar-target': targetId,
     }]).then(obj => {
       const toolbars = obj.toolbars;
       const toolbarTargets =
                toArray(obj.iframe.win.document.body
               .querySelectorAll(`#${targetId}`));
       resizeIframeToWidth(obj.iframe, '4000px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         expect(toolbars.length).to.be.equal(1);
         expect(toolbarTargets.length).to.be.equal(1);
         expect(toolbarTargets[0].style.display)
             .to.be.equal('');
       });
     });
   });

   it('toolbar should be placed into a target, and hidden for a \
   non-matching window size for (min-width: 768px)', () => {
     const targetId = 'toolbar-target';
     return getToolbars([{
       'toolbar-target': targetId,
     }]).then(obj => {
       const toolbars = obj.toolbars;
       const toolbarTargets =
                toArray(obj.iframe.win.document.body
               .querySelectorAll(`#${targetId}`));
       resizeIframeToWidth(obj.iframe, '200px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         expect(toolbars.length).to.be.equal(1);
         expect(toolbarTargets.length).to.be.equal(1);
         expect(toolbarTargets[0].style.display)
             .to.be.equal('none');
       });
     });
   });

   it('should hide <nav toolbar> elements with toolbar-only, \
   inside the sidebar, but not inside the toolbar, for a matching \
   window size for (min-width: 768px)', () => {
     return getToolbars([{
       toolbarOnlyOnNav: true,
     }]).then(obj => {
       const toolbars = obj.toolbars;
       resizeIframeToWidth(obj.iframe, '4000px', () => {
         toolbars.forEach(toolbar => {
           toolbar.onLayoutChange();
         });
         const toolbarNavElements =
                toArray(obj.toolbarContainerElement.ownerDocument
                .querySelectorAll('nav[toolbar][target]'));
         const hiddenToolbarNavElements =
                toArray(obj.toolbarContainerElement.ownerDocument
                .querySelectorAll('nav[style]'));
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
