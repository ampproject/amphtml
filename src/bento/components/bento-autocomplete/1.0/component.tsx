import {ComponentChildren} from 'preact';

import * as Preact from '#preact';
import {useCallback, useEffect, useRef} from '#preact';
import {ContainWrapper} from '#preact/component';

interface BentoAutocompleteProps {
  id?: string;
  onError?: (message: string) => void;
  children?: ComponentChildren;
}

const DEFAULT_ON_ERROR = (message: string) => {
  throw new Error(message);
};

const TAG = 'bento-autocomplete';

/**
 * @param {!BentoAutocomplete.Props} props
 * @return {PreactDef.Renderable}
 */
export function BentoAutocomplete({
  id,
  children,
  onError = DEFAULT_ON_ERROR,
}: BentoAutocompleteProps) {
  const elementRef = useRef();
  const containerId = useRef<string>(
    id || `${Math.floor(Math.random() * 100)}_AMP_content_`
  );

  const getSingleInputOrTextarea = useCallback(
    (element: HTMLElement) => {
      const possibleElements = element.querySelectorAll('input,textarea');
      if (possibleElements.length !== 1) {
        onError(
          `${TAG} should contain exactly one <input> or <textarea> descendant.`
        );
        return;
      }
      return possibleElements[0];
    },
    [onError]
  );

  const setupInputElement = useCallback(
    (element: HTMLElement) => {
      const inputElement = getSingleInputOrTextarea(element);
      if (inputElement) {
        if (inputElement.hasAttribute('type')) {
          const inputType = inputElement.getAttribute('type');
          if (inputType !== 'text' && inputType !== 'search') {
            onError(
              `${TAG} requires the "type" attribute to be "text" or "search" if present on <input>.`
            );
          }
        }
        inputElement.setAttribute('dir', 'auto');
        inputElement.setAttribute('aria-autocomplete', 'both');
        inputElement.setAttribute('aria-controls', containerId.current);
        inputElement.setAttribute('aria-haspopup', 'listbox');
        inputElement.setAttribute('aria-owns', containerId.current);
        inputElement.setAttribute('aria-expanded', 'false');
        if (inputElement.tagName === 'INPUT') {
          inputElement.setAttribute('role', 'combobox');
          inputElement.setAttribute('aria-multiline', 'false');
        } else {
          inputElement.setAttribute('role', 'textbox');
        }
      }
    },
    [getSingleInputOrTextarea, onError]
  );

  useEffect(() => {
    setupInputElement(elementRef.current);
  }, [setupInputElement]);

  return <ContainWrapper ref={elementRef}>{children}</ContainWrapper>;
}
