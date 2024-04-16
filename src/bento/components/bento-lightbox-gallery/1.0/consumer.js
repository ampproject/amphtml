import {sequentialIdGenerator} from '#core/data-structures/id-generator';

import * as Preact from '#preact';
import {
  cloneElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from '#preact';
import {Children} from '#preact/compat';

import {BentoLightboxGalleryContext} from './context';

const generateLightboxItemKey = sequentialIdGenerator();

/** @const {string} */
const DEFAULT_ARIA_LABEL = 'Open content in a lightbox view.';

/** @const {!{[key: string]: *}} */
const DEFAULT_ACTIVATION_PROPS = {
  'aria-label': DEFAULT_ARIA_LABEL,
  role: 'button',
  tabIndex: 0,
};

/**
 *
 * @param {!PreactDef.Renderable} child
 * @return {!PreactDef.Renderable}
 */
const CLONE_CHILD = (child) => cloneElement(child);

/**
 * @param {!BentoLightboxGalleryDef.WithBentoLightboxGalleryProps} props
 * @return {PreactDef.Renderable}
 */
export function WithBentoLightboxGallery({
  alt,
  'aria-label': ariaLabel,
  as: Comp = 'div',
  caption: captionProp,
  children,
  enableActivation = true,
  group,
  onMount,
  render: renderProp,
  srcset,
  ...rest
}) {
  const [genKey] = useState(generateLightboxItemKey);
  const {deregister, open, register} = useContext(BentoLightboxGalleryContext);
  const render = useCallback(() => {
    if (renderProp) {
      return renderProp();
    }
    if (children) {
      return Children.map(children, CLONE_CHILD);
    }
    return <Comp srcset={srcset} />;
  }, [children, renderProp, srcset, Comp]);

  const caption = useMemo(
    () => captionProp || alt || ariaLabel,
    [alt, ariaLabel, captionProp]
  );

  useLayoutEffect(() => {
    register(genKey, group, render, caption);
    return () => deregister(genKey, group);
  }, [caption, genKey, group, deregister, register, render]);

  useLayoutEffect(() => {
    return onMount?.(Number(genKey) - 1);
  }, [genKey, onMount]);

  const activationProps = useMemo(
    () =>
      enableActivation && {
        ...DEFAULT_ACTIVATION_PROPS,
        /* genKey is 1-indexed, gallery is 0-indexed */
        onClick: () => {
          open(Number(genKey) - 1, group);
        },
      },
    [enableActivation, genKey, group, open]
  );

  return (
    <Comp {...activationProps} srcset={srcset} {...rest}>
      {children}
    </Comp>
  );
}
