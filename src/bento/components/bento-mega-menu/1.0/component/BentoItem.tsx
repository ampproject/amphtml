import {Shim} from '#bento/components/bento-mega-menu/1.0/component/Shim';

import * as Preact from '#preact';
import {useLayoutEffect, useRef} from '#preact';
import {useAttributeObserver} from '#preact/hooks/useMutationObserver';
import {FC} from '#preact/types';

import {Content} from './Content';
import {ItemProvider, useMegaMenuItem} from './Item';
import {Title} from './Title';

export const BentoItem: FC = ({children}) => {
  return (
    <ItemProvider>
      <SlottedDomWrapper>{children}</SlottedDomWrapper>
    </ItemProvider>
  );
};

const SlottedDomWrapper: FC = ({children: slot}) => {
  const ref = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const contentsRef = useRef<HTMLElement>(null);
  // Capture all the Light DOM elements:
  useLayoutEffect(() => {
    const slot = ref.current!.querySelector('slot');
    const section = slot!.assignedElements()[0];
    const {firstElementChild: header, lastElementChild: contents} = section;
    sectionRef.current = section as HTMLElement;
    contentsRef.current = contents as HTMLElement;
    titleRef.current = header as HTMLElement;
  }, []);

  const {actions, isOpen} = useMegaMenuItem();
  useAttributeObserver(sectionRef, 'expanded', (attrName, attrValue) => {
    const expanded = attrValue !== null;
    const shouldToggle = (expanded && !isOpen) || (!expanded && isOpen);
    if (shouldToggle) {
      actions.toggle();
    }
  });

  const sectionAttributes = {
    expanded: isOpen,
  };

  return (
    <div ref={ref}>
      {slot}
      <Shim elementRef={sectionRef} {...sectionAttributes} />
      <Title as={Shim} elementRef={titleRef} />
      <Content as={Shim} elementRef={contentsRef} />
    </div>
  );
};
