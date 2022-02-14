import * as Preact from '#preact';
import {forwardRef} from '#preact/compat';
import {propName} from '#preact/utils';

const CONTAIN = [
  null, // 0: none
  'paint', // 1: paint
  'layout', // 2: layout
  'content', // 3: content = layout + paint
  'size', // 4: size
  'size paint', // 5: size + paint
  'size layout', // 6: size + layout
  'strict', // 7: strict = size + layout + paint
];

const SIZE_CONTENT_STYLE = {
  'position': 'relative',
  'width': '100%',
  'height': '100%',
};

/**
 * The wrapper component that implements different "contain" parameters. This
 * most often indicates that the element's size doesn't depend on its children
 * (e.g. `contain:size`), but there might be other variances as well.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/contain
 *
 * Contain parameters:
 * - size: the element's size does not depend on its content.
 * - layout: nothing outside the element may affect its internal layout and
 * vice versa.
 * - paint: the element's content doesn't display outside the element's bounds.
 * @param {import('./types').ContainerWrapperComponentProps} props
 * @param {import('preact').RefObject<Element>} ref
 * @return {import('preact').VNode}
 */
function ContainWrapperWithRef(
  {
    as: Comp = 'div',
    children,
    contentAs: ContentComp = 'div',
    contentClassName,
    contentProps,
    contentRef,
    contentStyle,
    layout = false,
    paint = false,
    size = false,
    'style': style,
    wrapperClassName,
    wrapperStyle,
    [propName('class')]: className,
    ...rest
  },
  ref
) {
  // The formula: `size << 2 | layout << 1 | paint`.
  const containIndex = (size ? 4 : 0) + (layout ? 2 : 0) + (paint ? 1 : 0);
  return (
    <Comp
      {...rest}
      ref={ref}
      class={`${className || ''} ${wrapperClassName || ''}`.trim() || null}
      style={{
        ...style,
        ...wrapperStyle,
        contain: CONTAIN[containIndex],
      }}
    >
      <ContentComp
        {...contentProps}
        ref={contentRef}
        class={contentClassName}
        style={{
          ...(size && SIZE_CONTENT_STYLE),
          'overflow': paint ? 'hidden' : 'visible',
          ...contentStyle,
        }}
      >
        {children}
      </ContentComp>
    </Comp>
  );
}

const ContainWrapper = forwardRef(ContainWrapperWithRef);

export {ContainWrapper};
