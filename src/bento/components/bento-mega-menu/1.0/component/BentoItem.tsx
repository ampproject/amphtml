import {Shim} from '#bento/components/bento-mega-menu/1.0/component/Shim';
import {useAttributeObserver} from '#bento/components/bento-mega-menu/1.0/component/UseMutationObserver';

import * as Preact from '#preact';
import {useLayoutEffect, useRef} from '#preact';
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
  const itemRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const contentsRef = useRef<HTMLElement>(null);
  // Capture all the Light DOM elements:
  useLayoutEffect(() => {
    const slot = ref.current!.querySelector('slot');
    const section = slot!.assignedElements()[0];
    const {firstElementChild: header, lastElementChild: contents} = section;
    itemRef.current = section as HTMLElement;
    contentsRef.current = contents as HTMLElement;
    headerRef.current = header as HTMLElement;
  }, []);

  const {actions, isOpen} = useMegaMenuItem();
  useAttributeObserver(itemRef, 'expanded', (attrName, attrValue) => {
    const expanded = attrValue !== null;
    const shouldToggle = (expanded && !isOpen) || (!expanded && isOpen);
    if (shouldToggle) {
      actions.toggle();
    }
  });

  return (
    <div ref={ref}>
      {slot}
      <ItemShim elementRef={itemRef} expanded={isOpen} />
      <Title as={HeaderShim} elementRef={headerRef} />
      <Content as={ContentsShim} elementRef={contentsRef} />
    </div>
  );
};

const ItemShim = Shim;
const HeaderShim = Shim;
const ContentsShim = Shim;
