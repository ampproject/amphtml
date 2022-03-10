import {ownProperty} from '#core/types/object';

import {useCallback, useMemo} from '#preact';

interface AutocompleteBindingConfig {
  type: 'inline' | 'single';
  trigger?: string;
}

type InputType = HTMLInputElement | HTMLTextAreaElement;

interface AutocompleteBinding {
  shouldAutocomplete(inputEl: InputType): boolean;
}

type BindingType = (config: AutocompleteBindingConfig) => AutocompleteBinding;

const useInlineBinding: BindingType = (config) => {
  const {trigger} = config;

  const regex = useMemo(() => {
    const delimiter = trigger.replace(/([()[{*+.$^\\|?])/g, '\\$1');
    const pattern = `((${delimiter}|^${delimiter})(\\w+)?)`;
    return new RegExp(pattern, 'gm');
  }, [trigger]);

  const getClosestPriorMatch = useCallback(
    (inputEl: InputType) => {
      if (!regex) {
        return null;
      }

      const {selectionStart: cursor, value} = inputEl;
      let match, lastMatch;

      while ((match = regex.exec(value)) !== null) {
        if (match[0].length + ownProperty(match, 'index') > cursor) {
          break;
        }
        lastMatch = match;
      }

      if (
        !lastMatch ||
        lastMatch[0].length + ownProperty(lastMatch, 'index') < cursor
      ) {
        return null;
      }
      return lastMatch;
    },
    [regex]
  );

  const shouldAutocomplete = useCallback(
    (inputEl: HTMLInputElement | HTMLTextAreaElement) => {
      const match = getClosestPriorMatch(inputEl);
      return !!match;
    },
    [getClosestPriorMatch]
  );

  return {
    shouldAutocomplete,
  };
};

const useSingleBinding: BindingType = (config) => {
  return {
    shouldAutocomplete: () => true,
  };
};

const useBinding: BindingType = (config) => {
  const inlineBinding = useInlineBinding(config);
  const singleBinding = useSingleBinding(config);

  if (config.type === 'inline' && !config.trigger) {
    // show warning
  }

  if (config.type === 'inline') {
    return inlineBinding;
  }
  return singleBinding;
};

export default useBinding;
