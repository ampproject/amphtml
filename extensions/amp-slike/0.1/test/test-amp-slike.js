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

 import '../amp-slike';
 
 describes.realWin(
   'amp-slike',
   {
     amp: {
       extensions: ['amp-slike'],
     },
   },
   (env) => {
     let win, doc;
 
     beforeEach(() => {
       win = env.win;
       doc = win.document;
     });
 
     async function getSlike(attributes, opt_responsive) {
      const slike = doc.createElement('amp-slike');
      for (const key in attributes) {
        slike.setAttribute(key, attributes[key]);
      }
      slike.setAttribute('width', '320');
      slike.setAttribute('height', '180');
       if (opt_responsive) {
         slike.setAttribute('layout', 'responsive');
       }
       
       doc.body.appendChild(slike);
       await slike.buildInternal();
       await slike.layoutCallback();
       return slike;
     }
 
     it('renders', async () => {
       const slike = await getSlike({
        'data-apikey': 'slike373googleamp5accuzkglo',
        'data-videoid': '1xp5a1wkul',
        'data-config':'playlist=true&playlisturl=//videoplayer.indiatimes.com/dev/playlistcallback.js'
        }, true);
       const iframe = slike.querySelector('iframe');
       expect(iframe).to.not.be.null;
       expect(iframe.tagName).to.equal('IFRAME');
       expect(iframe.src).to.equal('http://localhost:3000/ampembed.html#apikey=slike373googleamp5accuzkglo&videoid=1xp5a1wkul&playlist=true&playlisturl=//videoplayer.indiatimes.com/dev/playlistcallback.js&baseurl='+window.location.origin);
     });
 
     it('renders responsively', async () => {
       const slike = await getSlike({
        'data-apikey': 'slike373googleamp5accuzkglo',
        'data-videoid': '1xp5a1wkul'
      }, true);
       const iframe = slike.querySelector('iframe');
       expect(iframe).to.not.be.null;
      });
 
     it('requires data-videoid', () => {
       return getSlike( {
        'data-apikey': 'slike373googleamp5accuzkglo'
      }, true).should.eventually.be.rejectedWith(
         /The data-videoid attribute is required for/
       );
     });

     it('requires data-apikey', () => {
      return getSlike({
        'data-videoid': '1xp5a1wkul'
      }, true).should.eventually.be.rejectedWith(
        /The data-apikey attribute is required for/
      );
    });

 
 
   }
 );
 