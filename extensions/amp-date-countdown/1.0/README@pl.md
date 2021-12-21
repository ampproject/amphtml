# Składnik Bento Date Countdown

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-countdown/1.0/README.md
-->

---

## Składnik Preact/React

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-date-countdown>`.

### Przykład: import za pomocą narzędzia npm

```sh
npm install @bentoproject/date-countdown
```

```javascript
import React from 'react';
import {BentoDateCountdown} from '@bentoproject/date-countdown/react';
import '@bentoproject/date-countdown/styles.css';

function App() {
  return (
    <BentoDateCountdown
      datetime={200000000}
      biggestUnit={'HOURS'}
      render={(data) => (
        <div>
          <span>{`${data.days} ${data.dd} ${data.d}`}</span>
          <br />
          <span>{`${data.hours} ${data.hh} ${data.h}`}</span>
          <br />
          <span>{`${data.minutes} ${data.mm} ${data.m}`}</span>
          <br />
          <span>{`${data.seconds} ${data.ss} ${data.s}`}</span>
        </div>
      )}
    />
  );
}
```

### Interaktywność i wykorzystanie interfejsu API

Składnik Bento Date Countdown nie ma wymaganego interfejsu API. Składnik Bento Date Countdown Preact/React natomiast akceptuje właściwość `render`, która renderuje szablon konsumenta. Właściwość `render` powinna być funkcją, której składnik Bento Date Countdown Preact/React może użyć do wyrenderowania swojego szablonu. Wywołanie zwrotne `render` będzie zawierało różne parametry związane z datą, które konsumenci będą mogli interpolować w renderowanym szablonie. Więcej informacji na ten temat zawiera <a href="#render" data-md-type="link">sekcja dotycząca właściwości `render`</a>.

### Układ i styl

Składnik Bento Date Countdown Preact/React umożliwia użytkownikom renderowanie ich własnych szablonów. Szablony te mogą używać stylów inline, znaczników `<style>` i składników Preact/React, które importują własne arkusze stylów.

### Właściwości

#### `datetime`

Właściwość wymagana. Określa datę i godzinę jako datę, ciąg lub liczbę. Jeśli ciąg, musi to być standardowy ciąg daty ISO 8601 (np. 2017-08-02T15:05:05.000Z) lub ciąg `now`. Jeśli ustawiono na `now`, do renderowania szablonu zostanie użyty czas załadowania strony. Jeśli liczba, musi być wartością POSIX epoki Uniksa wyrażoną w milisekundach.

#### `locale`

Ciąg języka internacjonalizacji danej jednostki timera. Domyślną wartością jest `en` (język angielski). Właściwość ta obsługuje wszystkie wartości, które są obsługiwane przez przeglądarkę użytkownika.

#### `whenEnded`

Określa, czy timer ma się zatrzymać, gdy osiągnie 0 sekund. Wartość może być ustawiona na `stop` (domyślnie), aby timer zatrzymał się na 0 sekundach i nie przekroczył daty końcowej lub na `continue`, aby timer kontynuował działanie po osiągnięciu 0 sekund.

#### `biggestUnit`

Umożliwia składnikowi `bento-date-countdown` obliczanie różnicy czasu na podstawie określonej wartości `biggest-unit`. Na przykład, jeśli do końca dnia pozostało `50 dni i 10 godzin`, a `biggest-unit` ma ustawienie `hours`, to w wyniku zostanie wyświetlone `1210 godzin`.

- Obsługiwane wartości: `days`, `hours`, `minutes`, `seconds`.
- Domyślnie: `days`

#### `countUp`

Dołączenie tej właściwości spowoduje odwrócenie kierunku odliczania (odliczanie w górę). Jest to przydatne do wyświetlania czasu, który upłynął od daty docelowej w przeszłości. Aby kontynuować odliczanie, gdy data docelowa znajduje się w przeszłości, należy dołączyć właściwość `when-ended` wraz z wartością `continue`. Jeśli data docelowa przypada w przyszłości, składnik `bento-date-countdown` będzie wyświetlać malejącą (do 0) wartość ujemną.

#### `render`

Opcjonalne wywołanie zwrotne, które powinno wyrenderować szablon. Do wywołania zwrotnego zostanie dostarczony obiekt z właściwościami/wartościami związanymi z datą wyrażoną w sekcji `datetime`. Składnik Bento Date Countdown domyślnie wyświetla [formę daty `localeString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) odpowiednią do danego ustawienia regionalnego i localeOption. Więcej szczegółów na temat sposobu wyświetlania poszczególnych właściwości zawiera sekcja [Zwracane parametry czasowe](#returned-time-parameters).

```typescript
(dateParams: DateParams) => JSXInternal.Element
interface DateParams {
  day: number;
  dayName: string;
  dayNameShort: string;
  dayPeriod: string;
  dayTwoDigit: string;
  hour: number;
  hour12: number;
  hour12TwoDigit: string;
  hourTwoDigit: string;
  iso: string;
  localeString: string;
  minute: number;
  minuteTwoDigit: string;
  month: number;
  monthName: string;
  monthNameShort: string;
  monthTwoDigit: string;
  second: number;
  secondTwoDigit: string;
  timeZoneName: string;
  timeZoneNameShort: string;
  year: number;
  yearTwoDi: string;
}
```

### Zwracane parametry czasowe

Poniższa tabela przedstawia format, który można określić w szablonie Mustache:

Format | Znaczenie
--- | ---
d | dzień — 0, 1, 2,...12, 13..nieskończoność
dd | dzień — 00, 01, 02, 03..nieskończoność
h | godzina — 0, 1, 2,...12, 13..nieskończoność
hh | godzina — 01, 02, 03..nieskończoność
m | minuta — 0, 1, 2,...12, 13..nieskończoność
mm | minuta — 01, 01, 02, 03..nieskończoność
s | sekunda — 0, 1, 2,...12, 13..nieskończoność
ss | sekunda — 00, 01, 02, 03..nieskończoność
days | ciąg internacjonalizacji, dzień lub dni
hours | ciąg internacjonalizacji, godzina lub godziny
minutes | ciąg internacjonalizacji, minuta lub minuty
seconds | ciąg internacjonalizacji, sekunda lub sekundy

#### Przykłady sformatowanych wartości

Ta tabela zawiera przykłady sformatowanych wartości określonych w szablonie Mustache oraz przykładowe dane wyjściowe:

Format | Przykładowe dane wyjściowe | Uwagi
--- | --- | ---
{hh}:{mm}:{ss} | 04:24:06 | -
{h} {hours}, {m} {minutes} i {s} {seconds} | 4 godziny, 1 minuta i 45 sekund | -
{d} {days} {h}:{mm} | 1 dzień 5:03 | -
{d} {days} {h} {hours} {m} {minutes} | 50 dni 5 godzin 10 minut | -
{d} {days} {h} {hours} {m} {minutes} | 20 dni 5 godzin 10 minut | -
{h} {hours} {m} {minutes} | 240 godzin 10 minut | `biggest-unit='hours'`
{d} {days} {h} {hours} {m} {minutes} | 50 天 5 小时 10 分钟 | `locale='zh-cn'`
