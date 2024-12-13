import {Keys_Enum} from '#core/constants/key-codes';
import {querySelectorAllInSlot, scopedQuerySelectorAll} from '#core/dom/query';
import {mod} from '#core/math';
import {getValueForExpr} from '#core/types/object';
import {includes} from '#core/types/string';

import * as Preact from '#preact';
import {useCallback, useEffect, useMemo, useRef, useState} from '#preact';
import {ContainWrapper, useValueRef} from '#preact/component';
import {useQuery} from '#preact/hooks/useQuery';
import {xhrUtils} from '#preact/utils/xhr';

import fuzzysearch from '#third_party/fuzzysearch';

import {AutocompleteItem} from './autocomplete-item';
import {
  getEnabledResults,
  getItemElement,
  getSelectedObjectValue,
  getSelectedTextValue,
} from './helpers';
import {HighlightedText} from './highlighted-text';
import {tokenPrefixMatch} from './token-prefix-match';
import {useAutocompleteBinding} from './use-autocomplete-binding';

// @ts-ignore
import {addParamToUrl} from '../../../../../url';
import {useStyles} from '../component.jss';
import {
  BentoAutocompleteProps,
  InputElement,
  Item,
  ItemTemplateFn,
  OnSelectData,
  isValidFilterType,
} from '../types';

const INITIAL_ACTIVE_INDEX = -1;

const getItems = (response: {items: Item[]}) =>
  getValueForExpr(response, 'items');

export function BentoAutocomplete({
  children,
  filter = 'none',
  filterValue = 'value',
  highlightUserEntry = false,
  id,
  inline: inlineTrigger,
  itemTemplate,
  items = [],
  maxItems,
  minChars = 1,
  onError = () => {},
  onSelect = () => {},
  parseJson = getItems,
  prefetch = false,
  query,
  src,
  submitOnEnter = false,
  suggestFirst = false,
}: BentoAutocompleteProps) {
  const elementRef = useRef<HTMLElement>(null);
  const containerId = useValueRef<string>(
    id || `${Math.floor(Math.random() * 100)}_AMP_content_`
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [substring, setSubstring] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(INITIAL_ACTIVE_INDEX);
  const [areResultsDisplayed, setAreResultsDisplayed] =
    useState<boolean>(false);
  const [shouldSuggestFirst, setShouldSuggestFirst] =
    useState<boolean>(suggestFirst);
  const classes = useStyles();
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);
  // In order to enable refetching, we currently have to disable the request between
  // and re-enable it on user input.
  const [hasFetchedData, setHasFetchedData] = useState(false);

  const binding = useAutocompleteBinding(inlineTrigger);

  const url = useMemo(() => {
    if (src && query) {
      // Don't create an invalid URL if there is a query key but not a value
      return substring ? addParamToUrl(src, query, substring) : null;
    }
    return src;
  }, [src, substring, query]);

  const isFetchEnabled = useMemo(() => {
    if (url) {
      if (query) {
        return !hasFetchedData;
      }
      if (!hasFetchedInitialData) {
        return prefetch || areResultsDisplayed;
      }
    }
    return false;
  }, [
    url,
    hasFetchedInitialData,
    hasFetchedData,
    query,
    prefetch,
    areResultsDisplayed,
  ]);

  const shouldRefetch = useMemo(() => {
    return !!query;
  }, [query]);

  const {data} = useQuery<Item[]>(
    () => {
      return xhrUtils.fetchJson(url!).then((response) => parseJson(response));
    },
    {
      enabled: isFetchEnabled,
      initialData: items,
      onSettled: () => {
        setHasFetchedInitialData(true);
        setHasFetchedData(true);
      },
      onError: (error) => {
        onError(error.message);
      },
    }
  );

  const setInputValue = useCallback(
    (value: string) => {
      inputRef.current!.value = value;
    },
    [inputRef]
  );

  const toggleResults = useCallback((shouldDisplay: boolean) => {
    inputRef.current?.setAttribute('aria-expanded', shouldDisplay.toString());
    setAreResultsDisplayed(shouldDisplay);
  }, []);

  const resetActiveItem = useCallback(() => {
    setActiveIndex(INITIAL_ACTIVE_INDEX);
    inputRef.current?.removeAttribute('aria-activedescendant');
  }, [inputRef]);

  const displayResults = useCallback(() => {
    toggleResults(true);
  }, [toggleResults]);

  const hideResults = useCallback(() => {
    resetActiveItem();
    toggleResults(false);
  }, [toggleResults, resetActiveItem]);

  const resetUserInput = useCallback(() => {
    setInputValue(substring);
  }, [substring, setInputValue]);

  const selectItem = useCallback(
    (value: string, valueAsObject?: object | null) => {
      setInputValue(value);
      // Set the substring value to the user input value so
      // it can no longer be reset on ESCAPE.
      setSubstring(value);
      const selectData: OnSelectData = {
        value,
        ...(valueAsObject ? {valueAsObject} : {}),
      };
      onSelect(selectData);
      hideResults();
    },
    [onSelect, setInputValue, hideResults]
  );

  const getItemId = useCallback(
    (index: number) => {
      return `${containerId.current}-${index}`;
    },
    [containerId]
  );

  const getSingleInputOrTextarea = useCallback(
    (element: HTMLElement) => {
      const inputSelector = 'input,textarea';
      let possibleElements: NodeList | HTMLElement[] = scopedQuerySelectorAll(
        element,
        inputSelector
      );
      if (possibleElements.length === 0) {
        const slot = element.querySelector('slot');
        if (slot) {
          possibleElements = querySelectorAllInSlot(slot, inputSelector);
        }
      }
      if (possibleElements.length !== 1) {
        onError(`should contain exactly one <input> or <textarea> descendant.`);
        return;
      }
      return possibleElements[0] as HTMLElement;
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
              `requires the "type" attribute to be "text" or "search" if present on <input>.`
            );
          }
        }
        inputElement.classList.add(classes.input);
        inputElement.setAttribute('dir', 'auto');
        inputElement.setAttribute('aria-autocomplete', 'both');
        inputElement.setAttribute('aria-controls', containerId.current!);
        inputElement.setAttribute('aria-expanded', 'false');
        if (inputElement.tagName === 'INPUT') {
          inputElement.setAttribute('role', 'combobox');
        } else {
          inputElement.setAttribute('role', 'textbox');
        }

        inputRef.current = inputElement as HTMLInputElement;
      }
    },
    [getSingleInputOrTextarea, onError, classes.input, containerId]
  );

  const validateProps = useCallback(() => {
    if (!isValidFilterType(filter)) {
      onError(`Unexpected filter: ${filter}.`);
    }
    if (!inlineTrigger && suggestFirst && filter !== 'prefix') {
      onError(`"suggest-first" expected "filter" type "prefix".`);
      setShouldSuggestFirst(false);
    }
  }, [filter, onError, inlineTrigger, suggestFirst]);

  const showAutocompleteResults = useMemo(() => {
    if (!areResultsDisplayed || data?.length === 0) {
      return false;
    }
    return substring.length >= minChars;
  }, [data, substring, minChars, areResultsDisplayed]);

  const truncateToMaxItems = useCallback(
    (data: Item[] = []) => {
      if (maxItems && maxItems < data.length) {
        return data.slice(0, maxItems);
      }
      return data;
    },
    [maxItems]
  );

  const filteredData = useMemo(() => {
    const normalizedValue = substring.toLocaleLowerCase();

    const allFilteredData = data?.filter((item: Item) => {
      if (typeof item === 'object') {
        item = getValueForExpr(item, filterValue);
      }
      if (typeof item !== 'string') {
        onError(`data property "${filterValue}" must map to string type.`);
        return;
      }
      item = item.toLocaleLowerCase();

      switch (filter) {
        case 'none':
          return true;
        case 'substring':
          return includes(item, normalizedValue);
        case 'prefix':
          return item.startsWith(normalizedValue);
        case 'token-prefix':
          return tokenPrefixMatch(item, normalizedValue);
        case 'fuzzy':
          return fuzzysearch(normalizedValue, item);
        case 'custom':
          throw new Error(`Filter not yet supported: ${filter}`);
        default:
          throw new Error(`Unexpected filter: ${filter}`);
      }
    });

    return truncateToMaxItems(allFilteredData);
  }, [data, filter, substring, filterValue, onError, truncateToMaxItems]);

  const updateActiveItem = useCallback(
    (delta: number) => {
      const keyUpWhenNoneActive =
        activeIndex === INITIAL_ACTIVE_INDEX && delta < 0;
      const index = keyUpWhenNoneActive ? delta : activeIndex + delta;
      const enabledResults = getEnabledResults(elementRef.current);
      if (delta === 0 || !showAutocompleteResults) {
        return;
      }
      const modifiedIndex = mod(index, enabledResults?.length || 0);
      const activeResult = enabledResults?.item(modifiedIndex);

      setActiveIndex(modifiedIndex);
      inputRef.current?.setAttribute('aria-activedescendant', getItemId(index));

      setInputValue(getSelectedTextValue(activeResult as HTMLElement));
    },
    [activeIndex, getItemId, showAutocompleteResults, setInputValue]
  );

  const maybeFetchAndAutocomplete = useCallback(
    (element: InputElement) => {
      if (shouldRefetch) {
        setHasFetchedData(false);
      }
      setSubstring(binding.getUserInputForUpdate(element));
      displayResults();
    },
    [shouldRefetch, displayResults, binding]
  );

  const handleInput = useCallback(
    (event: Event) => {
      const element = event.target as InputElement;
      if (binding.shouldAutocomplete(element)) {
        maybeFetchAndAutocomplete(element);
      }
    },
    [binding, maybeFetchAndAutocomplete]
  );

  const handleFocus = useCallback(() => {
    if (binding.shouldShowOnFocus) {
      displayResults();
    }
  }, [displayResults, binding]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const hasActiveItem = activeIndex > INITIAL_ACTIVE_INDEX;

      switch (event.key) {
        case Keys_Enum.DOWN_ARROW: {
          event.preventDefault();
          const results = getEnabledResults(elementRef.current) || [];
          if (activeIndex === results.length - 1) {
            resetUserInput();
            resetActiveItem();
            return;
          }
          updateActiveItem(1);
          break;
        }
        case Keys_Enum.UP_ARROW: {
          event.preventDefault();
          if (activeIndex === 0) {
            resetUserInput();
            resetActiveItem();
            return;
          }
          updateActiveItem(-1);
          break;
        }
        case Keys_Enum.ENTER: {
          const hasActiveItem = activeIndex > INITIAL_ACTIVE_INDEX;
          if (
            binding.shouldPreventDefaultOnEnter(hasActiveItem, submitOnEnter)
          ) {
            event.preventDefault();
          }
          selectItem(inputRef.current!.value);
          break;
        }
        case Keys_Enum.ESCAPE: {
          resetUserInput();
          hideResults();
          break;
        }
        case Keys_Enum.TAB: {
          if (areResultsDisplayed && hasActiveItem) {
            event.preventDefault();
            selectItem(inputRef.current!.value);
          }
          break;
        }
      }
    },
    [
      activeIndex,
      updateActiveItem,
      resetUserInput,
      hideResults,
      resetActiveItem,
      selectItem,
      binding,
      submitOnEnter,
      areResultsDisplayed,
    ]
  );

  const handleMousedown = useCallback(
    (event: MouseEvent) => {
      const element = getItemElement(event.target as HTMLElement);
      if (!element?.hasAttribute('data-disabled')) {
        const value = getSelectedTextValue(element);
        const objectValue = getSelectedObjectValue(element);
        selectItem(value, objectValue);
      }
    },
    [selectItem]
  );

  const getTextForStringItem = useCallback(
    (item: string) => {
      if (highlightUserEntry && substring.length > 0) {
        if (includes(item.toLocaleLowerCase(), substring.toLocaleLowerCase())) {
          return <HighlightedText text={item} substring={substring} />;
        }
        if (filter === 'fuzzy') {
          return <HighlightedText text={item} substring={substring} fuzzy />;
        }
      }
      return item;
    },
    [highlightUserEntry, substring, filter]
  );

  const getItemTemplate = useCallback<(item: Item) => ItemTemplateFn>(
    (item: Item) => {
      if (typeof item === 'object') {
        if (!itemTemplate) {
          onError(`data must provide template for non-string items.`);
          return () => null;
        }
        return itemTemplate;
      } else {
        return (item: string) => {
          return <div data-value={item}>{getTextForStringItem(item)}</div>;
        };
      }
    },
    [itemTemplate, getTextForStringItem, onError]
  );

  useEffect(() => {
    if (shouldSuggestFirst && activeIndex === INITIAL_ACTIVE_INDEX) {
      updateActiveItem(1);
    }
  }, [activeIndex, updateActiveItem, shouldSuggestFirst]);

  useEffect(() => {
    setupInputElement(elementRef.current!);
    validateProps();

    inputRef.current?.addEventListener('input', handleInput);
    inputRef.current?.addEventListener('keydown', handleKeyDown);
    inputRef.current?.addEventListener('focus', handleFocus);
    inputRef.current?.addEventListener('blur', hideResults);

    return () => {
      inputRef.current?.removeEventListener('input', handleInput);
      inputRef.current?.removeEventListener('keydown', handleKeyDown);
      inputRef.current?.removeEventListener('focus', handleFocus);
      inputRef.current?.removeEventListener('blur', hideResults);
    };
  }, [
    setupInputElement,
    validateProps,
    handleInput,
    handleKeyDown,
    handleFocus,
    hideResults,
    inputRef,
  ]);

  return (
    <ContainWrapper
      ref={elementRef}
      class={classes.autocomplete}
      // @ts-ignore
      part="autocomplete"
    >
      {children}
      <div
        ref={containerRef}
        id={containerId.current!}
        class={classes.autocompleteResults}
        role="listbox"
        hidden={!showAutocompleteResults}
        // @ts-ignore
        part="results"
      >
        {filteredData.map((item: Item, index: number) => {
          const id = getItemId(index);
          return (
            <AutocompleteItem
              key={id}
              item={item}
              itemTemplate={getItemTemplate(item)}
              id={id}
              selected={activeIndex === index}
              onError={onError}
              onMouseDown={handleMousedown}
            />
          );
        })}
      </div>
    </ContainWrapper>
  );
}
