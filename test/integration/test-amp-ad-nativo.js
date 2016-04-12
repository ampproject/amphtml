/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  createFixtureIframe,
  pollForLayout,
  poll,
} from '../../testing/iframe';

describe('Rendering of one ad', () => {
    let fixture;
    beforeEach(() => {
        return createFixtureIframe('test/fixtures/nativo.html', 12000)
        .then(f => {
            fixture = f;
        });
    });
    
    it('should create an iframe',function(){
        this.timeout(2000);
        let iframe;
        let ampAd;
        const isEdge = navigator.userAgent.match(/Edge/);
        return pollForLayout(fixture.win, 1, 5500).then(() => {
            return poll('frame to be in DOM', () => {
                return fixture.doc.querySelector('iframe');
            });
        }).then(iframeElement => {
            iframe = iframeElement;
            expect(fixture.doc.querySelectorAll('iframe')).to.have.length(1);
            ampAd = iframe.parentElement;
            
            expect(iframe.src).to.match(/http\:\/\/ads\.localhost:8000\/dist\.3p\/(.*)/);
        }).then(() => {
        return poll('frame to load', () => {
            return iframe.contentWindow && iframe.contentWindow.document &&
                iframe.contentWindow.document.getElementById('c');
            });
        }).then(unusedCanvas => {
            return poll('3p JS to load.', () => iframe.contentWindow.context);
        }).then(() => {
            return poll('render-start message received', () => {
                return fixture.messages.filter(message => {
                return message.type == 'render-start';
                }).length;
            });
        }).then(() => {
            expect(iframe.style.visibility).to.equal('');
            const win = iframe.contentWindow;            
        }).then(() => {
            expect(iframe.getAttribute('width')).to.equal('350');
            expect(iframe.getAttribute('height')).to.equal('150');
            if (isEdge) { 
                return;
            }
            return poll('Creative id transmitted. Ad fully rendered.', () => {
                return ampAd.creativeId;
            }, null, 15000);
        }).then(creativeId => {
            if (isEdge) { 
                return;
            }
            alert(creativeId)
        });
    });
});