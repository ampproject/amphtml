# Składnik Bento Date Display

Przed dodaniem własnych stylów musisz dołączyć wymaganą bibliotekę CSS każdego składnika Bento, aby zagwarantować prawidłowe ładowanie. Można też użyć dostępnych inline uproszczonych stylów sprzed uaktualnienia. Patrz sekcja [Układ i styl](#layout-and-style).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-display/1.0/README.md
-->

---

## Składnik internetowy

Poniższe przykłady przedstawiają użycie składnika internetowego `<bento-date-display>`.

### Przykład: import za pomocą narzędzia npm

```sh
npm install @bentoproject/date-display
```

```javascript
import React from 'react';
import {BentoDateDisplay} from '@bentoproject/date-display/react';
import '@bentoproject/date-display/styles.css';

function App() {
  return (
    <BentoDateDisplay
      datetime={dateTime}
      displayIn={displayIn}
      locale={locale}
      render={(date) => (
        <div>{`ISO: ${date.iso}; locale: ${date.localeString}`}</div>
      )}
    />
  );
}
```

### Interaktywność i wykorzystanie interfejsu API

Składnik Bento Date Display nie ma wymaganego interfejsu API. Składnik Bento Date Display Preact/React natomiast akceptuje właściwość `render`, która renderuje szablon konsumenta. Właściwość `render` powinna być funkcją, której składnik Bento Date Display Preact/React może użyć do wyrenderowania swojego szablonu. Wywołanie zwrotne `render` będzie zawierało różne parametry związane z datą, które konsumenci będą mogli interpolować w renderowanym szablonie. Więcej informacji na ten temat zawiera <a href="#render" data-md-type="link">sekcja dotycząca właściwości `render`</a>.

### Układ i styl

Składnik Bento Date Display Preact/React umożliwia użytkownikom renderowanie ich własnych szablonów. Szablony te mogą używać stylów inline, znaczników `<style>` i składników Preact/React, które importują własne arkusze stylów.

### Właściwości

#### `datetime`

Właściwość wymagana. Określa datę i godzinę jako datę, ciąg lub liczbę. Jeśli ciąg, musi to być standardowy ciąg daty ISO 8601 (np. 2017-08-02T15:05:05.000Z) lub ciąg `now`. Jeśli ustawiono na `now`, do renderowania szablonu zostanie użyty czas załadowania strony. Jeśli liczba, musi być wartością POSIX epoki Uniksa wyrażoną w milisekundach.

#### `displayIn`

Właściwość opcjonalna, która może mieć postać `"utc"` lub `"local"`, domyślnie `"local"`. Właściwość ta wskazuje, w której strefie czasowej ma być wyświetlana data. Jeśli ustawiona jest na wartość `"utc"`, składnik przekonwertuje podaną datę na UTC.

#### `locale`

Ciąg języka internacjonalizacji danej jednostki timera. Domyślną wartością jest `en` (język angielski). Właściwość ta obsługuje wszystkie wartości, które są obsługiwane przez przeglądarkę użytkownika.

#### `localeOptions`

Obiekt `localeOptions` obsługuje wszystkie opcje parametru [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters), określającego styl formatowania stosowany do formatu `localeString`.

Uwaga: jeśli właściwość `displayIn` ma ustawienie `utc`, wartość `localeOptions.timeZone` zostanie automatycznie przekonwertowana na `UTC`.

#### `render`

Opcjonalne wywołanie zwrotne, które powinno wyrenderować szablon. Do wywołania zwrotnego zostanie dostarczony obiekt z właściwościami/wartościami związanymi z datą wyrażoną w sekcji `datetime`. Składnik Bento Date Display domyślnie wyświetla [formę daty `localeString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) odpowiednią do danego ustawienia regionalnego i localeOption. Więcej szczegółów na temat sposobu wyświetlania poszczególnych właściwości zawiera sekcja [Zwracane parametry czasowe](#returned-time-parameters).

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
day | 1, 2, ...12, 13 itd.
dayName | ciąg,
dayNameShort | ciąg,
dayPeriod | ciąg,
dayTwoDigit | 01, 02, 03, ..., 12, 13 itd.
hour | 0, 1, 2, 3, ..., 12, 13, ..., 22, 23
hour12 | 1, 2, 3, ..., 12, 1, 2, ..., 11, 12
hour12TwoDigit | 01, 02, ..., 12, 01, 02, ..., 11, 12
hourTwoDigit | 00, 01, 02, ..., 12, 13, ..., 22, 23
iso | Ciąg daty wg normy ISO8601, np. 2019-01-23T15:31:21.213Z,
localeString | Ciąg z reprezentacją zależną od języka.
minute | 0, 1, 2, ..., 58, 59
minuteTwoDigit | 00, 01, 02, ..., 58, 59
month | 1, 2, 3, ..., 12
monthName | Zinternacjonalizowany ciąg nazwy miesiąca.
monthNameShort | Skrócony zinternacjonalizowany ciąg nazwy miesiąca.
monthTwoDigit | 01, 02, ..., 11, 12
second | 0, 1, 2, ..., 58, 59
secondTwoDigit | 00, 01, 02, ..., 58, 59
timeZoneName | Zinternacjonalizowana strefa czasowa, np. `Pacyfik (czas letni)`
timeZoneNameShort | Skrócona zinternacjonalizowana strefa czasowa, np. `PST`
year | 0, 1, 2, ..., 1999, 2000, 2001 itd.
yearTwoDigit | 00, 01, 02, ..., 17, 18, 19, ..., 98, 99
