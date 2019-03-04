/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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


/** @enum {string} */
const AmpdocEnvironment = {
  SINGLE: 'single',
  VIEWER_DEMO: 'viewer-demo',
};

const EnvironmentBehaviorMap = {
  [AmpdocEnvironment.SINGLE]: {
    ready(unusedController) {
      return Promise.resolve();
    },

    url(url) {
      return url;
    },
  },

  [AmpdocEnvironment.VIEWER_DEMO]: {
    ready(controller) {
      return controller.findElement('#AMP_DOC_dynamic[data-loaded]')
          .then(frame => controller.switchToFrame(frame));
    },

    url(url) {
      // TODO(estherkim): somehow allow non-8000 port and domain
      return `http://localhost:8000/examples/viewer.html#href=${url}`;
    },
  },
};

/**
 * Provides AMP-related utilities for E2E Functional Tests.
 */
class AmpDriver {
  /**
   * @param {!../functional-test-controller.FunctionalTestController} controller
   */
  constructor(controller) {
    /** @private @const */
    this.controller_ = controller;
  }

  /**
   * Toggles an experiment in an AMP document. Uses the current domain.
   * @param {string} name
   * @param {boolean} toggle
   * @return {!Promise}
   */
  async toggleExperiment(name, toggle) {
    await this.controller_.evaluate((name, toggle) => {
      window.AMP.toggleExperiment(name, toggle);
    }, name, toggle);
  }

  /**
   * Navigate the browser to a URL that will display the given url in the
   * given environment.
   * @param {!AmpdocEnvironment} environment
   * @param {string} url
   */
  async navigateToEnvironment(environment, url) {
    const ampEnv = EnvironmentBehaviorMap[environment];
    await this.controller_.navigateTo(ampEnv.url(url));
    await ampEnv.ready(this.controller_);
  }
}

module.exports = {
  AmpDriver,
  AmpdocEnvironment,
};
