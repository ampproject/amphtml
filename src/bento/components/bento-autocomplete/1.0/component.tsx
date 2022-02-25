import {ComponentChildren} from 'preact';

import {Keys_Enum} from '#core/constants/key-codes';
import {mod} from '#core/math';
import {getValueForExpr} from '#core/types/object';
import {includes} from '#core/types/string';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

import fuzzysearch from '#third_party/fuzzysearch';

const filterTypes = [
  'substring',
  'prefix',
  'token-prefix',
  'fuzzy',
  'custom',
  'none',
] as const;

type FilterType = typeof filterTypes[number];

function isValidFilterType(filterType: any): filterType is FilterType {
  return filterTypes.includes(filterType);
}

type Item = string | object;
interface BentoAutocompleteProps {
  id?: string;
  onError?: (message: string) => void;
  children?: ComponentChildren;
  filter?: FilterType;
  minChars?: number;
  items?: Item[];
  filterValue?: string;
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
  filter = 'none',
  minChars = 1,
  items = [],
  filterValue = 'value',
}: BentoAutocompleteProps) {
  const elementRef = useRef<HTMLElement>(null);
  const containerId = useRef<string>(
    id || `${Math.floor(Math.random() * 100)}_AMP_content_`
  );
  const inputRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [data, setData] = useState<Item[]>(items);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

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

        inputRef.current = inputElement as HTMLElement;
      }
    },
    [getSingleInputOrTextarea, onError]
  );

  const validateProps = useCallback(() => {
    if (!isValidFilterType(filter)) {
      onError(`Unexpected filter: ${filter}.`);
    }
  }, [filter, onError]);

  const showAutocompleteOptions = useMemo(() => {
    return (data?.length && inputValue.length >= minChars) || false;
  }, [data, inputValue, minChars]);

  const filteredData = useMemo(() => {
    if (filter === 'none') {
      return data;
    }

    const normalizedValue = inputValue.toLocaleLowerCase();

    const filteredData = data.filter((item: Item) => {
      if (typeof item === 'object') {
        item = getValueForExpr(item, filterValue);
      }
      if (typeof item !== 'string') {
        onError(
          `${TAG} data property "${filterValue}" must map to string type.`
        );
        // Return default value
        return;
      }
      item = item.toLocaleLowerCase();

      switch (filter) {
        case 'substring':
          return includes(item, normalizedValue);
        case 'prefix':
          return item.startsWith(normalizedValue);
        case 'token-prefix':
          // TODO
          return [];
        case 'fuzzy':
          return fuzzysearch(normalizedValue, item);
        case 'custom':
          throw new Error(`Filter not yet supported: ${filter}`);
        default:
          throw new Error(`Unexpected filter: ${filter}`);
      }
    });
    return filteredData;
  }, [data, filter, inputValue, filterValue, onError]);

  // const areResultsDisplayed = useMemo(() => {
  //   return (
  //     !containerRef.current?.hasAttribute('hidden') &&
  //     containerRef.current?.children.length > 0
  //   );
  // }, []);

  const handleInput = useCallback((event: Event) => {
    const _inputValue = (event.target as HTMLInputElement).value;

    // TODO: Use logic to derive this from the binding
    setInputValue(_inputValue);
  }, []);

  // const enabledItems = useMemo(() => {
  //   return containerRef.current?.querySelectorAll(
  //     '.i-amphtml-autocomplete-item:not([data-disabled])'
  //   );
  // }, []);

  // const updateActiveItem = useCallback(
  //   (delta: number) => {
  //     if (delta === 0 || !areResultsDisplayed || enabledItems.length === 0) {
  //       return;
  //     }
  //     const index = activeIndex + delta;
  //     const newActiveIndex = mod(index, enabledItems.length);
  //     const newActiveElement = enabledItems[newActiveIndex];
  //     const newValue = newActiveElement.getAttribute('data-value');

  //     inputRef.current.value = newValue;
  //   },
  //   [areResultsDisplayed, enabledItems, activeIndex]
  // );

  // const handleKeyDown = useCallback(
  //   (event: KeyboardEvent) => {
  //     switch (event.key) {
  //       case Keys_Enum.DOWN_ARROW:
  //         event.preventDefault();
  //         // This is returning false
  //         if (areResultsDisplayed) {
  //           if (activeIndex === enabledItems.length - 1) {
  //             return;
  //           }
  //           updateActiveItem(1);
  //         }
  //     }
  //   },
  //   [areResultsDisplayed, enabledItems, updateActiveItem, activeIndex]
  // );

  useEffect(() => {
    setupInputElement(elementRef.current!);
    validateProps();

    inputRef.current?.addEventListener('input', handleInput);
    // inputRef.current?.addEventListener('keydown', handleKeyDown);

    return () => {
      inputRef.current?.removeEventListener('input', handleInput);
      // inputRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [setupInputElement, validateProps, handleInput]);

  return (
    <ContainWrapper ref={elementRef}>
      {children}
      <div
        ref={containerRef}
        id={containerId.current}
        class="i-amphtml-autocomplete-results"
        role="listbox"
        hidden={!showAutocompleteOptions}
      >
        {filteredData.map((item: Item) => {
          if (typeof item === 'string') {
            return (
              <div
                key={item}
                class="i-amphtml-autocomplete-item"
                role="option"
                data-value={item}
                dir="auto"
              >
                {item}
              </div>
            );
          }
        })}
      </div>
    </ContainWrapper>
  );
}
