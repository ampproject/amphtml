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
import {AmpViewerIntegrationVariableService} from '../variable-service';


describes.fakeWin('amp-viewer-integration variable service', {}, () => {
  let variableService;

  beforeEach(() => {
    let ampdoc = {
      win: {
	location: {
	  originalHash: '#margarine=1&ice=2&cream=3',
	  ancestorOrigins: ['http://margarine-paradise.com'],
	}
      }
    };
    variableService = new AmpViewerIntegrationVariableService(ampdoc);
  });

  it('should return the first ancestorOrigin', () => {
    expect(variableService.get()['ancestorOrigin']()).to.equal('http://margarine-paradise.com');
  });

  it('should return the fragment param', () => {
    expect(variableService.get()['fragmentParam']('ice')).to.equal('2');
  });
});
