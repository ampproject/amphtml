import {Shim} from '#bento/components/bento-mega-menu/1.0/component/Shim';

import * as Preact from '#preact';
import {useLayoutEffect, useRef} from '#preact';
import {useAttributeObserver} from '#preact/hooks/useMutationObserver';
import {FC} from '#preact/types';

import {Content} from './Content';
import {Item, useMegaMenuItem} from './Item';
import {Title} from './Title';

export const BentoItem: FC = ({children}) => {
  return (
    <Item>
      <SlottedDomWrapper>{children}</SlottedDomWrapper>
    </Item>
  );
};

/**
 * Renders the slot, and uses a bunch of shims to control the slotted (light DOM) elements
 */
const SlottedDomWrapper: FC = ({children}) => {
  const {actions, isOpen} = useMegaMenuItem();

  const ref = useRef<HTMLDivElement>(null);

  // Capture all the Light DOM elements:
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const contentsRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const slot = ref.current!.querySelector('slot')!;
    const section = slot.assignedElements()[0];
    const {firstElementChild: header, lastElementChild: contents} = section;
    sectionRef.current = section as HTMLElement;
    contentsRef.current = contents as HTMLElement;
    titleRef.current = header as HTMLElement;
  }, []);

  // Watch the section's 'expanded' attribute:
  useAttributeObserver(sectionRef, 'expanded', (attrValue) => {
    const expanded = attrValue !== null;
    const shouldToggle = (expanded && !isOpen) || (!expanded && isOpen);
    if (shouldToggle) {
      actions.toggle();
    }
  });

  const sectionAttributes = {
    expanded: isOpen,
  };
  // Render the slot, Title, and Content elements.
  // Render these using Shims, to control the Light DOM elements
  return (
    <div ref={ref}>
      {children}
      <Shim elementRef={sectionRef} {...sectionAttributes} />
      <Title as={Shim} elementRef={titleRef} />
      <Content as={Shim} elementRef={contentsRef} />
    </div>
  );
};
