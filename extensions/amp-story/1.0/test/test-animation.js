/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {
  AnimationManager,
  AnimationRunner,
  AnimationSequence,
} from '../animation';
import {Deferred} from '../../../../src/utils/promise';
import {Services} from '../../../../src/services';
import {WebAnimationPlayState} from '../../../amp-animation/0.1/web-animation-types';
import {htmlFor, htmlRefs} from '../../../../src/static-template';
import {layoutRectLtwh} from '../../../../src/layout-rect';
import {presets} from '../animation-presets';
import {scopedQuerySelectorAll} from '../../../../src/dom';
import {toArray} from '../../../../src/types';

const querySelectorAllAnimateIn = (element) =>
  toArray(scopedQuerySelectorAll(element, '[animate-in]'));

describes.realWin('amp-story animations', {}, (env) => {
  let html;
  let ampdoc;

  const nextTick = () =>
    new Promise((resolve) => env.win.setTimeout(resolve, 0));

  beforeEach(() => {
    html = htmlFor(env.win.document);
    ampdoc = new AmpDocSingle(env.win);
  });

  describe('AnimationRunner', () => {
    const vsync = {
      measurePromise: (cb) => Promise.resolve(cb()),
      mutatePromise: (cb) => Promise.resolve(cb()),
    };

    let webAnimationBuilder;
    let webAnimationBuilderPromise;
    let sequence;

    beforeEach(() => {
      webAnimationBuilder = {
        createRunner: () => {},
        onPlayStateChanged: () => {},
      };

      webAnimationBuilderPromise = Promise.resolve(webAnimationBuilder);

      sequence = {
        notifyFinish: () => {},
        waitFor: () => Promise.resolve(),
      };
    });

    it('passes keyframeOptions to preset keyframes function', async () => {
      const page = html`<div></div>`;
      const target = html`<div></div>`;

      const keyframeOptions = {foo: 'bar'};

      const animationDef = {
        duration: 0,
        delay: 0,
        target,
        preset: {
          keyframes: env.sandbox.spy(() => [{}]),
        },
      };

      const runner = new AnimationRunner(
        page,
        animationDef,
        webAnimationBuilderPromise,
        vsync,
        sequence,
        keyframeOptions
      );

      await runner.applyFirstFrame();

      expect(
        animationDef.preset.keyframes.withArgs(
          env.sandbox.match.any,
          env.sandbox.match(keyframeOptions)
        )
      ).to.have.been.calledOnce;
    });

    it('passes dimensions to preset keyframes function', async () => {
      const page = html`<div></div>`;
      const target = html`<div></div>`;

      const pageDimensions = layoutRectLtwh(10, 20, 300, 500);
      Object.defineProperties(page, {
        'offsetWidth': {value: pageDimensions.width},
        'offsetHeight': {value: pageDimensions.height},
      });

      const targetDimensions = layoutRectLtwh(40, 80, 100, 200);
      Object.defineProperties(target, {
        'offsetWidth': {value: targetDimensions.width},
        'offsetHeight': {value: targetDimensions.height},
      });

      env.sandbox.stub(page, 'getBoundingClientRect').returns(pageDimensions);
      env.sandbox
        .stub(target, 'getBoundingClientRect')
        .returns(targetDimensions);

      const animationDef = {
        duration: 0,
        delay: 0,
        target,
        preset: {
          keyframes: env.sandbox.spy(() => [{}]),
        },
      };

      const runner = new AnimationRunner(
        page,
        animationDef,
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await runner.applyFirstFrame();

      expect(
        animationDef.preset.keyframes.withArgs(
          env.sandbox.match({
            pageWidth: pageDimensions.width,
            pageHeight: pageDimensions.height,
            targetWidth: targetDimensions.width,
            targetHeight: targetDimensions.height,
            targetX: targetDimensions.x - pageDimensions.x,
            targetY: targetDimensions.y - pageDimensions.y,
          }),
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;
    });

    const keyframes = [{opacity: 0}, {opacity: 1}];
    const keyframeDefTypes = {
      'function': () => keyframes,
      'array': keyframes,
    };
    Object.keys(keyframeDefTypes).forEach((keyframeDefType) => {
      it(`applies first frame (with ${keyframeDefType})`, async () => {
        const page = html`<div></div>`;
        const target = html`<div></div>`;

        const animationDef = {
          duration: 0,
          delay: 0,
          target,
          preset: {
            keyframes: keyframeDefTypes[keyframeDefType],
          },
        };

        const runner = new AnimationRunner(
          page,
          animationDef,
          webAnimationBuilderPromise,
          vsync,
          sequence
        );

        await runner.applyFirstFrame();

        expect(target.style.opacity).to.equal('0');
      });
    });

    it('creates WebAnimationRunner with definition', async () => {
      const page = html`<div></div>`;
      const target = html`<div></div>`;

      const webAnimationRunner = {
        getPlayState: () => WebAnimationPlayState.IDLE,
        onPlayStateChanged: () => {},
      };

      webAnimationBuilder.createRunner = env.sandbox.spy(
        () => webAnimationRunner
      );

      const keyframes = [{}];

      const easing = 'test-easing';
      const duration = 123;
      const delay = 456;

      const animationDef = {
        target,
        easing,
        duration,
        delay,
        preset: {
          keyframes: () => keyframes,
        },
      };

      new AnimationRunner(
        page,
        animationDef,
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await nextTick();

      expect(
        webAnimationBuilder.createRunner.withArgs(
          env.sandbox.match({
            target,
            easing,
            duration,
            delay,
            keyframes,
          })
        )
      ).to.have.been.calledOnce;
    });

    it('passes static definition (like <amp-story-animation>) to WebAnimationRunner', async () => {
      const page = html`<div></div>`;

      const webAnimationRunner = {
        getPlayState: () => WebAnimationPlayState.IDLE,
        onPlayStateChanged: () => {},
      };

      webAnimationBuilder.createRunner = env.sandbox.spy(
        () => webAnimationRunner
      );

      const animationDef = {
        selector: '.foo',
        easing: 'test-easing',
        duration: 123,
        delay: 346,
        keyframes: [{}],
      };

      new AnimationRunner(
        page,
        animationDef,
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await nextTick();

      expect(webAnimationBuilder.createRunner.withArgs(animationDef)).to.have
        .been.calledOnce;
    });

    it('starts', async () => {
      const page = html`<div></div>`;
      const target = html`<div></div>`;

      const webAnimationRunner = {
        start: env.sandbox.spy(),
        getPlayState: () => WebAnimationPlayState.IDLE,
        onPlayStateChanged: () => {},
      };

      webAnimationBuilder.createRunner = () => webAnimationRunner;

      const animationDef = {
        duration: 0,
        delay: 0,
        target,
        preset: {
          keyframes: [{}],
        },
      };

      const runner = new AnimationRunner(
        page,
        animationDef,
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      runner.start();

      await nextTick();
      expect(webAnimationRunner.start).to.have.been.calledOnce;
    });

    it('starts after sequence id', async () => {
      const page = html`<div></div>`;
      const target = html`<div></div>`;

      const startAfterId = 'my-test-id';

      const webAnimationRunner = {
        start: env.sandbox.spy(),
        getPlayState: () => WebAnimationPlayState.IDLE,
        onPlayStateChanged: () => {},
      };

      webAnimationBuilder.createRunner = () => webAnimationRunner;

      const {resolve: resolveWaitFor, promise} = new Deferred();
      sequence.waitFor = env.sandbox.spy(() => promise);

      const animationDef = {
        duration: 0,
        delay: 0,
        target,
        startAfterId,
        preset: {
          keyframes: [{}],
        },
      };

      const runner = new AnimationRunner(
        page,
        animationDef,
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      runner.start();

      await nextTick();

      expect(sequence.waitFor.withArgs(startAfterId)).to.have.been.calledOnce;
      expect(webAnimationRunner.start).to.not.have.been.called;

      resolveWaitFor();

      await nextTick();

      expect(webAnimationRunner.start).to.have.been.calledOnce;
    });

    it('notifies sequence when finished', async () => {
      const page = html`<div></div>`;
      const target = html`<div id="my-test-id"></div>`;

      const targetId = 'my-test-id';

      let onPlayStateChangedCallback;
      const webAnimationRunner = {
        getPlayState: () => WebAnimationPlayState.IDLE,
        onPlayStateChanged: (callback) => {
          onPlayStateChangedCallback = callback;
        },
      };

      webAnimationBuilder.createRunner = () => webAnimationRunner;

      sequence.notifyFinish = env.sandbox.spy();

      const animationDef = {
        duration: 0,
        delay: 0,
        target,
        preset: {
          keyframes: [{}],
        },
      };

      new AnimationRunner(
        page,
        animationDef,
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await nextTick();

      expect(sequence.notifyFinish).to.not.have.been.called;

      onPlayStateChangedCallback(WebAnimationPlayState.FINISHED);

      expect(sequence.notifyFinish.withArgs(targetId)).to.have.been.calledOnce;
    });
  });

  describe('AnimationManager', () => {
    let extensionsService;
    let webAnimationService;
    let webAnimationBuilderPromise;
    let createAnimationRunner;
    let runner;

    beforeEach(() => {
      webAnimationBuilderPromise = Promise.resolve();

      extensionsService = {
        installExtensionForDoc: env.sandbox.spy(() => Promise.resolve()),
      };

      webAnimationService = {
        createBuilder: env.sandbox.spy(() => webAnimationBuilderPromise),
      };

      env.sandbox.stub(Services, 'extensionsFor').returns(extensionsService);
      env.sandbox.stub(Services, 'vsyncFor').returns({});
      env.sandbox
        .stub(Services, 'webAnimationServiceFor')
        .returns(Promise.resolve(webAnimationService));

      runner = {
        applyFirstFrame: env.sandbox.spy(() => Promise.resolve()),
      };

      createAnimationRunner = env.sandbox
        .stub(AnimationRunner, 'create')
        .returns(runner);
    });

    it('creates WebAnimation Builder with options', async () => {
      const page = html`<div></div>`;
      new AnimationManager(page, ampdoc);
      await nextTick();
      expect(
        webAnimationService.createBuilder.withArgs(
          env.sandbox.match({
            scope: page,
          })
        )
      ).to.have.been.calledOnce;
    });

    it('creates internal runners when applying first frame (preset)', async () => {
      const page = html`
        <div>
          <div animate-in="fly-in-left"></div>
          <div animate-in="fade-in"></div>
          <div animate-in="drop"></div>
        </div>
      `;

      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrame();

      querySelectorAllAnimateIn(page).forEach((target) => {
        const preset = presets[target.getAttribute('animate-in')];
        expect(
          createAnimationRunner.withArgs(
            page,
            env.sandbox.match({target, preset}),
            webAnimationBuilderPromise,
            env.sandbox.match.any,
            env.sandbox.match.any,
            env.sandbox.match.any
          )
        ).to.have.been.calledOnce;
      });
    });

    it('creates internal runners when applying first frame (amp-story-animation)', async () => {
      const spec1 = {keyframes: [{opacity: 1}]};
      const spec2 = {keyframes: [{transform: 'translate(10px, 10px)'}]};

      const page = html`
        <div>
          <amp-story-animation>
            <script type="application/json" ref="spec1holder"></script>
          </amp-story-animation>
          <amp-story-animation>
            <script type="application/json" ref="spec2holder"></script>
          </amp-story-animation>
        </div>
      `;

      const {spec1holder, spec2holder} = htmlRefs(page);
      spec1holder.textContent = JSON.stringify(spec1);
      spec2holder.textContent = JSON.stringify(spec2);

      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrame();

      expect(
        createAnimationRunner.withArgs(
          page,
          env.sandbox.match(spec1),
          webAnimationBuilderPromise,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;

      expect(
        createAnimationRunner.withArgs(
          page,
          env.sandbox.match(spec2),
          webAnimationBuilderPromise,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;
    });

    it('fails when using unknown presets', () => {
      const animationManager = new AnimationManager(
        html`
          <div>
            <div animate-in="unknown-preset"></div>
          </div>
        `,
        ampdoc
      );
      expect(async () => await animationManager.applyFirstFrame()).to.throw;
    });

    it('passes keyframeOptions to runner', async () => {
      const page = html`<div></div>`;

      const targetsWithOptions = [
        {
          target: html`<div animate-in="pan-left" translate-x="100"></div>`,
          expectedOptions: {'translate-x': 100},
        },
        {
          target: html`<div animate-in="pan-up" translate-y="200"></div>`,
          expectedOptions: {'translate-y': 200},
        },
        {
          target: html`<div animate-in="zoom-out" scale-start="0.9"></div>`,
          expectedOptions: {'scale-start': 0.9},
        },
        {
          target: html`<div animate-in="zoom-out" scale-end="0.2"></div>`,
          expectedOptions: {'scale-end': 0.2},
        },
        {
          target: html`
            <div animate-in="zoom-in" scale-end="0.1" scale-start="0.5"></div>
          `,
          expectedOptions: {'scale-end': 0.1, 'scale-start': 0.5},
        },
      ];

      targetsWithOptions.forEach(({target}) => {
        page.appendChild(target);
      });

      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrame();

      targetsWithOptions.forEach(({target, expectedOptions}) => {
        expect(
          createAnimationRunner.withArgs(
            page,
            env.sandbox.match({target}),
            env.sandbox.match.any,
            env.sandbox.match.any,
            env.sandbox.match.any,
            env.sandbox.match(expectedOptions)
          )
        ).to.have.been.calledOnce;
      });
    });

    it('applies first frame', async () => {
      const page = html`
        <div>
          <div animate-in="fly-in-left"></div>
          <div animate-in="fade-in"></div>
          <div animate-in="drop"></div>
        </div>
      `;
      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrame();
      expect(runner.applyFirstFrame).to.have.callCount(
        querySelectorAllAnimateIn(page).length
      );
    });

    it('fails when animate-in-after element does not exist', async () => {
      const page = html`
        <div>
          <div animate-in="fly-in-left" animate-in-after="does-not-exist"></div>
        </div>
      `;
      env.win.document.body.appendChild(page);
      const animationManager = new AnimationManager(page, ampdoc);
      expect(() => animationManager.applyFirstFrame()).to.throw;
    });

    it('passes animate-in-after id in definition', async () => {
      const page = html`
        <div>
          <div
            id="animated-first"
            ref="animatedFirst"
            animate-in="fly-in-left"
          ></div>
          <div
            id="animated-second"
            ref="animatedSecond"
            animate-in-after="animated-first"
            animate-in="fly-in-top"
          ></div>
          <div
            id="animated-third"
            ref="animatedThird"
            animate-in-after="animated-second"
            animate-in="fly-in-right"
          ></div>
        </div>
      `;
      const {animatedFirst, animatedSecond, animatedThird} = htmlRefs(page);

      env.win.document.body.appendChild(page);

      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrame();

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({target: animatedFirst, startAfterId: undefined}),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({
            target: animatedSecond,
            startAfterId: 'animated-first',
          }),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({
            target: animatedThird,
            startAfterId: 'animated-second',
          }),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;
    });

    const oneToManyPassthrus = {
      animateIn: 'start',
      finishAll: 'finish',
      cancelAll: 'cancel',
      pauseAll: 'pause',
      resumeAll: 'resume',
      hasAnimationStarted: 'hasStarted',
    };

    Object.keys(oneToManyPassthrus).forEach((managerMethod) => {
      const runnerMethod = oneToManyPassthrus[managerMethod];

      it(`calls ${runnerMethod}() on all runners calling ${managerMethod}()`, async () => {
        const page = html`
          <div>
            <div animate-in="fly-in-left"></div>
            <div animate-in="fade-in"></div>
            <div animate-in="drop"></div>
          </div>
        `;

        runner[runnerMethod] = env.sandbox.spy();
        const animationManager = new AnimationManager(page, ampdoc);
        await animationManager.applyFirstFrame();
        animationManager[managerMethod]();
        expect(runner[runnerMethod]).to.have.callCount(
          querySelectorAllAnimateIn(page).length
        );
      });
    });
  });

  describe('AnimationSequence', () => {
    it('waits until notified', async () => {
      const sequence = new AnimationSequence();
      const notified = env.sandbox.spy();

      sequence.waitFor('test-notify-id').then(notified);
      await nextTick();
      expect(notified).to.not.have.been.called;

      sequence.notifyFinish('test-notify-id');
      await nextTick();
      expect(notified).to.have.been.calledOnce;
    });

    it('notifies only once per wait', async () => {
      const sequence = new AnimationSequence();
      const notified = env.sandbox.spy();

      sequence.waitFor('test-notify-id').then(notified);
      await nextTick();

      sequence.notifyFinish('test-notify-id');
      await nextTick();

      sequence.notifyFinish('test-notify-id');
      await nextTick();

      sequence.notifyFinish('test-notify-id');
      await nextTick();

      expect(notified).to.have.been.calledOnce;
    });

    it("doesn't notify incorrect ids", async () => {
      const sequence = new AnimationSequence();
      const notified = env.sandbox.spy();

      sequence.waitFor('test-notify-id').then(notified);
      await nextTick();
      expect(notified).to.not.have.been.called;

      sequence.notifyFinish('a-different-test-notify-id');
      await nextTick();
      expect(notified).to.not.have.been.called;
    });
  });
});
