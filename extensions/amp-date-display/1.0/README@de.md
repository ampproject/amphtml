# Bento Date Display

Zeigt Zeitdaten an, die du auf deiner Seite rendern kannst. Durch die Angabe bestimmter [Attribute](#attributes) im Tag für Bento Date Display gibt die Erweiterung für Bento Date Display eine Liste von Zeitparametern zurück, die du zum Rendern [an eine amp-mustache Vorlage](../../amp-mustache/amp-mustache.md) übergeben kannst. In der nachfolgenden [Liste findest du alle zurückgegebenen Zeitparameter](#returned-time-parameters).

<!--
## Web Component

TODO(https://go.amp.dev/issue/36619): Restore this section. We don't include it because we don't support <template> in Bento Web Components yet.

An older version of this file contains the removed section, though it's incorrect:

https://github.com/ampproject/amphtml/blob/422d171e87571c4d125a2bf956e78e92444c10e8/extensions/amp-date-display/1.0/README.md
-->

---

## Preact/React Komponente

Die folgenden Beispiele demonstrieren die Verwendung von `<BentoDateDisplay>` als funktionale Komponente, die mit den Bibliotheken Preact oder React verwendet werden kann.

### Beispiel: Import via npm

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

### Interaktivität und API Nutzung

Die Komponente "Bento Date Display" hat keine imperative API. Die Preact/React Komponente für Bento Date Display akzeptiert jedoch die Eigenschaft `render`, die das Template des Consumers rendert. Diese `render` Eigenschaft sollte eine Funktion sein, welche die Preact/React Komponente für Bento Date Display verwenden kann, um ihr Template zu rendern. Dem `render` Callback werden zahlreiche datumsbezogene Parameter bereitgestellt, die Consumer im gerenderten Template interpolieren können. Weitere Informationen findest du im <a href="#render" data-md-type="link">Abschnitt `render`</a>.

### Layout und Style

Die Preact/React Komponente für Bento Date Display ermöglicht es Consumern, ihre eigenen Templates zu rendern. Diese Templates können Inline Styles, `<style>` Tags und Preact/React Komponenten verwenden, die ihre eigenen Stylesheets importieren.

### Eigenschaften

#### `datetime`

Erforderliche Eigenschaft. Gibt Datum und Uhrzeit als Datum, String oder Zahl an. Bei einem String muss es sich um einen Standard ISO 8601 Datumsstring (z. B. 2017-08-02T15:05:05.000Z) oder den String `now` handeln. Bei Angabe von `now` wird zum Rendern des Templates die Zeit verwendet, zu der die Seite geladen wurde. Soll eine Zahl verwendet werden, so muss ein POSIX Epochenwert in Millisekunden angegeben werden.

#### `displayIn`

Optionale Eigenschaft, die entweder `"utc"` oder `"local"` sein kann und standardmäßig `"local"` ist. Diese Eigenschaft gibt an, in welcher Zeitzone das Datum angezeigt werden soll. Wenn als Wert `"utc"` angegeben ist, konvertiert die Komponente das angegebene Datum zu UTC.

#### `locale`

Ein String für die Sprache der Internationalisierung für jede Zeiteinheit. Der Standardwert ist `en` (für Englisch). Diese Eigenschaft unterstützt alle Werte, die vom Browser des Benutzers unterstützt werden.

#### `localeOptions`

Das Objekt `localeOptions` unterstützt alle Optionen unter dem Parameter [Intl.DateTimeFormat.options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters), welcher den Formatierungsstil angibt, der für das Format `localeString` verwendet werden soll.

Beachte, dass der Wert von `localeOptions.timeZone` automatisch zu `UTC` konvertiert wird, wenn die Eigenschaft `displayIn` den Wert `utc` hat.

#### `render`

Optionaler Callback, der ein Template rendern soll. Dem Callback wird ein Objekt mit Eigenschaften/Werten bereitgestellt, die sich auf das in `datetime` angegebene Datum beziehen. Standardmäßig zeigt die Komponente "Bento Date Display" die [`localeString` Form des Datums](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString) für die angegebenen Eigenschaften "locale" und "localeOption" an. Weitere Informationen zur Anzeige der einzelnen Eigenschaften findest du im [Abschnitt "Zurückgegebene Zeitparameter"](#returned-time-parameters).

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

### Zurückgegebene Zeitparameter

Diese Tabelle enthält die Formate, die du in deinem Moustache Template angeben kannst:

| Format            | Bedeutung                                                          |
| ----------------- | ------------------------------------------------------------------ |
| day               | 1, 2, ...12, 13 etc.                                               |
| dayName           | String,                                                            |
| dayNameShort      | String,                                                            |
| dayPeriod         | String,                                                            |
| dayTwoDigit       | 01, 02, 03, ..., 12, 13 etc.                                       |
| hour              | 0, 1, 2, 3, ..., 12, 13, ..., 22, 23                               |
| hour12            | 1, 2, 3, ..., 12, 1, 2, ..., 11, 12                                |
| hour12TwoDigit    | 01, 02, ..., 12, 01, 02, ..., 11, 12                               |
| hourTwoDigit      | 00, 01, 02, ..., 12, 13, ..., 22, 23                               |
| iso               | Ein Standard ISO8601 Datumsstring, z. B. 2019-01-23T15:31:21.213Z, |
| localeString      | String mit sprachabhängiger Darstellung.                           |
| minute            | 0, 1, 2, ..., 58, 59                                               |
| minuteTwoDigit    | 00, 01, 02, ..., 58, 59                                            |
| month             | 1, 2, 3, ..., 12                                                   |
| monthName         | String mit internationalisiertem Monatsnamen,                      |
| monthNameShort    | String mit internationalisierter Abkürzung für den Monatsnamen,    |
| monthTwoDigit     | 01, 02, ..., 11, 12                                                |
| second            | 0, 1, 2, ..., 58, 59                                               |
| secondTwoDigit    | 00, 01, 02, ..., 58, 59                                            |
| timeZoneName      | Internationalisierte Zeitzone, z. B. `Pacific Daylight Time`       |
| timeZoneNameShort | Internationalisierte Zeitzone, Abkürzung, z. B. `PST`              |
| year              | 0, 1, 2, ..., 1999, 2000, 2001 etc.                                |
| yearTwoDigit      | 00, 01, 02, ..., 17, 18, 19, ..., 98, 99                           |
