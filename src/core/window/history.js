/**
 * Gets state from History.
 * But IE11 throws if there is no state.
 *
 * @param {History} history
 * @return {*}
 */
export function getHistoryState(history) {
  try {
    return history.state;
  } catch (e) {
    return null;
  }
}
