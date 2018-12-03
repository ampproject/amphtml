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

import '../amp-action-macro';
import {
  toggleExperiment,
} from '../../../../src/experiments';

describes.realWin('amp-action-macro', {
  amp: {
    runtimeOn: true,
    extensions: ['amp-action-macro'],
  },
}, env => {

  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    toggleExperiment(win, 'amp-action-macro', true);
  });

  function newActionMacro() {
    const actionMacro = doc.createElement('amp-action-macro');
    doc.body.appendChild(actionMacro);
    return actionMacro.build().then(() => {
      return actionMacro.layoutCallback();
    });
  }

  it('should build if experiment is on', done => {
    newActionMacro().then(() => {
      done();
    }, unused => {
      done(new Error('component should have built'));
    });
  });

  it('should not build if experiment is off', () => {
    return allowConsoleError(() => {
      toggleExperiment(env.win, 'amp-action-macro', false);
      return newActionMacro().catch(err => {
        expect(err.message).to.include('Experiment is off');
      });
    });
  });

});
