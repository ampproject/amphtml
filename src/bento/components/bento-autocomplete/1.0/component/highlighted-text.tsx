import * as Preact from '#preact';

type HighlightedTextProps = {
  substring: string;
  text: string;
  fuzzy?: boolean;
};

export function HighlightedText({
  fuzzy,
  substring,
  text,
}: HighlightedTextProps) {
  const lowerCaseSubstring = substring.toLocaleLowerCase();
  const lowerCaseText = text.toLocaleLowerCase();

  if (fuzzy) {
    return (
      <>
        {text.split('').map((char) => {
          if (lowerCaseSubstring.includes(char.toLocaleLowerCase())) {
            return <span class="autocomplete-partial">{char}</span>;
          }
          return char;
        })}
      </>
    );
  }

  const substringStart = lowerCaseText.indexOf(lowerCaseSubstring);
  const substringEnd = substringStart + substring.length;
  return (
    <>
      {text.slice(0, substringStart)}
      <span class="autocomplete-partial">
        {text.slice(substringStart, substringEnd)}
      </span>
      {text.slice(substringEnd, text.length)}
    </>
  );
}
