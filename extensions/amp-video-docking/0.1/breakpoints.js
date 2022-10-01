/** @typedef {{className: string, minWidth: number}} */
export let SyntheticBreakpointDef;

/**
 * @param {!Element} element
 * @param {number} width
 * @param {!Array<!SyntheticBreakpointDef>} breakpoints
 */
export function applyBreakpointClassname(element, width, breakpoints) {
  // sort by minWidth descending
  breakpoints = breakpoints.sort((a, b) => b.minWidth - a.minWidth);

  let maxBreakpoint = -1;
  breakpoints.forEach((breakpoint) => {
    const {className, minWidth} = breakpoint;
    if (minWidth <= width && minWidth > maxBreakpoint) {
      element.classList.add(className);
      maxBreakpoint = minWidth;
    } else {
      element.classList.remove(className);
    }
  });
}
