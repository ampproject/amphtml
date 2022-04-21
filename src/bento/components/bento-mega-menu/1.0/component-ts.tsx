import objStr from 'obj-str';

import {matches} from '#core/dom/query';

import * as Preact from '#preact';
import {useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

import {useStyles} from './component.jss';

const TRIGGER = 'button, [role=button]';
const DIALOG = 'dialog, [role=dialog]';

function findSibling(element: HTMLElement, selector: string) {
  if (!element.parentElement) {
    return null;
  }
  return Array.from(element.parentElement.children).find((el) =>
    matches(el as HTMLElement, selector)
  );
}

const OPEN_CLASS = 'open';
const DEFAULT_DIALOG_ID = 'bento-mega-menu__active-dialog';

type AriaAttributes = {
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-haspopup': 'dialog';
  'aria-modal': boolean;
};

function setAttributes(
  element: Element,
  attributes: {[A in keyof AriaAttributes]?: null | AriaAttributes[A]}
) {
  (Object.keys(attributes) as Array<keyof typeof attributes>).forEach(
    (attr) => {
      const value = attributes[attr];
      if (value === undefined || value === null || value === false) {
        element.removeAttribute(attr);
      } else {
        element.setAttribute(attr, value === true ? '' : value);
      }
    }
  );
}

/**
 * @param {!BentoMegaMenu.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoMegaMenu({children, ...rest}) {
  const styles = useStyles();

  const [isOpen, setOpen] = useState(false);

  const closeLastDialog = useRef<() => void>(null);

  const handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const trigger = target.closest(TRIGGER) as HTMLElement;
    const dialog = findSibling(trigger, DIALOG);

    if (trigger && dialog) {
      ev.preventDefault();

      const isAlreadyOpen = trigger.classList.contains(OPEN_CLASS);

      if (isAlreadyOpen) {
        closeLastDialog.current?.();
        setOpen(false);
      } else {
        closeLastDialog.current?.();

        trigger.classList.add(OPEN_CLASS);
        dialog.classList.add(OPEN_CLASS);

        if (!dialog.id) {
          dialog.id = DEFAULT_DIALOG_ID;
        }
        setAttributes(trigger, {
          'aria-expanded': true,
          'aria-controls': dialog.id,
          'aria-haspopup': 'dialog',
        });
        setAttributes(dialog, {
          'aria-modal': true,
        });

        closeLastDialog.current = () => {
          trigger.classList.remove(OPEN_CLASS);
          dialog.classList.remove(OPEN_CLASS);
          if (dialog.id === DEFAULT_DIALOG_ID) {
            dialog.id = '';
          }
          setAttributes(trigger, {
            'aria-expanded': null,
            'aria-controls': null,
            'aria-haspopup': null,
          });
          setAttributes(dialog, {
            'aria-modal': null,
          });
        };

        setOpen(true);
      }
    }
  };

  return (
    <ContainWrapper {...rest}>
      <div class={styles.content} onClick={handleClick}>
        {children}
      </div>
      <div
        class={objStr({
          [styles.mask]: true,
          [OPEN_CLASS]: isOpen,
        })}
        aria-hidden
      />
    </ContainWrapper>
  );
}
