'use strict';

import {Services} from '#service';

/**
 * Helper class to skip or retry tests under specific environment. Instantiate
 * using describes.configure(), describe.configure(), or it.configure().
 *
 * Example usage:
 * 1. describes.configure().skipChrome().skipIos().run(name, spec, function);
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
    return this.skip(() => window.__karma__.config.amp.propertiesObfuscated);
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
