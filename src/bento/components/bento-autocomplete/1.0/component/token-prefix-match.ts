import {hasOwn, map, ownProperty} from '#core/types/object';

/**
 * Takes a string, removes '.', and splits by special characters.
 * Returns the resulting array of tokens.
 */
function tokenizeString(inputStr: string) {
  inputStr = inputStr.replace(/[\.]+/g, '');
  return inputStr.split(/[`~(){}_|+\-;:\'",\[\]\\\/ ]+/g);
}

/**
 * Returns the given tokens array as a dictionary of key: token (str) and
 * value: number of occurrences.
 */
function mapFromTokensArray(tokens: string[]) {
  const tokensMap: {[key: string]: number} = map();
  tokens.forEach((token) => {
    const count = hasOwn(tokensMap, token)
      ? ownProperty(tokensMap, token) + 1
      : 1;
    tokensMap[token] = count;
  });
  return tokensMap;
}

/**
 * Returns true if the given input string is a token-prefix match on the
 * given item string. Assumes toLocaleLowerCase() has been performed on both
 * parameters.
 *
 * Matches:
 * washington dc, dc
 * washington dc, wash
 * washington dc, dc washington
 * new york ny, new york
 *
 * Non-matches:
 * washington dc, district of columbia
 * washington dc, washington d c
 * washington dc, ashington dc
 */
export function tokenPrefixMatch(item: string, input: string) {
  if (input === '') {
    return true;
  }

  const itemTokens = tokenizeString(item);
  const inputTokens = tokenizeString(input);

  const itemTokensMap = mapFromTokensArray(itemTokens);
  const lastInputToken = inputTokens[inputTokens.length - 1];
  inputTokens.splice(inputTokens.length - 1, 1);
  let match = true;
  for (let i = 0; i < inputTokens.length; i++) {
    const token = inputTokens[i];
    if (token === '') {
      continue;
    }
    if (!hasOwn(itemTokensMap, token)) {
      match = false;
      break;
    }
    const count = Number(ownProperty(itemTokensMap, token));
    if (count > 1) {
      itemTokensMap[token] = count - 1;
    } else {
      delete itemTokensMap[token];
    }
  }

  // Return that the last input token is a prefix of one of the item tokens
  const remainingItemTokens = Object.keys(itemTokensMap);
  return (
    match &&
    (lastInputToken === '' ||
      remainingItemTokens.some((itemToken) => {
        return itemToken.startsWith(lastInputToken);
      }))
  );
}
