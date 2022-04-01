import objStr from 'obj-str';

import {Keys_Enum} from '#core/constants/key-codes';
import {mod} from '#core/math';
import {getValueForExpr} from '#core/types/object';
import {includes} from '#core/types/string';

import * as Preact from '#preact';
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from '#preact';
import {ContainWrapper} from '#preact/component';
import {useQuery} from '#preact/hooks/useQuery';
import {xhrUtils} from '#preact/utils/xhr';

import fuzzysearch from '#third_party/fuzzysearch';

import {useStyles} from './component.jss';
import {DEFAULT_ON_ERROR, DEFAULT_PARSE_JSON, TAG} from './constants';
import {getEnabledResults, getItemElement, getTextValue} from './helpers';
import {tokenPrefixMatch} from './token-prefix-match';
import {
  BentoAutocompleteProps,
  InputElement,
  Item,
  ItemTemplateProps,
  isValidFilterType,
} from './types';
import {useAutocompleteBinding} from './use-autocomplete-binding';

const INITIAL_ACTIVE_INDEX = -1;

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
  fetchJson = xhrUtils.fetchJson,
  filterValue = 'value',
  maxItems,
  highlightUserEntry = false,
  inline,
  itemTemplate,
  parseJson = DEFAULT_PARSE_JSON,
  suggestFirst = false,
  src,
}: BentoAutocompleteProps) {
  const elementRef = useRef<HTMLElement>(null);
  const containerId = useRef<string>(
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
  const [shouldFetchItems, setShouldFetchItems] = useState(false);

  const binding = useAutocompleteBinding(inline);

  const {data} = useQuery<Item[]>(
    async () => {
      const response = await fetchJson(src!);
      return parseJson(response);
    },
    {
      enabled: !!src && shouldFetchItems,
      initialData: items,
      onSettled: () => {
        setShouldFetchItems(false);
      },
      onError: (error) => {
        onError(error.message);
      },
    }
  );

  const toggleResults = useCallback((shouldDisplay: boolean) => {
    inputRef.current?.setAttribute('aria-expanded', shouldDisplay.toString());
    setAreResultsDisplayed(shouldDisplay);
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
    if (!inline && suggestFirst && filter !== 'prefix') {
      onError(`${TAG} "suggest-first" expected "filter" type "prefix".`);
      setShouldSuggestFirst(false);
    }
  }, [filter, onError, inline, suggestFirst]);

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
    if (filter === 'none') {
      return truncateToMaxItems(data || []);
    }

    const normalizedValue = substring.toLocaleLowerCase();

    const _filteredData = data?.filter((item: Item) => {
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
          return tokenPrefixMatch(item, normalizedValue);
        case 'fuzzy':
          return fuzzysearch(normalizedValue, item);
        case 'custom':
          throw new Error(`Filter not yet supported: ${filter}`);
        default:
          throw new Error(`Unexpected filter: ${filter}`);
      }
    });

    return truncateToMaxItems(_filteredData);
  }, [data, filter, substring, filterValue, onError, truncateToMaxItems]);

  const updateActiveItem = useCallback(
    (delta: number) => {
      const results = getEnabledResults(elementRef.current);
      if (delta === 0 || !showAutocompleteResults) {
        return;
      }
      const index = activeIndex + delta;
      const newActiveIndex = mod(index, results?.length || 0);
      const activeResult = results?.item(newActiveIndex);
      const newValue = getTextValue(activeResult as HTMLElement);

      setActiveIndex(newActiveIndex);
      inputRef.current?.setAttribute(
        'aria-activedescendant',
        getItemId(newActiveIndex)
      );

      setInputValue(newValue);
    },
    [activeIndex, getItemId, showAutocompleteResults, setInputValue]
  );

  const displayResults = useCallback(() => {
    toggleResults(true);
  }, [toggleResults]);

  const hideResults = useCallback(() => {
    // Reset the selection state if the items are hidden
    setActiveIndex(INITIAL_ACTIVE_INDEX);
    toggleResults(false);
  }, [toggleResults]);

  const maybeFetchAndAutocomplete = useCallback(
    async (element: InputElement) => {
      const isFirstInteraction =
        substring.length === 0 && element.value.length === 1;
      setShouldFetchItems(isFirstInteraction);

      const _substring = binding.getUserInputForUpdate(element);
      setSubstring(_substring);
      displayResults();
    },
    [binding, displayResults, substring]
  );

  const handleInput = useCallback(
    async (event: Event) => {
      if (binding.shouldAutocomplete(event.target as InputElement)) {
        return await maybeFetchAndAutocomplete(event.target as InputElement);
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
      switch (event.key) {
        case Keys_Enum.DOWN_ARROW: {
          event.preventDefault();
          if (showAutocompleteResults) {
            if (activeIndex === filteredData.length - 1) {
              return;
            }
            updateActiveItem(1);
          }
          break;
        }
        case Keys_Enum.ENTER: {
          hideResults();
          break;
        }
        case Keys_Enum.ESCAPE: {
          setInputValue(substring);
          hideResults();
          break;
        }
      }
    },
    [
      showAutocompleteResults,
      activeIndex,
      filteredData,
      updateActiveItem,
      hideResults,
      setInputValue,
      substring,
    ]
  );

  const handleItemClick = useCallback(
    (event: MouseEvent) => {
      const element = getItemElement(event.target as HTMLElement);
      if (!element?.hasAttribute('data-disabled')) {
        setInputValue(getTextValue(element));
      }
      // It isn't documented whether the input should stay open or closed
      // if the user clicks a disabled item. The demo closes the results after
      // clicking on any item.
      setAreResultsDisplayed(false);
    },
    [setInputValue, setAreResultsDisplayed]
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
      } else if (
        highlightUserEntry &&
        substring.length &&
        substring.length <= item.length &&
        filter === 'fuzzy'
      ) {
        const lowerCaseSubstring = substring.toLocaleLowerCase();
        return (
          <>
            {item.split('').map((char) => {
              if (lowerCaseSubstring.includes(char.toLocaleLowerCase())) {
                return <span class="autocomplete-partial">{char}</span>;
              }
              return char;
            })}
          </>
        );
      }
      return item;
    },
    [highlightUserEntry, substring, filter]
  );

  const getRenderedItem = useCallback(
    (item: Item, index: number) => {
      let component;
      if (typeof item === 'object') {
        if (!itemTemplate) {
          onError(`${TAG} data must provide template for non-string items.`);
          return null;
        }
        component = itemTemplate(item);
      } else {
        component = (
          <div data-value={item}>{getItemChildren(item as string)}</div>
        );
      }
      if (!isValidElement<ItemTemplateProps>(component)) {
        return component;
      }
      const isDisabled = component.props['data-disabled'];
      if (!component.props['data-value'] && !isDisabled) {
        onError(
          `${TAG} expected a "data-value" or "data-disabled" attribute on the rendered template item.`
        );
      }
      return cloneElement(component, {
        'aria-disabled': isDisabled,
        'aria-selected': activeIndex === index,
        class: objStr({
          'autocomplete-item': true,
          [classes.autocompleteItem]: true,
          [classes.autocompleteItemActive]: index === activeIndex,
        }),
        dir: 'auto',
        id: getItemId(index),
        key: item,
        onClick: handleItemClick,
        part: 'option',
        role: 'option',
        ...component.props,
      });
    },
    [
      itemTemplate,
      getItemId,
      activeIndex,
      classes,
      handleItemClick,
      getItemChildren,
      onError,
    ]
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
        id={containerId.current}
        class={classes.autocompleteResults}
        role="listbox"
        hidden={!showAutocompleteResults}
        // @ts-ignore
        part="results"
      >
        {filteredData.map((item: Item, index: number) =>
          getRenderedItem(item, index)
        )}
      </div>
    </ContainWrapper>
  );
}
