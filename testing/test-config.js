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
'use strict';

import {Services} from '#service';

/**
 * Helper class to skip or retry tests under specific environment. Instantiate
 * using describes.configure(), describe.configure(), or it.configure().
 *
 * Example usage:
 * 1. describes.configure().skipChrome().enableIe().run(name, spec, function);
 * 2. describe.configure().skipFirefox().skipSafari().run(name, function);
 * 3. it.configure().skipEdge().run(name, function);
 */
export class TestConfig {
  constructor(runner) {
    this.runner = runner;

    /**
     * List of predicate functions that are called before running each test
     * suite to check whether the suite should be skipped or not.
     * If any of the functions return 'true', the suite will be skipped.
     * @type {!Array<function():boolean>}
     */
    this.skipMatchers = [];

    /**
     * List of predicate functions that are called before running each test
     * suite to check whether the suite should be skipped or not.
     * If any of the functions return 'false', the suite will be skipped.
     * @type {!Array<function():boolean>}
     */
    this.ifMatchers = [];

    this.platform = Services.platformFor(window);

    this.isModuleBuild = () => !!window.ampTestRuntimeConfig.isModuleBuild;

    /**
     * Predicate functions that determine whether to run tests on a platform.
     */
    this.runOnChrome = this.platform.isChrome.bind(this.platform);
    this.runOnEdge = this.platform.isEdge.bind(this.platform);
    this.runOnFirefox = this.platform.isFirefox.bind(this.platform);
    this.runOnSafari = this.platform.isSafari.bind(this.platform);
    this.runOnIos = this.platform.isIos.bind(this.platform);
    this.runOnIe = this.platform.isIe.bind(this.platform);

    /**
     * By default, IE is skipped. Individual tests may opt in.
     */
    this.skip(this.runOnIe);
  }

  skipModuleBuild() {
    return this.skip(this.isModuleBuild);
  }

  skipChrome() {
    return this.skip(this.runOnChrome);
  }

  skipEdge() {
    return this.skip(this.runOnEdge);
  }

  skipFirefox() {
    return this.skip(this.runOnFirefox);
  }

  skipSafari() {
    return this.skip(this.runOnSafari);
  }

  skipIos() {
    return this.skip(this.runOnIos);
  }

  skipIfPropertiesObfuscated() {
    return this.skip(function () {
      return window.__karma__.config.amp.propertiesObfuscated;
    });
  }

  enableIe() {
    this.skipMatchers.splice(this.skipMatchers.indexOf(this.runOnIe), 1);
    return this;
  }

  /**
   * @param {function():boolean} fn
   */
  skip(fn) {
    this.skipMatchers.push(fn);
    return this;
  }

  ifModuleBuild() {
    return this.if(this.isModuleBuild);
  }

  ifChrome() {
    return this.if(this.runOnChrome);
  }

  ifEdge() {
    return this.if(this.runOnEdge);
  }

  ifFirefox() {
    return this.if(this.runOnFirefox);
  }

  ifSafari() {
    return this.if(this.runOnSafari);
  }

  ifIos() {
    return this.if(this.runOnIos);
  }

  ifIe() {
    // It's necessary to first enable IE because we skip it by default.
    return this.enableIe().if(this.runOnIe);
  }

  /**
   * @param {function():boolean} fn
   */
  if(fn) {
    this.ifMatchers.push(fn);
    return this;
  }

  isSkipped() {
    for (let i = 0; i < this.skipMatchers.length; i++) {
      if (this.skipMatchers[i].call(this)) {
        return true;
      }
    }
    for (let i = 0; i < this.ifMatchers.length; i++) {
      if (!this.ifMatchers[i].call(this)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Runs tests after configuration is complete. Variable args because describe
   * and it use (name, function) while describes uses (name, spec, function).
   * @param {string} name
   * @param {...*} args
   */
  run(name, ...args) {
    if (this.isSkipped()) {
      this.runner.skip(name, ...args);
      return;
    }
    this.runner(name, ...args, /* configured */ true);
  }
}
