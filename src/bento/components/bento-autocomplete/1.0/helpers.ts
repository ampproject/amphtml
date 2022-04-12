import {tryParseJson} from '#core/types/object/json';

export function getItemElement(
  element: HTMLElement | null
): HTMLElement | null {
  if (!element) {
    return null;
  }
  if (element.getAttribute('role') === 'option') {
    return element as HTMLDivElement;
  }
  return getItemElement(element.parentElement);
}

export function getSelectedTextValue(element: HTMLElement | null): string {
  return (
    element?.getAttribute('data-value') ||
    element?.firstElementChild?.getAttribute('data-value') ||
    element?.textContent?.trim() ||
    ''
  );
}

export function getSelectedObjectValue(
  element: HTMLElement | null
): object | null {
  if (!element?.hasAttribute('data-json')) {
    return null;
  }
  return tryParseJson(element.getAttribute('data-json')!, (error) => {
    throw error;
  });
}

export function getEnabledResults(
  element: HTMLElement | null
): NodeListOf<Element> | undefined {
  return element?.querySelectorAll('[role="option"]:not([data-disabled=true])');
}
