import {Deferred} from '#core/data-structures/promise';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {scopedQuerySelectorAll} from '#core/dom/query';
import {htmlFor, htmlRefs} from '#core/dom/static-template';
import {toArray} from '#core/types/array';

import {Services} from '#service';
import {AmpDocSingle} from '#service/ampdoc-impl';

import {macroTask} from '#testing/helpers';

import {WebAnimationPlayState} from '../../../amp-animation/0.1/web-animation-types';
import {
  AnimationManager,
  AnimationRunner,
  AnimationSequence,
} from '../animation';
import {presets} from '../animation-presets';

const querySelectorAllAnimateIn = (element) =>
  toArray(scopedQuerySelectorAll(element, '[animate-in]'));

describes.realWin('amp-story animations', {}, (env) => {
  let html;
  let ampdoc;

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

      const preset = {
        keyframes: env.sandbox.spy(() => [{}]),
      };

      const runner = new AnimationRunner(
        page,
        {
          source: target,
          preset,
          keyframeOptions,
          spec: {
            duration: 0,
            delay: 0,
            target,
          },
        },
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await runner.applyFirstFrame();

      expect(
        preset.keyframes.withArgs(
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

      const preset = {
        keyframes: env.sandbox.spy(() => [{}]),
      };

      const runner = new AnimationRunner(
        page,
        {
          source: target,
          preset,
          spec: {
            duration: 0,
            delay: 0,
            target,
          },
        },
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await runner.applyFirstFrame();

      expect(
        preset.keyframes.withArgs(
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

        const runner = new AnimationRunner(
          page,
          {
            source: target,
            preset: {
              keyframes: keyframeDefTypes[keyframeDefType],
            },
            spec: {
              duration: 0,
              delay: 0,
              target,
            },
          },
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

      new AnimationRunner(
        page,
        {
          source: target,
          preset: {
            keyframes: () => keyframes,
          },
          spec: {
            target,
            easing,
            duration,
            delay,
          },
        },
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await macroTask();

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

      const spec = {
        selector: '.foo',
        easing: 'test-easing',
        duration: 123,
        delay: 346,
        keyframes: [{}],
      };

      const source = html`<amp-story-animation></amp-story-animation>`;

      new AnimationRunner(
        page,
        {source, spec},
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await macroTask();

      expect(webAnimationBuilder.createRunner.withArgs(spec)).to.have.been
        .calledOnce;
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

      const runner = new AnimationRunner(
        page,
        {
          source: target,
          preset: {
            keyframes: [{}],
          },
          spec: {
            duration: 0,
            delay: 0,
            target,
          },
        },
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      runner.start();

      await macroTask();
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

      const {promise, resolve: resolveWaitFor} = new Deferred();
      sequence.waitFor = env.sandbox.spy(() => promise);

      const runner = new AnimationRunner(
        page,
        {
          source: target,
          startAfterId,
          preset: {
            keyframes: [{}],
          },
          spec: {
            duration: 0,
            delay: 0,
            target,
          },
        },
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      runner.start();

      await macroTask();

      expect(sequence.waitFor.withArgs(startAfterId)).to.have.been.calledOnce;
      expect(webAnimationRunner.start).to.not.have.been.called;

      resolveWaitFor();

      await macroTask();

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

      new AnimationRunner(
        page,
        {
          source: target,
          preset: {
            keyframes: [{}],
          },
          spec: {
            duration: 0,
            delay: 0,
            target,
          },
        },
        webAnimationBuilderPromise,
        vsync,
        sequence
      );

      await macroTask();

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
      await macroTask();
      expect(
        webAnimationService.createBuilder.withArgs(
          env.sandbox.match({
            scope: page,
            scaleByScope: true,
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
      await animationManager.applyFirstFrameOrFinish();

      querySelectorAllAnimateIn(page).forEach((target) => {
        const preset = presets[target.getAttribute('animate-in')];
        expect(
          createAnimationRunner.withArgs(
            page,
            env.sandbox.match({source: target, preset, spec: {target}}),
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
          <amp-story-animation trigger="visibility" ref="spec1source">
            <script type="application/json"></script>
          </amp-story-animation>
          <amp-story-animation trigger="visibility" ref="spec2source">
            <script type="application/json"></script>
          </amp-story-animation>
        </div>
      `;

      const {spec1source, spec2source} = htmlRefs(page);
      spec1source.firstElementChild.textContent = JSON.stringify(spec1);
      spec2source.firstElementChild.textContent = JSON.stringify(spec2);

      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrameOrFinish();

      expect(
        createAnimationRunner.withArgs(
          page,
          env.sandbox.match({source: spec1source, spec: spec1}),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;

      expect(
        createAnimationRunner.withArgs(
          page,
          env.sandbox.match({source: spec2source, spec: spec2}),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;
    });

    it('ignores unknown presets', async () => {
      const animationManager = new AnimationManager(
        html`
          <div>
            <div animate-in="unknown-preset"></div>
          </div>
        `,
        ampdoc
      );
      await animationManager.applyFirstFrameOrFinish();
      expect(createAnimationRunner).to.not.have.been.called;
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
        {
          target: html`
            <div
              animate-in="zoom-in"
              scale-end="invalid"
              scale-start="invalid"
            ></div>
          `,
          expectedOptions: {},
        },
      ];

      targetsWithOptions.forEach(({target}) => {
        page.appendChild(target);
      });

      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrameOrFinish();

      targetsWithOptions.forEach(({expectedOptions, target}) => {
        expect(
          createAnimationRunner.withArgs(
            page,
            env.sandbox.match({
              source: target,
              keyframeOptions: env.sandbox.match((passedOptions) => {
                expect(passedOptions).to.eql(expectedOptions);
                return true;
              }),
              spec: {target},
            }),
            env.sandbox.match.any,
            env.sandbox.match.any,
            env.sandbox.match.any
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
      await animationManager.applyFirstFrameOrFinish();
      expect(runner.applyFirstFrame).to.have.callCount(
        querySelectorAllAnimateIn(page).length
      );
    });

    it('sets fallback value for invalid animate-in-duration', async () => {
      const page = html`
        <div>
          <div animate-in="fly-in-left" animate-in-duration="invalid"></div>
        </div>
      `;

      const {firstElementChild} = page;

      env.win.document.body.appendChild(page);
      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrameOrFinish();

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({
            spec: {
              target: firstElementChild,
              duration: presets['fly-in-left'].duration,
            },
          }),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;
    });

    it('sets fallback value for invalid animate-in-delay', async () => {
      const page = html`
        <div>
          <div animate-in="fly-in-left" animate-in-delay="invalid"></div>
        </div>
      `;

      const {firstElementChild} = page;

      env.win.document.body.appendChild(page);
      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrameOrFinish();

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({
            spec: {target: firstElementChild, delay: 0},
          }),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;
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
            animate-in-after="does-not-exist-should-be-null"
            animate-in="fly-in-right"
          ></div>
          <amp-story-animation
            id="animated-fourth"
            ref="animatedFourth"
            animate-in-after="animated-third"
            trigger="visibility"
          >
            <script type="application/json">
              {}
            </script>
          </amp-story-animation>
        </div>
      `;
      const {animatedFirst, animatedFourth, animatedSecond, animatedThird} =
        htmlRefs(page);

      env.win.document.body.appendChild(page);

      const animationManager = new AnimationManager(page, ampdoc);
      await animationManager.applyFirstFrameOrFinish();

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({
            source: animatedFirst,
            startAfterId: null,
            spec: {target: animatedFirst},
          }),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({
            source: animatedSecond,
            startAfterId: 'animated-first',
            spec: {target: animatedSecond},
          }),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({
            source: animatedThird,
            startAfterId: null,
            spec: {target: animatedThird},
          }),
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any
        )
      ).to.have.been.calledOnce;

      expect(
        createAnimationRunner.withArgs(
          env.sandbox.match.any,
          env.sandbox.match({
            source: animatedFourth,
            startAfterId: 'animated-third',
            spec: {},
          }),
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
        await animationManager.applyFirstFrameOrFinish();
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
      await macroTask();
      expect(notified).to.not.have.been.called;

      sequence.notifyFinish('test-notify-id');
      await macroTask();
      expect(notified).to.have.been.calledOnce;
    });

    it('notifies only once per wait', async () => {
      const sequence = new AnimationSequence();
      const notified = env.sandbox.spy();

      sequence.waitFor('test-notify-id').then(notified);
      await macroTask();

      sequence.notifyFinish('test-notify-id');
      await macroTask();

      sequence.notifyFinish('test-notify-id');
      await macroTask();

      sequence.notifyFinish('test-notify-id');
      await macroTask();

      expect(notified).to.have.been.calledOnce;
    });

    it("doesn't notify incorrect ids", async () => {
      const sequence = new AnimationSequence();
      const notified = env.sandbox.spy();

      sequence.waitFor('test-notify-id').then(notified);
      await macroTask();
      expect(notified).to.not.have.been.called;

      sequence.notifyFinish('a-different-test-notify-id');
      await macroTask();
      expect(notified).to.not.have.been.called;
    });
  });
});
