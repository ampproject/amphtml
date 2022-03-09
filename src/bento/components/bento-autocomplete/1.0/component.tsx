import objStr from 'obj-str';
import {ComponentChildren} from 'preact';

import {Keys_Enum} from '#core/constants/key-codes';
import {mod} from '#core/math';
import {getValueForExpr} from '#core/types/object';
import {includes} from '#core/types/string';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {ContainWrapper} from '#preact/component';

import fuzzysearch from '#third_party/fuzzysearch';

import {useStyles} from './component.jss';

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
  maxItems?: number;
  highlightUserEntry?: boolean;
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
  items: data = [],
  filterValue = 'value',
  maxItems,
  highlightUserEntry = false,
}: BentoAutocompleteProps) {
  const elementRef = useRef<HTMLElement>(null);
  const containerId = useRef<string>(
    id || `${Math.floor(Math.random() * 100)}_AMP_content_`
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [substring, setSubstring] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [showOptions, _setShowOptions] = useState<boolean>(false);
  const classes = useStyles();

  const setShowOptions = useCallback((shouldDisplay: boolean) => {
    if (!shouldDisplay) {
      // Reset the selection state
      setActiveIndex(-1);
    }
    inputRef.current?.setAttribute('aria-expanded', shouldDisplay.toString());
    _setShowOptions(shouldDisplay);
  }, []);

  const setInputValue = useCallback((value: string) => {
    inputRef.current!.value = value;
  }, []);

  const getItemId = useCallback(
    (index: number) => {
      return `${id}-${index}`;
    },
    [id]
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
        inputElement.classList.add(classes.input);
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

        inputRef.current = inputElement as HTMLInputElement;
      }
    },
    [getSingleInputOrTextarea, onError, classes.input]
  );

  const validateProps = useCallback(() => {
    if (!isValidFilterType(filter)) {
      onError(`Unexpected filter: ${filter}.`);
    }
  }, [filter, onError]);

  const showAutocompleteOptions = useMemo(() => {
    if (!showOptions || data?.length === 0) {
      return false;
    }
    return substring.length >= minChars;
  }, [data, substring, minChars, showOptions]);

  const truncateToMaxItems = useCallback(
    (data: Item[]) => {
      if (maxItems && maxItems < data.length) {
        return data.slice(0, maxItems);
      }
      return data;
    },
    [maxItems]
  );

  const filteredData = useMemo(() => {
    if (filter === 'none') {
      return truncateToMaxItems(data);
    }

    const normalizedValue = substring.toLocaleLowerCase();

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

    return truncateToMaxItems(filteredData);
  }, [data, filter, substring, filterValue, onError, truncateToMaxItems]);

  const handleInput = useCallback(
    (event: Event) => {
      const inputValue = (event.target as HTMLInputElement).value;

      // TODO: Use logic to derive this from the binding
      setSubstring(inputValue);
      setShowOptions(true);
    },
    [setShowOptions]
  );

  const updateActiveItem = useCallback(
    (delta: number) => {
      if (delta === 0 || !showAutocompleteOptions) {
        return;
      }
      const index = activeIndex + delta;
      const newActiveIndex = mod(index, filteredData.length);
      const newValue = filteredData[newActiveIndex];

      setActiveIndex(newActiveIndex);
      inputRef.current?.setAttribute(
        'aria-activedescendant',
        getItemId(newActiveIndex)
      );

      setInputValue(newValue as string);
    },
    [
      activeIndex,
      filteredData,
      getItemId,
      showAutocompleteOptions,
      setInputValue,
    ]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case Keys_Enum.DOWN_ARROW: {
          event.preventDefault();
          if (showAutocompleteOptions) {
            if (activeIndex === filteredData.length - 1) {
              return;
            }
            updateActiveItem(1);
          }
          break;
        }
        case Keys_Enum.ENTER: {
          setShowOptions(false);
          break;
        }
        case Keys_Enum.ESCAPE: {
          setInputValue(substring);
          setShowOptions(false);
          break;
        }
      }
    },
    [
      showAutocompleteOptions,
      activeIndex,
      filteredData,
      updateActiveItem,
      setShowOptions,
      setInputValue,
      substring,
    ]
  );

  const getItemElement: (element: HTMLElement | null) => HTMLElement | null =
    useCallback((element) => {
      if (!element) {
        return null;
      }
      if (element.getAttribute('role') === 'option') {
        return element as HTMLDivElement;
      }
      return getItemElement(element.parentElement);
    }, []);

  const handleItemClick = useCallback(
    (event: MouseEvent) => {
      const element = getItemElement(event.target as HTMLElement);
      const textValue =
        element?.getAttribute('data-value') || element?.textContent || '';

      setInputValue(textValue);
      setActiveIndex(-1);
      setShowOptions(false);
    },
    [setInputValue, setShowOptions, getItemElement]
  );

  const getItemChildren = useCallback(
    (item: string) => {
      const lowerCaseItem = item.toLocaleLowerCase();
      const lowerCaseSubstring = substring.toLocaleLowerCase();
      if (
        highlightUserEntry &&
        substring.length &&
        substring.length <= item.length &&
        includes(lowerCaseItem, lowerCaseSubstring)
      ) {
        const substringStart = lowerCaseItem.indexOf(lowerCaseSubstring);
        const substringEnd = substringStart + lowerCaseSubstring.length;
        return (
          <>
            {item.slice(0, substringStart)}
            {/* TODO: Add JSS style */}
            <span class="autocomplete-partial">
              {item.slice(substringStart, substringEnd)}
            </span>
            {item.slice(substringEnd, item.length)}
          </>
        );
      }
      return item;
    },
    [highlightUserEntry, substring]
  );

  useEffect(() => {
    setupInputElement(elementRef.current!);
    validateProps();

    inputRef.current?.addEventListener('input', handleInput);
    inputRef.current?.addEventListener('keydown', handleKeyDown);

    return () => {
      inputRef.current?.removeEventListener('input', handleInput);
      inputRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [setupInputElement, validateProps, handleInput, handleKeyDown]);

  return (
    <ContainWrapper ref={elementRef} class={classes.autocomplete}>
      {children}
      <div
        ref={containerRef}
        id={containerId.current}
        class={classes.autocompleteResults}
        role="listbox"
        hidden={!showAutocompleteOptions}
      >
        {filteredData.map((item: Item, index: number) => {
          if (typeof item === 'string') {
            return (
              <div
                key={item}
                data-value={item}
                id={getItemId(index)}
                class={objStr({
                  [classes.autocompleteItem]: true,
                  [classes.autocompleteItemActive]: index === activeIndex,
                })}
                role="option"
                dir="auto"
                aria-selected={activeIndex === index}
                onClick={handleItemClick}
              >
                {getItemChildren(item)}
              </div>
            );
          }
        })}
      </div>
    </ContainWrapper>
  );
}
