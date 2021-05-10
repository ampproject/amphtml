/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

 const pageWidth = 800;
 const pageHeight = 600;
 
 describes.endtoend(
   'AMP Lightbox Gallery with AMP Carousel 2.0',
   {
     fixture: 'amp-lightbox/amp-lightbox-with-carousel-0.2.amp.html',
     initialRect: {width: pageWidth, height: pageHeight},
     environments: ['single'],
   },
   async (env) => {
     let controller;
 
     function css(handle, name) {
       return controller.getElementCssValue(handle, name);
     }
 
     function prop(el, name) {
       return controller.getElementProperty(el, name);
     }
 
     beforeEach(async () => {
       controller = env.controller;
     });
 
     it('should open/close lightbox', async () => {
       // First open the gallery.
       const firstAmpImg = await controller.findElement('amp-img');
       await controller.click(firstAmpImg);
 
       // Verify it opened.
       const overlay = await controller.findElement('.i-amphtml-lbg-overlay');
       const galleryButton = await controller.findElement(
         '[data-action="gallery"]'
       );
       const closeButton = await controller.findElement('[data-action="close"]');
       await expect(css(overlay, 'opacity')).to.equal('1');
       await expect(css(galleryButton, 'opacity')).to.equal('1');
       await expect(css(closeButton, 'opacity')).to.equal('1');
 
       // Wait for the first slide's image to load
       const firstSlideImg = await controller.findElement(
         'amp-lightbox-gallery img'
       );
       await expect(prop(firstSlideImg, 'naturalWidth')).to.be.gt(0);
     });
   }
 );
 