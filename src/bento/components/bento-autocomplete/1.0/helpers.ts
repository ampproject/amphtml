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

export function getTextValue(element: HTMLElement | null): string {
  return element?.getAttribute('data-value') || element?.textContent || '';
}

export function getResults(
  element: HTMLElement | null
): NodeListOf<Element> | undefined {
  return element?.querySelectorAll('[role="option"]:not([data-disabled=true])');
}
