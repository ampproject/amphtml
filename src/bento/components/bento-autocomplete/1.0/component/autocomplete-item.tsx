import objStr from 'obj-str';

import {cloneElement, isValidElement} from '#preact';

import {useStyles} from '../component.jss';
import {AutocompleteItemProps, ItemNode, ItemTemplateProps} from '../types';

export function AutocompleteItem({
  id,
  item,
  itemTemplate,
  onError = () => {},
  onMouseDown = () => {},
  selected = false,
}: AutocompleteItemProps) {
  const classes = useStyles();

  const component: ItemNode = itemTemplate(item);

  if (!isValidElement<ItemTemplateProps>(component)) {
    return component;
  }
  const isDisabled = component.props['data-disabled'];
  if (!component.props['data-value'] && !isDisabled) {
    onError(
      `expected a "data-value" or "data-disabled" attribute on the rendered template item.`
    );
  }
  return cloneElement(component, {
    'aria-disabled': isDisabled,
    'aria-selected': selected,
    class: objStr({
      'autocomplete-item': true,
      [classes.autocompleteItem]: true,
      [classes.autocompleteItemActive]: selected,
    }),
    dir: 'auto',
    id,
    key: id,
    onMouseDown,
    part: 'option',
    role: 'option',
    ...component.props,
  });
}
