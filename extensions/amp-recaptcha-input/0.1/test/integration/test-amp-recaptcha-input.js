/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

describe.configure().skipSafari().skipEdge()
  .run('amp-recaptcha-input', function() {
  
  // Extend timeout slightly for flakes on Windows environments
  this.timeout(4000);
  const extensions = ['amp-recaptcha-input'];

  const bodyTemplate = `
    <amp-recaptcha-input 
      id="amp-recaptcha-input-1"
      layout="nodisplay"
      data-sitekey="6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE"
      data-action="integration_test">
    </amp-recaptcha-input>
  `;

  describes.integration('amp-recaptcha execute', {
    body: bodyTemplate,
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
    });

    it('should be able to return a token on execute', () => {
      
      const ampRecaptchaInput = 
        win.document.getElementById('amp-recaptcha-input-1');
      
      return ampRecaptchaInput.implementation_.layoutCallback().then(() => {
        return ampRecaptchaInput.implementation_.getValue().then(token => {
          expect(token).to.be.ok;
        });

      });

    });


  });
});
