import {assertDoesNotContainDisplay, setStyles} from '#core/dom/style';

import {useLayoutEffect, useRef} from '#preact';
import {useValueRef} from '#preact/component';

import {Side} from './sidebar-config';

const ANIMATION_DURATION = 350;
const ANIMATION_EASE_IN = 'cubic-bezier(0,0,.21,1)';

const ANIMATION_KEYFRAMES_FADE_IN = [{'opacity': '0'}, {'opacity': '1'}];
const ANIMATION_KEYFRAMES_SLIDE_IN_LEFT = [
  {'transform': 'translateX(-100%)'},
  {'transform': 'translateX(0)'},
];
const ANIMATION_KEYFRAMES_SLIDE_IN_RIGHT = [
  {'transform': 'translateX(100%)'},
  {'transform': 'translateX(0)'},
];

const ANIMATION_STYLES_SIDEBAR_LEFT_INIT = {'transform': 'translateX(-100%)'};
const ANIMATION_STYLES_SIDEBAR_RIGHT_INIT = {'transform': 'translateX(100%)'};
const ANIMATION_STYLES_BACKDROP_INIT = {'opacity': '0'};
const ANIMATION_STYLES_SIDEBAR_FINAL = {'transform': ''};
const ANIMATION_STYLES_BACKDROP_FINAL = {'opacity': ''};

/**
 * @param {!Element} element
 * @param {!{[key: string]: *}} styles
 */
function safelySetStyles(element, styles) {
  setStyles(element, assertDoesNotContainDisplay(styles));
}

/**
 * @param {boolean} mounted
 * @param {boolean} opened
 * @param {{current: function():void} | {current: void}} onAfterOpen
 * @param {{current: function():void} | {current: void}} onAfterClose
 * @param {string} side
 * @param {{current: (Element|null)}} sidebarRef
 * @param {{current: (Element|null)}} backdropRef
 * @param {function():undefined} setMounted
 */
export function useSidebarAnimation(
  mounted,
  opened,
  onAfterOpen,
  onAfterClose,
  side,
  sidebarRef,
  backdropRef,
  setMounted
) {
  const onAfterOpenRef = useValueRef(onAfterOpen);
  const onAfterCloseRef = useValueRef(onAfterClose);
  const sidebarAnimationRef = useRef(null);
  const backdropAnimationRef = useRef(null);
  const currentlyAnimatingRef = useRef(false);
  useLayoutEffect(() => {
    const sidebarElement = sidebarRef.current;
    const backdropElement = backdropRef.current;
    // The component might start in a state where `side` is not known
    // This effect must be restarted when the `side` becomes known
    // Must also check mounted as of #33244.  This is because previously
    // sidebarElement and backdropElement would not be rendered when
    // mounted is false.  This is no longer the case.
    if (!mounted || !sidebarElement || !backdropElement || !side) {
      return;
    }

    const postVisibleAnim = () => {
      safelySetStyles(sidebarElement, ANIMATION_STYLES_SIDEBAR_FINAL);
      safelySetStyles(backdropElement, ANIMATION_STYLES_BACKDROP_FINAL);
      sidebarAnimationRef.current = null;
      backdropAnimationRef.current = null;
      currentlyAnimatingRef.current = false;
      onAfterOpenRef.current?.();
    };
    const postInvisibleAnim = () => {
      onAfterCloseRef.current?.();
      sidebarAnimationRef.current = null;
      backdropAnimationRef.current = null;
      currentlyAnimatingRef.current = false;
      setMounted(false);
    };

    // reverse animation if currently animating
    if (currentlyAnimatingRef.current) {
      const sidebarAnimation = sidebarAnimationRef.current;
      if (sidebarAnimation) {
        sidebarAnimation.reverse();
        sidebarAnimation.onfinish = opened
          ? postVisibleAnim
          : postInvisibleAnim;
      }
      const backdropAnimation = backdropAnimationRef.current;
      if (backdropAnimation) {
        backdropAnimation.reverse();
      }
      return;
    }

    // begin animation if fully opened or closed
    if (opened) {
      // make visible animation
      if (!sidebarElement.animate || !backdropElement.animate) {
        postVisibleAnim();
        return;
      }
      safelySetStyles(
        sidebarElement,
        side === Side.LEFT
          ? ANIMATION_STYLES_SIDEBAR_LEFT_INIT
          : ANIMATION_STYLES_SIDEBAR_RIGHT_INIT
      );
      safelySetStyles(backdropElement, ANIMATION_STYLES_BACKDROP_INIT);
      const sidebarAnimation = sidebarElement.animate(
        side === Side.LEFT
          ? ANIMATION_KEYFRAMES_SLIDE_IN_LEFT
          : ANIMATION_KEYFRAMES_SLIDE_IN_RIGHT,
        {
          duration: ANIMATION_DURATION,
          fill: 'both',
          easing: ANIMATION_EASE_IN,
        }
      );
      sidebarAnimation.onfinish = postVisibleAnim;
      const backdropAnimation = backdropElement.animate(
        ANIMATION_KEYFRAMES_FADE_IN,
        {
          duration: ANIMATION_DURATION,
          fill: 'both',
          easing: ANIMATION_EASE_IN,
        }
      );
      sidebarAnimationRef.current = sidebarAnimation;
      backdropAnimationRef.current = backdropAnimation;
      currentlyAnimatingRef.current = true;
    } else {
      // make invisible animation
      if (!sidebarElement.animate || !backdropElement.animate) {
        postInvisibleAnim();
        return;
      }
      const sidebarAnimation = sidebarElement.animate(
        side === Side.LEFT
          ? ANIMATION_KEYFRAMES_SLIDE_IN_LEFT
          : ANIMATION_KEYFRAMES_SLIDE_IN_RIGHT,
        {
          duration: ANIMATION_DURATION,
          direction: 'reverse',
          fill: 'both',
          easing: ANIMATION_EASE_IN,
        }
      );
      sidebarAnimation.onfinish = postInvisibleAnim;
      const backdropAnimation = backdropElement.animate(
        ANIMATION_KEYFRAMES_FADE_IN,
        {
          duration: ANIMATION_DURATION,
          direction: 'reverse',
          fill: 'both',
          easing: ANIMATION_EASE_IN,
        }
      );
      sidebarAnimationRef.current = sidebarAnimation;
      backdropAnimationRef.current = backdropAnimation;
      currentlyAnimatingRef.current = true;
    }
  }, [
    mounted,
    opened,
    onAfterOpenRef,
    onAfterCloseRef,
    side,
    sidebarRef,
    backdropRef,
    setMounted,
  ]);
}
