import * as Preact from '#preact';
import {forwardRef} from '#preact/compat';
import {propName} from '#preact/utils';

/**
 * The wrapper component provides the canonical wrapper for components whose
 * size depends on the children. This is often the opposite of the
 * `ContainWrapper`.
 * @param {import('./types').WrapperComponentProps} props
 * @param {import('preact').RefObject<Element>} ref
 * @return {import('preact').VNode}
 */
function WrapperWithRef(
  {
    as: Comp = 'div',
    children,
    'style': style,
    wrapperClassName,
    wrapperStyle,
    [propName('class')]: className,
    ...rest
  },
  ref
) {
  return (
    <Comp
      {...rest}
      ref={ref}
      class={`${className || ''} ${wrapperClassName || ''}`.trim() || null}
      style={{...style, ...wrapperStyle}}
    >
      {children}
    </Comp>
  );
}

const Wrapper = forwardRef(WrapperWithRef);

export {Wrapper};
