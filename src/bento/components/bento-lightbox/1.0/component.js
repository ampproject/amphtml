import {Keys_Enum} from '#core/constants/key-codes';
import {tryFocus} from '#core/dom';
import {setStyle} from '#core/dom/style';

import * as Preact from '#preact';
import {useImperativeHandle, useLayoutEffect, useRef, useState} from '#preact';
import {forwardRef} from '#preact/compat';
import {ContainWrapper, useValueRef} from '#preact/component';

import {useStyles} from './component.jss';

const ANIMATION_DURATION = 200;
const ANIMATION_PRESETS = {
  'fade-in': [
    {opacity: 0, visibility: 'visible'},
    {opacity: 1, visibility: 'visible'},
  ],
  'fly-in-top': [
    {opacity: 0, transform: 'translate(0,-100%)', visibility: 'visible'},
    {opacity: 1, transform: 'translate(0, 0)', visibility: 'visible'},
  ],
  'fly-in-bottom': [
    {opacity: 0, transform: 'translate(0, 100%)', visibility: 'visible'},
    {opacity: 1, transform: 'translate(0, 0)', visibility: 'visible'},
  ],
};

const DEFAULT_CLOSE_LABEL = 'Close the modal';

const CONTENT_PROPS = {'part': 'scroller'};

/**
 * @param {!BentoLightboxDef.Props} props
 * @param {{current: ?BentoLightboxDef.LightboxApi}} ref
 * @return {PreactDef.Renderable}
 */
function BentoLightboxWithRef(
  {
    animation = 'fade-in',
    children,
    closeButtonAs,
    onAfterClose,
    onAfterOpen,
    onBeforeOpen,
    ...rest
  },
  ref
) {
  // There are two phases to open and close.
  // To open, we mount and render the contents (invisible), then animate the display (visible).
  // To close, it's the reverse.
  // `mounted` mounts the component. `visible` plays the animation.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const classes = useStyles();
  const lightboxRef = useRef();

  // We are using refs here to refer to common strings, objects, and functions used.
  // This is because they are needed within `useEffect` calls below (but are not depended for triggering)
  // We use `useValueRef` for props that might change (user-controlled)
  const animationRef = useValueRef(animation);
  const onBeforeOpenRef = useValueRef(onBeforeOpen);
  const onAfterCloseRef = useValueRef(onAfterClose);
  const onAfterOpenRef = useValueRef(onAfterOpen);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        onBeforeOpenRef.current?.();
        setMounted(true);
        setVisible(true);
      },
      close: () => setVisible(false),
    }),
    [onBeforeOpenRef]
  );

  useLayoutEffect(() => {
    const element = lightboxRef.current;
    if (!element) {
      return;
    }
    let animation;
    // Set pre-animation visibility state, to be flipped post-animation.
    setStyle(element, 'visibility', visible ? 'hidden' : 'visible');

    // "Make Visible" Animation
    if (visible) {
      const postVisibleAnim = () => {
        setStyle(element, 'opacity', 1);
        setStyle(element, 'visibility', 'visible');
        tryFocus(element);
        onAfterOpenRef.current?.();
      };
      if (!element.animate) {
        postVisibleAnim();
        return;
      }
      animation = element.animate(ANIMATION_PRESETS[animationRef.current], {
        duration: ANIMATION_DURATION,
        fill: 'both',
        easing: 'ease-in',
      });
      animation.onfinish = postVisibleAnim;
    } else {
      // "Make Invisible" Animation
      const postInvisibleAnim = () => {
        setStyle(element, 'opacity', 0);
        setStyle(element, 'visibility', 'hidden');
        if (onAfterCloseRef.current) {
          onAfterCloseRef.current();
        }
        animation = null;
        setMounted(false);
      };
      if (!element.animate) {
        postInvisibleAnim();
        return;
      }
      animation = element.animate(ANIMATION_PRESETS[animationRef.current], {
        duration: ANIMATION_DURATION,
        direction: 'reverse',
        fill: 'both',
        easing: 'ease-in',
      });
      animation.onfinish = postInvisibleAnim;
    }
    return () => {
      if (animation) {
        animation.cancel();
      }
    };
  }, [visible, animationRef, onAfterCloseRef, onAfterOpenRef]);

  return (
    mounted && (
      <ContainWrapper
        ref={lightboxRef}
        size={true}
        layout={true}
        paint={true}
        part="lightbox"
        contentClassName={classes.content}
        wrapperClassName={classes.wrapper}
        contentProps={CONTENT_PROPS}
        role="dialog"
        tabindex="0"
        onKeyDown={(event) => {
          if (event.key === Keys_Enum.ESCAPE) {
            setVisible(false);
          }
        }}
        {...rest}
      >
        <CloseButton as={closeButtonAs} onClick={() => setVisible(false)} />
        {children}
      </ContainWrapper>
    )
  );
}

const BentoLightbox = forwardRef(BentoLightboxWithRef);
BentoLightbox.displayName = 'Lightbox';
export {BentoLightbox};

/**
 *
 * @param {!BentoLightboxDef.CloseButtonProps} props
 * @return {PreactDef.Renderable}
 */
function CloseButton({as: Comp = ScreenReaderCloseButton, onClick}) {
  return <Comp aria-label={DEFAULT_CLOSE_LABEL} onClick={onClick} />;
}

/**
 * This is for screen-readers only, should not get a tab stop. Note that
 * screen readers can still swipe / navigate to this element, it just will
 * not be reachable via the tab button. Note that for desktop, hitting esc
 * to close is also an option.
 *
 * We do not want this in the tab order since it is not really "visible"
 * and would be confusing to tab to if not using a screen reader.
 *
 * @param {!BentoLightboxDef.CloseButtonProps} props
 * @return {PreactDef.Renderable}
 */
function ScreenReaderCloseButton({'aria-label': ariaLabel, onClick}) {
  const classes = useStyles();
  return (
    <button
      aria-label={ariaLabel}
      class={classes.closeButton}
      onClick={onClick}
      tabindex={-1}
    />
  );
}
